import { db } from '../db.js';

export interface AvailabilityResult {
  isAvailable: boolean;
  reason?: string;
  conflictingStatus?: 'CONFIRMED' | 'HOLD';
  activeBookingsCount: number;
  maxAllowed: number;
}

export function sweepExpiredHolds(): number {
  const now = new Date().toISOString();
  // Find all holds that have expired
  const stmt = db.prepare(`
    SELECT id, reference_code FROM booking_requests 
    WHERE status = 'HOLD' AND hold_expires_at IS NOT NULL AND hold_expires_at < ?
  `);
  const expired = stmt.all(now) as Array<{ id: string; reference_code: string }>;

  if (expired.length === 0) return 0;

  const updateStmt = db.prepare(`
    UPDATE booking_requests 
    SET status = 'PENDING', hold_expires_at = NULL, updated_at = ?
    WHERE id = ?
  `);

  const auditStmt = db.prepare(`
    INSERT INTO booking_audit_logs (
      id, booking_id, action, previous_status, new_status, performed_by, notes, created_at
    ) VALUES (?, ?, 'HOLD_EXPIRED', 'HOLD', 'PENDING', 'SYSTEM', 'Temporary hold reservation expired automatically', ?)
  `);

  for (const item of expired) {
    updateStmt.run(now, item.id);
    auditStmt.run(`audit-exp-${Date.now()}-${item.id}`, item.id, now);
  }

  return expired.length;
}

export function getMaxConcurrentEvents(): number {
  const row = db.prepare(`SELECT value FROM business_settings WHERE key = 'max_concurrent_events'`).get() as { value: string } | undefined;
  return row ? parseInt(row.value, 10) || 1 : 1;
}

export function getHoldDurationHours(): number {
  const row = db.prepare(`SELECT value FROM business_settings WHERE key = 'hold_duration_hours'`).get() as { value: string } | undefined;
  return row ? parseInt(row.value, 10) || 48 : 48;
}

export function checkDateAvailability(
  eventDate: string,
  timeSlot: string,
  excludeBookingId?: string
): AvailabilityResult {
  // Always sweep expired holds first to ensure accurate data
  sweepExpiredHolds();

  // Check manual blackouts / maintenance days
  const blackout = db.prepare('SELECT reason FROM calendar_blackouts WHERE date = ?').get(eventDate) as { reason: string } | undefined;
  if (blackout) {
    return {
      isAvailable: false,
      reason: `Date unavailable: ${blackout.reason}`,
      conflictingStatus: 'CONFIRMED',
      activeBookingsCount: 1,
      maxAllowed: 0
    };
  }

  const maxAllowed = getMaxConcurrentEvents();

  // Query active bookings for that date
  let query = `
    SELECT id, time_slot, status, hold_expires_at 
    FROM booking_requests 
    WHERE event_date = ? 
      AND status IN ('CONFIRMED', 'HOLD')
  `;
  const params: any[] = [eventDate];

  if (excludeBookingId) {
    query += ` AND id != ?`;
    params.push(excludeBookingId);
  }

  const activeBookings = db.prepare(query).all(...params) as Array<{
    id: string;
    time_slot: string;
    status: 'CONFIRMED' | 'HOLD';
    hold_expires_at: string | null;
  }>;

  const count = activeBookings.length;

  if (count >= maxAllowed) {
    const hasConfirmed = activeBookings.some(b => b.status === 'CONFIRMED');
    return {
      isAvailable: false,
      reason: hasConfirmed 
        ? 'Date is already fully booked and confirmed.' 
        : 'Date is currently reserved under an active temporary hold.',
      conflictingStatus: hasConfirmed ? 'CONFIRMED' : 'HOLD',
      activeBookingsCount: count,
      maxAllowed
    };
  }

  // If maxAllowed > 1, check specific slot collision
  // 'Full Day' and 'Multi-Day' conflict with everything
  if (timeSlot.toLowerCase().includes('full') || timeSlot.toLowerCase().includes('multi')) {
    if (count > 0) {
      return {
        isAvailable: false,
        reason: 'Full-day booking requires sole access to date, but existing functions are scheduled.',
        conflictingStatus: activeBookings[0].status,
        activeBookingsCount: count,
        maxAllowed
      };
    }
  }

  // If new slot is morning or evening, check if any existing booking is Full Day or the same slot
  for (const b of activeBookings) {
    if (b.time_slot.toLowerCase().includes('full') || b.time_slot.toLowerCase().includes('multi')) {
      return {
        isAvailable: false,
        reason: 'Date has a full-day event reserved.',
        conflictingStatus: b.status,
        activeBookingsCount: count,
        maxAllowed
      };
    }
    if (b.time_slot.toLowerCase().includes('morning') && timeSlot.toLowerCase().includes('morning')) {
      return {
        isAvailable: false,
        reason: 'Morning slot is already reserved for this date.',
        conflictingStatus: b.status,
        activeBookingsCount: count,
        maxAllowed
      };
    }
    if (b.time_slot.toLowerCase().includes('evening') && timeSlot.toLowerCase().includes('evening')) {
      return {
        isAvailable: false,
        reason: 'Evening slot is already reserved for this date.',
        conflictingStatus: b.status,
        activeBookingsCount: count,
        maxAllowed
      };
    }
  }

  return {
    isAvailable: true,
    activeBookingsCount: count,
    maxAllowed
  };
}

export function getPublicMonthAvailability(yearMonth: string) {
  // yearMonth format: 'YYYY-MM'
  sweepExpiredHolds();

  const maxAllowed = getMaxConcurrentEvents();

  // Get all active bookings for this month
  const startDate = `${yearMonth}-01`;
  const endDate = `${yearMonth}-31`;

  const rows = db.prepare(`
    SELECT event_date, status, time_slot 
    FROM booking_requests 
    WHERE event_date >= ? AND event_date <= ?
      AND status IN ('CONFIRMED', 'HOLD', 'PENDING')
    ORDER BY event_date ASC
  `).all(startDate, endDate) as Array<{
    event_date: string;
    status: string;
    time_slot: string;
  }>;

  // Manual blackouts
  const blackouts = db.prepare(`
    SELECT date, reason FROM calendar_blackouts
    WHERE date >= ? AND date <= ?
  `).all(startDate, endDate) as Array<{ date: string; reason: string }>;

  const blackoutMap = new Map<string, string>();
  for (const b of blackouts) {
    blackoutMap.set(b.date, b.reason);
  }

  // Aggregate by date without exposing any customer info
  const dateMap: Record<string, {
    status: 'AVAILABLE' | 'HOLD' | 'CONFIRMED' | 'UNAVAILABLE';
    slotsOccupied: string[];
    pendingEnquiriesCount: number;
    canAcceptBooking: boolean;
    note?: string;
  }> = {};

  for (const r of rows) {
    if (!dateMap[r.event_date]) {
      dateMap[r.event_date] = {
        status: 'AVAILABLE',
        slotsOccupied: [],
        pendingEnquiriesCount: 0,
        canAcceptBooking: true
      };
    }

    if (r.status === 'PENDING') {
      dateMap[r.event_date].pendingEnquiriesCount++;
    } else if (r.status === 'CONFIRMED') {
      dateMap[r.event_date].slotsOccupied.push(r.time_slot);
      dateMap[r.event_date].status = 'CONFIRMED';
    } else if (r.status === 'HOLD') {
      dateMap[r.event_date].slotsOccupied.push(r.time_slot);
      if (dateMap[r.event_date].status !== 'CONFIRMED') {
        dateMap[r.event_date].status = 'HOLD';
      }
    }
  }

  // Mark blackouts & check capacity limit
  for (const [date, reason] of blackoutMap.entries()) {
    dateMap[date] = {
      status: 'UNAVAILABLE',
      slotsOccupied: ['All Day'],
      pendingEnquiriesCount: 0,
      canAcceptBooking: false,
      note: reason
    };
  }

  for (const [date, info] of Object.entries(dateMap)) {
    if (info.slotsOccupied.length >= maxAllowed || info.slotsOccupied.some(s => s.toLowerCase().includes('full'))) {
      info.canAcceptBooking = false;
      if (info.status !== 'CONFIRMED') {
        info.status = 'HOLD';
      }
    }
  }

  return {
    month: yearMonth,
    maxConcurrentEvents: maxAllowed,
    dates: dateMap
  };
}
