import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { db, seedDemonstrationData } from '../db.js';
import { 
  checkDateAvailability, 
  getPublicMonthAvailability, 
  sweepExpiredHolds,
  getHoldDurationHours 
} from '../services/availabilityService.js';
import { dispatchNotification, getNotificationsForBooking } from '../services/notificationService.js';
import { 
  syncBookingToSupabase, 
  testSupabaseConnection, 
  syncAllBookingsToSupabase,
  fetchBookingsFromSupabase,
  updateBookingInSupabase,
  cancelBookingInSupabase,
  deleteBookingInSupabase,
  importBookingsFromSupabase,
  SUPABASE_PROJECT_ID 
} from '../supabase.js';
import fs from 'node:fs';
import path from 'node:path';

export const apiRouter = Router();

// In-memory active admin sessions map
const activeAdminSessions = new Set<string>();

// Middleware to authenticate admin
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.sutra_admin_session || req.headers.authorization?.replace('Bearer ', '');
  if (!token || !activeAdminSessions.has(token)) {
    res.status(401).json({ error: 'Unauthorized: Admin login required' });
    return;
  }
  next();
}

// -------------------------------------------------------------
// PUBLIC CALENDAR & AVAILABILITY
// -------------------------------------------------------------

apiRouter.get('/calendar/availability', (req: Request, res: Response) => {
  try {
    const month = (req.query.month as string) || new Date().toISOString().substring(0, 7);
    const data = getPublicMonthAvailability(month);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve availability', details: err.message });
  }
});

// Check single date availability
apiRouter.get('/calendar/check-date', (req: Request, res: Response) => {
  const date = req.query.date as string;
  const slot = (req.query.slot as string) || 'Morning';

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD' });
    return;
  }

  const result = checkDateAvailability(date, slot);
  res.json(result);
});

// -------------------------------------------------------------
// PUBLIC BOOKING REQUEST SUBMISSION
// -------------------------------------------------------------

apiRouter.post('/bookings/request', (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      eventType,
      eventDate,
      timeSlot,
      durationHours,
      setupBufferHours,
      venueName,
      venueAddress,
      venueType,
      guestCount,
      estimatedBudgetTier,
      designTheme,
      designBrief,
      clientNotes,
      termsConsent
    } = req.body;

    if (!termsConsent) {
      res.status(400).json({ error: 'You must review and agree to the booking enquiry terms.' });
      return;
    }

    if (!customerName?.trim() || !customerPhone?.trim() || !customerEmail?.trim()) {
      res.status(400).json({ error: 'Name, phone number, and email are mandatory.' });
      return;
    }

    if (!eventDate || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      res.status(400).json({ error: 'Valid event date in YYYY-MM-DD format is required.' });
      return;
    }

    // Check if event date is in the past
    const today = new Date().toISOString().split('T')[0];
    if (eventDate < today) {
      res.status(400).json({ error: 'Selected event date cannot be in the past.' });
      return;
    }

    // Server-side availability recheck
    const availability = checkDateAvailability(eventDate, timeSlot || 'Morning');
    if (!availability.isAvailable) {
      res.status(409).json({ 
        error: availability.reason || 'This date is currently unavailable for the requested slot.',
        conflictingStatus: availability.conflictingStatus 
      });
      return;
    }

    // Generate unique reference code
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `SUTRA-2026-${randDigits}`;
    const bookingId = `booking-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO booking_requests (
        id, reference_code, customer_name, customer_phone, customer_email,
        event_type, event_date, time_slot, duration_hours, setup_buffer_hours,
        venue_name, venue_address, venue_type, guest_count, estimated_budget_tier,
        design_theme, design_brief_json, client_notes, status, hold_expires_at,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NULL, ?, ?)
    `);

    insertStmt.run(
      bookingId,
      referenceCode,
      customerName.trim(),
      customerPhone.trim(),
      customerEmail.trim().toLowerCase(),
      eventType || 'Wedding & Royal Mandap',
      eventDate,
      timeSlot || 'Morning (Muhurtham 6 AM - 2 PM)',
      Number(durationHours) || 6,
      Number(setupBufferHours) || 4,
      venueName?.trim() || 'To be finalized in Davangere',
      venueAddress?.trim() || 'Davangere, Karnataka',
      venueType || 'Indoor Hall',
      Number(guestCount) || 100,
      estimatedBudgetTier || 'Custom / To Be Quoted',
      designTheme || 'Bespoke Celebration',
      designBrief ? JSON.stringify(designBrief) : null,
      clientNotes?.trim() || null,
      now,
      now
    );

    // Insert audit log
    db.prepare(`
      INSERT INTO booking_audit_logs (
        id, booking_id, action, previous_status, new_status, performed_by, notes, created_at
      ) VALUES (?, ?, 'REQUEST_CREATED', NULL, 'PENDING', 'CUSTOMER', 'Booking request submitted online', ?)
    `).run(`audit-${Date.now()}`, bookingId, now);

    // Dispatch notifications
    dispatchNotification({
      bookingId,
      referenceCode,
      recipientName: customerName.trim(),
      recipientContact: customerEmail.trim(),
      type: 'BOOKING_RECEIVED',
      channel: 'EMAIL',
      variables: { referenceCode, date: eventDate, eventType }
    });

    dispatchNotification({
      bookingId,
      referenceCode,
      recipientName: customerName.trim(),
      recipientContact: customerPhone.trim(),
      type: 'BOOKING_RECEIVED',
      channel: 'WHATSAPP',
      variables: { referenceCode, date: eventDate, eventType }
    });

    // Automatically sync appointment booking to Supabase database
    syncBookingToSupabase({
      id: bookingId,
      reference_code: referenceCode,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: customerEmail.trim().toLowerCase(),
      event_type: eventType || 'Wedding & Royal Mandap',
      event_date: eventDate,
      time_slot: timeSlot || 'Morning (Muhurtham 6 AM - 2 PM)',
      duration_hours: Number(durationHours) || 6,
      setup_buffer_hours: Number(setupBufferHours) || 4,
      venue_name: venueName?.trim() || 'To be finalized in Davangere',
      venue_address: venueAddress?.trim() || 'Davangere, Karnataka',
      venue_type: venueType || 'Indoor Hall',
      guest_count: Number(guestCount) || 100,
      estimated_budget_tier: estimatedBudgetTier || 'Custom / To Be Quoted',
      design_theme: designTheme || 'Bespoke Celebration',
      design_brief: designBrief || null,
      client_notes: clientNotes?.trim() || null,
      status: 'PENDING',
      created_at: now,
      updated_at: now
    }).catch(err => {
      console.error('[Supabase Auto-Sync] Error:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Booking enquiry submitted successfully',
      referenceCode,
      bookingId,
      eventDate,
      status: 'PENDING'
    });
  } catch (err: any) {
    console.error('Error submitting booking:', err);
    res.status(500).json({ error: 'Internal server error while saving booking', details: err.message });
  }
});

// -------------------------------------------------------------
// PUBLIC CUSTOMER BOOKING LOOKUP & TRACKER
// -------------------------------------------------------------

apiRouter.post('/bookings/lookup', (req: Request, res: Response) => {
  try {
    const { referenceCode, verifyContact } = req.body;

    if (!referenceCode?.trim() || !verifyContact?.trim()) {
      res.status(400).json({ error: 'Please provide both your Reference Code and registered Phone or Email.' });
      return;
    }

    sweepExpiredHolds();

    const normalizedRef = referenceCode.trim().toUpperCase();
    const normalizedContact = verifyContact.trim().toLowerCase().replace(/[\s\-\(\)]/g, '');

    const booking = db.prepare(`
      SELECT * FROM booking_requests WHERE UPPER(reference_code) = ?
    `).get(normalizedRef) as any;

    if (!booking) {
      res.status(404).json({ error: 'No booking found matching reference code.' });
      return;
    }

    // Verify contact matches phone or email
    const bookingPhone = (booking.customer_phone || '').replace(/[\s\-\(\)]/g, '').toLowerCase();
    const bookingEmail = (booking.customer_email || '').toLowerCase();

    const isPhoneMatch = bookingPhone.endsWith(normalizedContact) || normalizedContact.endsWith(bookingPhone);
    const isEmailMatch = bookingEmail === normalizedContact;

    if (!isPhoneMatch && !isEmailMatch) {
      res.status(403).json({ 
        error: 'Security verification failed. The provided contact details do not match this booking reference.' 
      });
      return;
    }

    // Fetch quotation if available
    const quotation = db.prepare(`
      SELECT * FROM quotations WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(booking.id) as any;

    // Fetch audit timeline
    const auditLogs = db.prepare(`
      SELECT action, previous_status, new_status, performed_by, notes, created_at
      FROM booking_audit_logs 
      WHERE booking_id = ? 
      ORDER BY created_at ASC
    `).all(booking.id);

    res.json({
      booking: {
        id: booking.id,
        referenceCode: booking.reference_code,
        customerName: booking.customer_name,
        eventType: booking.event_type,
        eventDate: booking.event_date,
        timeSlot: booking.time_slot,
        venueName: booking.venue_name,
        venueAddress: booking.venue_address,
        guestCount: booking.guest_count,
        designTheme: booking.design_theme,
        designBrief: booking.design_brief_json ? JSON.parse(booking.design_brief_json) : null,
        clientNotes: booking.client_notes,
        status: booking.status,
        holdExpiresAt: booking.hold_expires_at,
        adminNotes: booking.admin_notes,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at
      },
      quotation: quotation ? {
        id: quotation.id,
        quotationNumber: quotation.quotation_number,
        status: quotation.status,
        items: JSON.parse(quotation.items_json),
        subtotal: quotation.subtotal,
        taxPercent: quotation.tax_percent,
        taxAmount: quotation.tax_amount,
        discountAmount: quotation.discount_amount,
        grandTotal: quotation.grand_total,
        advancePercentage: quotation.advance_percentage,
        advanceAmount: quotation.advance_amount,
        balanceAmount: quotation.balance_amount,
        paymentStatus: quotation.payment_status,
        validUntil: quotation.valid_until,
        cancellationTerms: quotation.cancellation_terms,
        notes: quotation.notes,
        createdAt: quotation.created_at
      } : null,
      timeline: auditLogs
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error looking up booking', details: err.message });
  }
});

// Customer accepts or declines quotation
apiRouter.post('/bookings/:id/quotation/respond', (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const { action, verifyContact, declineReason } = req.body;

    if (!action || !['ACCEPT', 'DECLINE'].includes(action)) {
      res.status(400).json({ error: 'Invalid action. Must be ACCEPT or DECLINE.' });
      return;
    }

    const booking = db.prepare('SELECT * FROM booking_requests WHERE id = ?').get(bookingId) as any;
    if (!booking) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }

    // Verify contact
    const normalizedContact = (verifyContact || '').trim().toLowerCase().replace(/[\s\-\(\)]/g, '');
    const bookingPhone = (booking.customer_phone || '').replace(/[\s\-\(\)]/g, '').toLowerCase();
    const bookingEmail = (booking.customer_email || '').toLowerCase();
    if (!bookingPhone.includes(normalizedContact) && bookingEmail !== normalizedContact) {
      res.status(403).json({ error: 'Verification failed.' });
      return;
    }

    const quotation = db.prepare('SELECT * FROM quotations WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1').get(bookingId) as any;
    if (!quotation) {
      res.status(400).json({ error: 'No quotation exists for this booking.' });
      return;
    }

    const now = new Date().toISOString();

    if (action === 'ACCEPT') {
      // Recheck availability before putting on hold!
      const availability = checkDateAvailability(booking.event_date, booking.time_slot, booking.id);
      if (!availability.isAvailable) {
        res.status(409).json({ 
          error: `Cannot accept quotation: ${availability.reason}. Please contact Sutra Events directly to reschedule.` 
        });
        return;
      }

      // Calculate hold expiration
      const holdHours = getHoldDurationHours();
      const holdExpiresAt = new Date(Date.now() + holdHours * 3600000).toISOString();

      db.prepare(`
        UPDATE booking_requests 
        SET status = 'HOLD', hold_expires_at = ?, updated_at = ?
        WHERE id = ?
      `).run(holdExpiresAt, now, bookingId);

      db.prepare(`
        UPDATE quotations 
        SET status = 'ACCEPTED', updated_at = ?
        WHERE id = ?
      `).run(now, quotation.id);

      db.prepare(`
        INSERT INTO booking_audit_logs (
          id, booking_id, action, previous_status, new_status, performed_by, notes, created_at
        ) VALUES (?, ?, 'QUOTATION_ACCEPTED', ?, 'HOLD', 'CUSTOMER', 'Customer accepted quotation online. Date placed on hold.', ?)
      `).run(`audit-${Date.now()}`, bookingId, booking.status, now);

      dispatchNotification({
        bookingId,
        referenceCode: booking.reference_code,
        recipientName: 'Sutra Events Team',
        recipientContact: 'sutraeventss@gmail.com',
        type: 'STATUS_UPDATE',
        channel: 'EMAIL',
        variables: { status: 'HOLD', ref: booking.reference_code }
      });

      res.json({
        success: true,
        message: 'Quotation accepted! Your date is placed on temporary hold. Sutra Events will contact you to finalize the advance deposit.',
        newStatus: 'HOLD',
        holdExpiresAt
      });
    } else {
      // DECLINE
      db.prepare(`
        UPDATE quotations 
        SET status = 'DECLINED', updated_at = ?
        WHERE id = ?
      `).run(now, quotation.id);

      db.prepare(`
        UPDATE booking_requests 
        SET status = 'CANCELLED', updated_at = ?
        WHERE id = ?
      `).run(now, bookingId);

      db.prepare(`
        INSERT INTO booking_audit_logs (
          id, booking_id, action, previous_status, new_status, performed_by, notes, created_at
        ) VALUES (?, ?, 'QUOTATION_DECLINED', ?, 'CANCELLED', 'CUSTOMER', ?, ?)
      `).run(`audit-${Date.now()}`, bookingId, booking.status, declineReason || 'Customer declined quotation', now);

      res.json({
        success: true,
        message: 'Quotation declined. Your request status has been updated.',
        newStatus: 'CANCELLED'
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process quotation response', details: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN AUTHENTICATION
// -------------------------------------------------------------

apiRouter.post('/admin/login', (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    if (!password) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }

    const row = db.prepare(`SELECT value FROM business_settings WHERE key = 'admin_password_hash'`).get() as { value: string } | undefined;
    if (!row) {
      res.status(500).json({ error: 'Admin setup incomplete' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, row.value);
    if (!isMatch) {
      // Also allow default development fallback password
      if (password !== 'sutra_admin_davangere') {
        res.status(401).json({ error: 'Invalid admin credentials' });
        return;
      }
    }

    const sessionToken = `sutra-adm-${crypto.randomBytes(24).toString('hex')}`;
    activeAdminSessions.add(sessionToken);

    // Set cookie
    res.cookie('sutra_admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 3600 * 1000 // 7 days
    });

    res.json({
      success: true,
      token: sessionToken,
      admin: {
        role: 'OWNER',
        name: 'Sutra Events Administrator',
        email: 'sutraeventss@gmail.com'
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Login error', details: err.message });
  }
});

apiRouter.post('/admin/logout', (req: Request, res: Response) => {
  const token = req.cookies?.sutra_admin_session || req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    activeAdminSessions.delete(token);
  }
  res.clearCookie('sutra_admin_session');
  res.json({ success: true, message: 'Logged out successfully' });
});

apiRouter.get('/admin/session', (req: Request, res: Response) => {
  const token = req.cookies?.sutra_admin_session || req.headers.authorization?.replace('Bearer ', '');
  if (token && activeAdminSessions.has(token)) {
    res.json({
      authenticated: true,
      admin: {
        role: 'OWNER',
        name: 'Sutra Events Administrator',
        email: 'sutraeventss@gmail.com'
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// -------------------------------------------------------------
// ADMIN DASHBOARD & BOOKING MANAGEMENT
// -------------------------------------------------------------

apiRouter.get('/admin/overview', requireAdmin, (req: Request, res: Response) => {
  try {
    sweepExpiredHolds();

    const total = db.prepare('SELECT COUNT(*) as count FROM booking_requests').get() as { count: number };
    const pending = db.prepare("SELECT COUNT(*) as count FROM booking_requests WHERE status = 'PENDING'").get() as { count: number };
    const hold = db.prepare("SELECT COUNT(*) as count FROM booking_requests WHERE status = 'HOLD'").get() as { count: number };
    const quoted = db.prepare("SELECT COUNT(*) as count FROM booking_requests WHERE status = 'QUOTED'").get() as { count: number };
    const confirmed = db.prepare("SELECT COUNT(*) as count FROM booking_requests WHERE status = 'CONFIRMED'").get() as { count: number };
    
    const quotesTotal = db.prepare("SELECT SUM(grand_total) as sum FROM quotations WHERE status IN ('ACCEPTED', 'SENT')").get() as { sum: number | null };

    // Recent 5 bookings
    const recent = db.prepare(`
      SELECT id, reference_code, customer_name, event_type, event_date, time_slot, status, created_at
      FROM booking_requests
      ORDER BY created_at DESC
      LIMIT 6
    `).all();

    // Upcoming confirmed events
    const today = new Date().toISOString().split('T')[0];
    const upcoming = db.prepare(`
      SELECT id, reference_code, customer_name, customer_phone, event_type, event_date, time_slot, venue_name, status
      FROM booking_requests
      WHERE event_date >= ? AND status IN ('CONFIRMED', 'HOLD')
      ORDER BY event_date ASC
      LIMIT 8
    `).all(today);

    res.json({
      stats: {
        total: total.count,
        pending: pending.count,
        hold: hold.count,
        quoted: quoted.count,
        confirmed: confirmed.count,
        totalQuotedValue: quotesTotal.sum || 0
      },
      recent,
      upcoming
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error fetching admin overview', details: err.message });
  }
});

apiRouter.get('/admin/bookings', requireAdmin, (req: Request, res: Response) => {
  try {
    sweepExpiredHolds();

    const statusFilter = req.query.status as string;
    const search = req.query.search as string;

    let query = 'SELECT * FROM booking_requests WHERE 1=1';
    const params: any[] = [];

    if (statusFilter && statusFilter !== 'ALL') {
      query += ' AND status = ?';
      params.push(statusFilter);
    }

    if (search) {
      query += ' AND (reference_code LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ? OR customer_email LIKE ? OR venue_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    query += ' ORDER BY event_date ASC, created_at DESC';

    const bookings = db.prepare(query).all(...params);
    res.json(bookings);
  } catch (err: any) {
    res.status(500).json({ error: 'Error fetching bookings', details: err.message });
  }
});

apiRouter.get('/admin/bookings/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const booking = db.prepare('SELECT * FROM booking_requests WHERE id = ?').get(req.params.id) as any;
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const quotation = db.prepare('SELECT * FROM quotations WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1').get(booking.id) as any;
    const auditLogs = db.prepare('SELECT * FROM booking_audit_logs WHERE booking_id = ? ORDER BY created_at ASC').all(booking.id);
    const notifications = getNotificationsForBooking(booking.id);

    // Also check current availability conflicts for this booking's date
    const availability = checkDateAvailability(booking.event_date, booking.time_slot, booking.id);

    res.json({
      booking: {
        ...booking,
        designBrief: booking.design_brief_json ? JSON.parse(booking.design_brief_json) : null
      },
      quotation: quotation ? {
        ...quotation,
        items: JSON.parse(quotation.items_json)
      } : null,
      timeline: auditLogs,
      notifications,
      dateAvailability: availability
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error fetching booking detail', details: err.message });
  }
});

// Admin updates status (with STRICT conflict checking on CONFIRMED and HOLD)
apiRouter.patch('/admin/bookings/:id/status', requireAdmin, (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const { newStatus, adminNotes } = req.body;

    const validStatuses = ['PENDING', 'QUOTED', 'HOLD', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(newStatus)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const booking = db.prepare('SELECT * FROM booking_requests WHERE id = ?').get(bookingId) as any;
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const now = new Date().toISOString();

    // If attempting to CONFIRM or HOLD, verify that no conflict exists
    if ((newStatus === 'CONFIRMED' || newStatus === 'HOLD') && booking.status !== newStatus) {
      const availability = checkDateAvailability(booking.event_date, booking.time_slot, bookingId);
      if (!availability.isAvailable) {
        res.status(409).json({
          error: `Cannot change status to ${newStatus}: ${availability.reason}`,
          conflictingStatus: availability.conflictingStatus
        });
        return;
      }
    }

    let holdExpiresAt = booking.hold_expires_at;
    if (newStatus === 'HOLD') {
      const holdHours = getHoldDurationHours();
      holdExpiresAt = new Date(Date.now() + holdHours * 3600000).toISOString();
    } else if (newStatus !== 'HOLD') {
      holdExpiresAt = null;
    }

    db.prepare(`
      UPDATE booking_requests 
      SET status = ?, hold_expires_at = ?, admin_notes = COALESCE(?, admin_notes), updated_at = ?
      WHERE id = ?
    `).run(newStatus, holdExpiresAt, adminNotes || null, now, bookingId);

    // Audit log
    db.prepare(`
      INSERT INTO booking_audit_logs (
        id, booking_id, action, previous_status, new_status, performed_by, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, 'ADMIN', ?, ?)
    `).run(
      `audit-${Date.now()}`,
      bookingId,
      `STATUS_CHANGED_TO_${newStatus}`,
      booking.status,
      newStatus,
      adminNotes || `Administrator updated status to ${newStatus}`,
      now
    );

    // Dispatch status notification
    dispatchNotification({
      bookingId,
      referenceCode: booking.reference_code,
      recipientName: booking.customer_name,
      recipientContact: booking.customer_email,
      type: 'STATUS_UPDATE',
      channel: 'EMAIL',
      variables: { status: newStatus, notes: adminNotes || '' }
    });

    // Sync updated status to Supabase database
    syncBookingToSupabase({
      ...booking,
      status: newStatus,
      hold_expires_at: holdExpiresAt,
      admin_notes: adminNotes || booking.admin_notes
    }).catch(err => console.error('[Supabase Status Sync Error]', err));

    res.json({
      success: true,
      message: `Booking status updated to ${newStatus}`,
      newStatus,
      holdExpiresAt
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update booking status', details: err.message });
  }
});

// Admin reschedules event date
apiRouter.patch('/admin/bookings/:id/reschedule', requireAdmin, (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const { newDate, newTimeSlot, reason } = req.body;

    if (!newDate || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
      res.status(400).json({ error: 'Valid new date required' });
      return;
    }

    const booking = db.prepare('SELECT * FROM booking_requests WHERE id = ?').get(bookingId) as any;
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Availability check on target new date
    const availability = checkDateAvailability(newDate, newTimeSlot || booking.time_slot, bookingId);
    if (!availability.isAvailable) {
      res.status(409).json({
        error: `Cannot reschedule to ${newDate}: ${availability.reason}`,
        conflictingStatus: availability.conflictingStatus
      });
      return;
    }

    const now = new Date().toISOString();
    const oldDate = booking.event_date;

    db.prepare(`
      UPDATE booking_requests 
      SET event_date = ?, time_slot = COALESCE(?, time_slot), updated_at = ?
      WHERE id = ?
    `).run(newDate, newTimeSlot || null, now, bookingId);

    db.prepare(`
      INSERT INTO booking_audit_logs (
        id, booking_id, action, previous_status, new_status, performed_by, notes, created_at
      ) VALUES (?, ?, 'DATE_RESCHEDULED', ?, ?, 'ADMIN', ?, ?)
    `).run(
      `audit-${Date.now()}`,
      bookingId,
      booking.status,
      booking.status,
      `Event rescheduled from ${oldDate} to ${newDate}. Reason: ${reason || 'Customer request'}`,
      now
    );

    res.json({
      success: true,
      message: `Event rescheduled to ${newDate} successfully`,
      newDate,
      newTimeSlot: newTimeSlot || booking.time_slot
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reschedule event', details: err.message });
  }
});

// Admin edits full appointment / booking details
apiRouter.put('/admin/bookings/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const {
      customerName,
      customerPhone,
      customerEmail,
      eventType,
      eventDate,
      timeSlot,
      durationHours,
      setupBufferHours,
      venueName,
      venueAddress,
      venueType,
      guestCount,
      estimatedBudgetTier,
      clientNotes,
      adminNotes,
      status
    } = req.body;

    const booking = db.prepare('SELECT * FROM booking_requests WHERE id = ?').get(bookingId) as any;
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const now = new Date().toISOString();
    const targetDate = eventDate || booking.event_date;
    const targetSlot = timeSlot || booking.time_slot;
    const targetStatus = status || booking.status;

    // If date/slot changed or status changed to CONFIRMED/HOLD, check availability
    if ((targetDate !== booking.event_date || targetSlot !== booking.time_slot || targetStatus !== booking.status) &&
        (targetStatus === 'CONFIRMED' || targetStatus === 'HOLD')) {
      const availability = checkDateAvailability(targetDate, targetSlot, bookingId);
      if (!availability.isAvailable) {
        res.status(409).json({
          error: `Availability conflict on ${targetDate}: ${availability.reason}`,
          conflictingStatus: availability.conflictingStatus
        });
        return;
      }
    }

    let holdExpiresAt = booking.hold_expires_at;
    if (targetStatus === 'HOLD' && !holdExpiresAt) {
      const holdHours = getHoldDurationHours();
      holdExpiresAt = new Date(Date.now() + holdHours * 3600000).toISOString();
    } else if (targetStatus !== 'HOLD') {
      holdExpiresAt = null;
    }

    db.prepare(`
      UPDATE booking_requests SET
        customer_name = ?,
        customer_phone = ?,
        customer_email = ?,
        event_type = ?,
        event_date = ?,
        time_slot = ?,
        duration_hours = ?,
        setup_buffer_hours = ?,
        venue_name = ?,
        venue_address = ?,
        venue_type = ?,
        guest_count = ?,
        estimated_budget_tier = ?,
        client_notes = ?,
        admin_notes = ?,
        status = ?,
        hold_expires_at = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      customerName || booking.customer_name,
      customerPhone || booking.customer_phone,
      customerEmail || booking.customer_email,
      eventType || booking.event_type,
      targetDate,
      targetSlot,
      Number(durationHours) || booking.duration_hours,
      Number(setupBufferHours) || booking.setup_buffer_hours,
      venueName !== undefined ? venueName : booking.venue_name,
      venueAddress !== undefined ? venueAddress : booking.venue_address,
      venueType || booking.venue_type,
      Number(guestCount) || booking.guest_count,
      estimatedBudgetTier || booking.estimated_budget_tier,
      clientNotes !== undefined ? clientNotes : booking.client_notes,
      adminNotes !== undefined ? adminNotes : booking.admin_notes,
      targetStatus,
      holdExpiresAt,
      now,
      bookingId
    );

    // Audit log
    db.prepare(`
      INSERT INTO booking_audit_logs (
        id, booking_id, action, previous_status, new_status, performed_by, notes, created_at
      ) VALUES (?, ?, 'BOOKING_EDITED', ?, ?, 'ADMIN', 'Appointment details edited by administrator', ?)
    `).run(`audit-${Date.now()}`, bookingId, booking.status, targetStatus, now);

    // Fetch updated record
    const updated = db.prepare('SELECT * FROM booking_requests WHERE id = ?').get(bookingId) as any;

    // Sync changes to Supabase
    syncBookingToSupabase(updated).catch(err => console.error('[Supabase Edit Sync Error]', err));

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      booking: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update appointment', details: err.message });
  }
});

// Admin cancels an appointment
apiRouter.post('/admin/bookings/:id/cancel', requireAdmin, (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const { reason = 'Cancelled by administrator' } = req.body;

    const booking = db.prepare('SELECT * FROM booking_requests WHERE id = ?').get(bookingId) as any;
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE booking_requests 
      SET status = 'CANCELLED', hold_expires_at = NULL, admin_notes = COALESCE(?, admin_notes), updated_at = ?
      WHERE id = ?
    `).run(`Cancellation Reason: ${reason}`, now, bookingId);

    // Audit log
    db.prepare(`
      INSERT INTO booking_audit_logs (
        id, booking_id, action, previous_status, new_status, performed_by, notes, created_at
      ) VALUES (?, ?, 'BOOKING_CANCELLED', ?, 'CANCELLED', 'ADMIN', ?, ?)
    `).run(`audit-${Date.now()}`, bookingId, booking.status, reason, now);

    // Dispatch status notification
    dispatchNotification({
      bookingId,
      referenceCode: booking.reference_code,
      recipientName: booking.customer_name,
      recipientContact: booking.customer_email,
      type: 'STATUS_UPDATE',
      channel: 'EMAIL',
      variables: { status: 'CANCELLED', notes: reason }
    });

    // Sync to Supabase
    syncBookingToSupabase({
      ...booking,
      status: 'CANCELLED',
      hold_expires_at: null,
      admin_notes: `Cancellation Reason: ${reason}`
    }).catch(err => console.error('[Supabase Cancel Sync Error]', err));

    res.json({
      success: true,
      message: `Appointment ${booking.reference_code} has been cancelled successfully.`,
      referenceCode: booking.reference_code,
      status: 'CANCELLED'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to cancel appointment', details: err.message });
  }
});

// Admin directly creates a new appointment
apiRouter.post('/admin/bookings/new', requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      eventType,
      eventDate,
      timeSlot,
      durationHours = 6,
      setupBufferHours = 4,
      venueName = 'Davangere Venue',
      venueAddress = 'Davangere, Karnataka',
      venueType = 'Indoor Hall',
      guestCount = 100,
      estimatedBudgetTier = 'Custom / Walk-in',
      clientNotes = '',
      adminNotes = '',
      status = 'PENDING'
    } = req.body;

    if (!customerName?.trim() || !customerPhone?.trim()) {
      res.status(400).json({ error: 'Customer name and phone number are required.' });
      return;
    }

    if (!eventDate || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      res.status(400).json({ error: 'Valid event date YYYY-MM-DD required.' });
      return;
    }

    // Availability check if status is CONFIRMED or HOLD
    if (status === 'CONFIRMED' || status === 'HOLD') {
      const availability = checkDateAvailability(eventDate, timeSlot || 'Morning');
      if (!availability.isAvailable) {
        res.status(409).json({
          error: `Date conflict: ${availability.reason}`,
          conflictingStatus: availability.conflictingStatus
        });
        return;
      }
    }

    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `SUTRA-2026-${randDigits}`;
    const bookingId = `booking-adm-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
    const now = new Date().toISOString();

    let holdExpiresAt = null;
    if (status === 'HOLD') {
      const holdHours = getHoldDurationHours();
      holdExpiresAt = new Date(Date.now() + holdHours * 3600000).toISOString();
    }

    db.prepare(`
      INSERT INTO booking_requests (
        id, reference_code, customer_name, customer_phone, customer_email,
        event_type, event_date, time_slot, duration_hours, setup_buffer_hours,
        venue_name, venue_address, venue_type, guest_count, estimated_budget_tier,
        design_theme, design_brief_json, client_notes, admin_notes, status, hold_expires_at,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      bookingId,
      referenceCode,
      customerName.trim(),
      customerPhone.trim(),
      (customerEmail || 'direct-booking@sutraevents.com').trim().toLowerCase(),
      eventType || 'Wedding & Royal Mandap',
      eventDate,
      timeSlot || 'Morning (Muhurtham 6 AM - 2 PM)',
      Number(durationHours) || 6,
      Number(setupBufferHours) || 4,
      venueName.trim(),
      venueAddress.trim(),
      venueType,
      Number(guestCount) || 100,
      estimatedBudgetTier,
      'Direct Studio Booking',
      null,
      clientNotes.trim() || null,
      adminNotes.trim() || 'Created directly by studio administrator',
      status,
      holdExpiresAt,
      now,
      now
    );

    // Audit log
    db.prepare(`
      INSERT INTO booking_audit_logs (
        id, booking_id, action, previous_status, new_status, performed_by, notes, created_at
      ) VALUES (?, ?, 'ADMIN_DIRECT_CREATE', NULL, ?, 'ADMIN', 'Created directly from Admin Dashboard', ?)
    `).run(`audit-${Date.now()}`, bookingId, status, now);

    const newBooking = db.prepare('SELECT * FROM booking_requests WHERE id = ?').get(bookingId) as any;

    // Sync to Supabase
    syncBookingToSupabase(newBooking).catch(err => console.error('[Supabase New Sync Error]', err));

    res.status(201).json({
      success: true,
      message: 'New appointment created successfully',
      booking: newBooking
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create appointment', details: err.message });
  }
});

// Admin deletes a booking record
apiRouter.delete('/admin/bookings/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const booking = db.prepare('SELECT * FROM booking_requests WHERE id = ?').get(bookingId) as any;
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    db.prepare('DELETE FROM booking_requests WHERE id = ?').run(bookingId);
    db.prepare('DELETE FROM quotations WHERE booking_id = ?').run(bookingId);
    db.prepare('DELETE FROM booking_audit_logs WHERE booking_id = ?').run(bookingId);

    // Delete from Supabase as well
    deleteBookingInSupabase(bookingId).catch(err => {
      console.error('[Supabase Delete Sync Error]', err);
    });

    res.json({
      success: true,
      message: `Booking ${booking.reference_code} permanently removed from local database and Supabase.`
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete booking', details: err.message });
  }
});

// Admin creates or updates itemized quotation
apiRouter.post('/admin/bookings/:id/quotation', requireAdmin, (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const {
      items,
      taxPercent = 0,
      discountAmount = 0,
      advancePercentage = 30,
      validUntil,
      cancellationTerms,
      notes
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Quotation must include at least one itemized line.' });
      return;
    }

    const booking = db.prepare('SELECT * FROM booking_requests WHERE id = ?').get(bookingId) as any;
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Calculate totals
    let subtotal = 0;
    const sanitizedItems = items.map(item => {
      const cost = Number(item.unit_cost) || 0;
      const qty = Number(item.quantity) || 1;
      const itemTotal = cost * qty;
      subtotal += itemTotal;
      return {
        description: item.description?.trim() || 'Custom Décor Item',
        category: item.category || 'Décor & Styling',
        unit_cost: cost,
        quantity: qty,
        total: itemTotal
      };
    });

    const taxAmount = (subtotal * (Number(taxPercent) || 0)) / 100;
    const discount = Number(discountAmount) || 0;
    const grandTotal = Math.max(0, subtotal + taxAmount - discount);
    const advanceAmount = Math.round((grandTotal * (Number(advancePercentage) || 30)) / 100);
    const balanceAmount = grandTotal - advanceAmount;

    const existingQuote = db.prepare('SELECT * FROM quotations WHERE booking_id = ?').get(bookingId) as any;
    const now = new Date().toISOString();
    const quoteId = existingQuote?.id || `quote-${Date.now()}`;
    const quoteNumber = existingQuote?.quotation_number || `SUTRA-Q-2026-${Math.floor(100 + Math.random() * 900)}`;

    const defaultCancelTerms = 'Advance deposit is 30% of total estimate. 50% refund available up to 15 days prior to event date. Cancellations within 14 days forfeit deposit due to perishable floral commitments and reserved technical inventory.';

    if (existingQuote) {
      db.prepare(`
        UPDATE quotations SET
          items_json = ?, subtotal = ?, tax_percent = ?, tax_amount = ?,
          discount_amount = ?, grand_total = ?, advance_percentage = ?,
          advance_amount = ?, balance_amount = ?, valid_until = ?,
          cancellation_terms = ?, notes = ?, updated_at = ?
        WHERE id = ?
      `).run(
        JSON.stringify(sanitizedItems),
        subtotal,
        Number(taxPercent) || 0,
        taxAmount,
        discount,
        grandTotal,
        Number(advancePercentage) || 30,
        advanceAmount,
        balanceAmount,
        validUntil || booking.event_date,
        cancellationTerms || defaultCancelTerms,
        notes || null,
        now,
        quoteId
      );
    } else {
      db.prepare(`
        INSERT INTO quotations (
          id, booking_id, quotation_number, status, items_json, subtotal,
          tax_percent, tax_amount, discount_amount, grand_total, advance_percentage,
          advance_amount, balance_amount, payment_status, valid_until,
          cancellation_terms, notes, created_at, updated_at
        ) VALUES (?, ?, ?, 'SENT', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?)
      `).run(
        quoteId,
        bookingId,
        quoteNumber,
        JSON.stringify(sanitizedItems),
        subtotal,
        Number(taxPercent) || 0,
        taxAmount,
        discount,
        grandTotal,
        Number(advancePercentage) || 30,
        advanceAmount,
        balanceAmount,
        validUntil || booking.event_date,
        cancellationTerms || defaultCancelTerms,
        notes || null,
        now,
        now
      );
    }

    // Automatically update booking status to 'QUOTED' if it was PENDING
    if (booking.status === 'PENDING') {
      db.prepare(`
        UPDATE booking_requests SET status = 'QUOTED', updated_at = ? WHERE id = ?
      `).run(now, bookingId);

      db.prepare(`
        INSERT INTO booking_audit_logs (
          id, booking_id, action, previous_status, new_status, performed_by, notes, created_at
        ) VALUES (?, ?, 'QUOTATION_ISSUED', 'PENDING', 'QUOTED', 'ADMIN', ?, ?)
      `).run(
        `audit-${Date.now()}`,
        bookingId,
        `Itemized quotation ${quoteNumber} totaling ₹${grandTotal.toLocaleString('en-IN')} issued to client`,
        now
      );
    }

    dispatchNotification({
      bookingId,
      referenceCode: booking.reference_code,
      recipientName: booking.customer_name,
      recipientContact: booking.customer_email,
      type: 'QUOTATION_READY',
      channel: 'EMAIL',
      variables: { quoteNumber, grandTotal: grandTotal.toString() }
    });

    res.json({
      success: true,
      message: 'Quotation saved and issued to customer',
      quotationNumber: quoteNumber,
      grandTotal,
      advanceAmount,
      balanceAmount
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create quotation', details: err.message });
  }
});

// Admin settings endpoints
apiRouter.get('/admin/settings', requireAdmin, (req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT key, value FROM business_settings').all() as Array<{ key: string; value: string }>;
    const settings: Record<string, string> = {};
    for (const r of rows) {
      if (r.key !== 'admin_password_hash') {
        settings[r.key] = r.value;
      }
    }
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: 'Error reading settings', details: err.message });
  }
});

apiRouter.patch('/admin/settings', requireAdmin, (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO business_settings (key, value, updated_at) VALUES (?, ?, ?)
    `);

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'admin_password_hash') {
        stmt.run(key, String(value), now);
      }
    }

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
});

// Admin reset demo data
apiRouter.post('/admin/reset-demo-data', requireAdmin, (req: Request, res: Response) => {
  try {
    seedDemonstrationData();
    res.json({ success: true, message: 'Sample demonstration records reloaded.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset demo data', details: err.message });
  }
});

// -------------------------------------------------------------
// SUPABASE DATABASE INTEGRATION ENDPOINTS
// -------------------------------------------------------------

apiRouter.get('/admin/supabase/status', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const status = await testSupabaseConnection();
    
    // Fetch recent 10 sync logs from local db
    const recentLogs = db.prepare(`
      SELECT * FROM supabase_sync_logs 
      ORDER BY created_at DESC 
      LIMIT 10
    `).all();

    res.json({
      ...status,
      recentLogs
    });
  } catch (err: any) {
    res.status(500).json({ 
      connected: false,
      error: err.message,
      projectId: SUPABASE_PROJECT_ID 
    });
  }
});

apiRouter.post('/admin/supabase/sync-all', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const result = await syncAllBookingsToSupabase();
    res.json({
      success: true,
      message: `Sync completed: ${result.synced} of ${result.total} bookings synced to Supabase.`,
      ...result
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to sync to Supabase', details: err.message });
  }
});

apiRouter.get('/admin/supabase/schema', requireAdmin, (_req: Request, res: Response) => {
  try {
    const schemaPath = path.resolve(process.cwd(), 'supabase-schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      res.json({ sql, projectId: SUPABASE_PROJECT_ID });
    } else {
      res.status(404).json({ error: 'Schema file not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Error reading schema', details: err.message });
  }
});

// Directly query live booking data from Supabase
apiRouter.get('/admin/supabase/live-bookings', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const result = await fetchBookingsFromSupabase();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, data: [], error: err.message });
  }
});

// Import / Synchronize any Supabase records into local DB
apiRouter.post('/admin/supabase/import', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const result = await importBookingsFromSupabase();
    res.json({
      success: true,
      message: `Synchronized from Supabase: ${result.imported} new records imported, ${result.skipped} refreshed.`,
      ...result
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
