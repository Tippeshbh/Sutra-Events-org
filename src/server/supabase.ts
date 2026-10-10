import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { db } from './db.js';

export const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'hfopeubspzlxoyrljjtc';
export const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_RFqzuyCeEbtsOLE9E8f5fA_eiy1RQIx';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to log sync operations
export function logSupabaseSync(
  bookingId: string,
  referenceCode: string,
  targetTable: string,
  status: 'SUCCESS' | 'FAILED' | 'PENDING',
  message: string,
  rawError?: any
) {
  try {
    const id = `sb-sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO supabase_sync_logs (
        id, booking_id, reference_code, target_table, status, message, error_details, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      bookingId,
      referenceCode,
      targetTable,
      status,
      message,
      rawError ? JSON.stringify(rawError) : null,
      now
    );
  } catch (err) {
    console.error('Failed to write supabase sync log:', err);
  }
}

// Sync a single booking into Supabase
export async function syncBookingToSupabase(booking: any): Promise<{
  success: boolean;
  message: string;
  error?: any;
}> {
  console.log(`[Supabase Sync] Syncing booking ${booking.reference_code || booking.referenceCode}...`);

  const payloadBookingRequests = {
    id: String(booking.id),
    reference_code: String(booking.reference_code || booking.referenceCode),
    customer_name: String(booking.customer_name || booking.customerName),
    customer_phone: String(booking.customer_phone || booking.customerPhone),
    customer_email: String(booking.customer_email || booking.customerEmail),
    event_type: String(booking.event_type || booking.eventType),
    event_date: String(booking.event_date || booking.eventDate),
    time_slot: String(booking.time_slot || booking.timeSlot),
    duration_hours: Number(booking.duration_hours || booking.durationHours) || 6,
    setup_buffer_hours: Number(booking.setup_buffer_hours || booking.setupBufferHours) || 4,
    venue_name: String(booking.venue_name || booking.venueName || ''),
    venue_address: String(booking.venue_address || booking.venueAddress || ''),
    venue_type: String(booking.venue_type || booking.venueType || 'Indoor Hall'),
    guest_count: Number(booking.guest_count || booking.guestCount) || 100,
    estimated_budget_tier: String(booking.estimated_budget_tier || booking.estimatedBudgetTier || ''),
    design_theme: booking.design_theme || booking.designTheme || null,
    design_brief: typeof booking.design_brief === 'object' ? booking.design_brief : 
                  (booking.design_brief_json ? JSON.parse(booking.design_brief_json) : null),
    client_notes: booking.client_notes || booking.clientNotes || null,
    status: String(booking.status || 'PENDING'),
    hold_expires_at: booking.hold_expires_at || booking.holdExpiresAt || null,
    admin_notes: booking.admin_notes || booking.adminNotes || null,
    updated_at: new Date().toISOString()
  };

  const payloadAppointments = {
    id: String(booking.id),
    reference_code: String(booking.reference_code || booking.referenceCode),
    customer_name: String(booking.customer_name || booking.customerName),
    customer_phone: String(booking.customer_phone || booking.customerPhone),
    customer_email: String(booking.customer_email || booking.customerEmail),
    event_type: String(booking.event_type || booking.eventType),
    event_date: String(booking.event_date || booking.eventDate),
    time_slot: String(booking.time_slot || booking.timeSlot),
    venue_name: String(booking.venue_name || booking.venueName || ''),
    guest_count: Number(booking.guest_count || booking.guestCount) || 100,
    status: String(booking.status || 'PENDING'),
    client_notes: booking.client_notes || booking.clientNotes || null,
    updated_at: new Date().toISOString()
  };

  let brSuccess = false;
  let aptSuccess = false;
  let lastError: any = null;

  // 1. Try upserting to booking_requests
  try {
    const { error: err1 } = await supabase
      .from('booking_requests')
      .upsert(payloadBookingRequests, { onConflict: 'id' });

    if (err1) {
      lastError = err1;
      logSupabaseSync(payloadBookingRequests.id, payloadBookingRequests.reference_code, 'booking_requests', 'FAILED', err1.message, err1);
    } else {
      brSuccess = true;
      logSupabaseSync(payloadBookingRequests.id, payloadBookingRequests.reference_code, 'booking_requests', 'SUCCESS', 'Synced to booking_requests');
    }
  } catch (e: any) {
    lastError = e;
    logSupabaseSync(payloadBookingRequests.id, payloadBookingRequests.reference_code, 'booking_requests', 'FAILED', e.message, e);
  }

  // 2. Also try upserting to appointments
  try {
    const { error: err2 } = await supabase
      .from('appointments')
      .upsert(payloadAppointments, { onConflict: 'id' });

    if (err2) {
      if (!lastError) lastError = err2;
      logSupabaseSync(payloadAppointments.id, payloadAppointments.reference_code, 'appointments', 'FAILED', err2.message, err2);
    } else {
      aptSuccess = true;
      logSupabaseSync(payloadAppointments.id, payloadAppointments.reference_code, 'appointments', 'SUCCESS', 'Synced to appointments');
    }
  } catch (e: any) {
    if (!lastError) lastError = e;
    logSupabaseSync(payloadAppointments.id, payloadAppointments.reference_code, 'appointments', 'FAILED', e.message, e);
  }

  if (brSuccess || aptSuccess) {
    return {
      success: true,
      message: `Booking ${payloadBookingRequests.reference_code} synced to Supabase database successfully.`
    };
  }

  return {
    success: false,
    message: lastError?.message?.includes('schema cache') 
      ? `Supabase connected, but tables need to be created. Please run the SQL schema in your Supabase SQL editor.`
      : (lastError?.message || 'Failed to sync to Supabase'),
    error: lastError
  };
}

// Test connection and schema presence
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  tablesExist: boolean;
  tablesFound: string[];
  message: string;
  projectId: string;
  error?: any;
}> {
  try {
    const tablesFound: string[] = [];

    // Test booking_requests
    const res1 = await supabase.from('booking_requests').select('id').limit(1);
    if (!res1.error) {
      tablesFound.push('booking_requests');
    }

    // Test appointments
    const res2 = await supabase.from('appointments').select('id').limit(1);
    if (!res2.error) {
      tablesFound.push('appointments');
    }

    if (tablesFound.length > 0) {
      return {
        connected: true,
        tablesExist: true,
        tablesFound,
        message: `Connected to Supabase project '${SUPABASE_PROJECT_ID}'. Tables ready: [${tablesFound.join(', ')}]`,
        projectId: SUPABASE_PROJECT_ID
      };
    }

    // Connected to Supabase PostgREST, but tables not yet created
    const errMessage = res1.error?.message || res2.error?.message || 'Tables not found';
    return {
      connected: true,
      tablesExist: false,
      tablesFound: [],
      message: `Successfully connected to Supabase project '${SUPABASE_PROJECT_ID}', but database tables (booking_requests / appointments) do not exist yet. Run the SQL schema script in your Supabase dashboard to create them.`,
      projectId: SUPABASE_PROJECT_ID,
      error: res1.error || res2.error
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesExist: false,
      tablesFound: [],
      message: `Failed to connect to Supabase: ${err.message}`,
      projectId: SUPABASE_PROJECT_ID,
      error: err
    };
  }
}

// Sync all existing local bookings to Supabase
export async function syncAllBookingsToSupabase(): Promise<{
  total: number;
  synced: number;
  failed: number;
  errors: string[];
}> {
  const rows = db.prepare('SELECT * FROM booking_requests ORDER BY created_at DESC').all() as any[];
  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const b of rows) {
    const res = await syncBookingToSupabase(b);
    if (res.success) {
      synced++;
    } else {
      failed++;
      if (res.message && !errors.includes(res.message)) {
        errors.push(res.message);
      }
    }
  }

  return {
    total: rows.length,
    synced,
    failed,
    errors
  };
}

// Directly fetch all booking records stored in Supabase
export async function fetchBookingsFromSupabase(): Promise<{
  success: boolean;
  data: any[];
  error?: any;
  sourceTable: string;
}> {
  try {
    const { data: brData, error: brErr } = await supabase
      .from('booking_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!brErr && brData && brData.length > 0) {
      return { success: true, data: brData, sourceTable: 'booking_requests' };
    }

    // Try appointments table
    const { data: aptData, error: aptErr } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!aptErr && aptData) {
      return { success: true, data: aptData, sourceTable: 'appointments' };
    }

    if (brData) {
      return { success: true, data: brData, sourceTable: 'booking_requests' };
    }

    return { 
      success: false, 
      data: [], 
      error: brErr || aptErr,
      sourceTable: 'none'
    };
  } catch (err: any) {
    return { success: false, data: [], error: err, sourceTable: 'none' };
  }
}

// Update booking record in Supabase
export async function updateBookingInSupabase(id: string, updates: any): Promise<{ success: boolean; error?: any }> {
  try {
    const now = new Date().toISOString();
    const brUpdates: any = { updated_at: now };
    const aptUpdates: any = { updated_at: now };

    if (updates.customer_name || updates.customerName) {
      const val = updates.customer_name || updates.customerName;
      brUpdates.customer_name = val;
      aptUpdates.customer_name = val;
    }
    if (updates.customer_phone || updates.customerPhone) {
      const val = updates.customer_phone || updates.customerPhone;
      brUpdates.customer_phone = val;
      aptUpdates.customer_phone = val;
    }
    if (updates.customer_email || updates.customerEmail) {
      const val = (updates.customer_email || updates.customerEmail).toLowerCase();
      brUpdates.customer_email = val;
      aptUpdates.customer_email = val;
    }
    if (updates.event_type || updates.eventType) {
      const val = updates.event_type || updates.eventType;
      brUpdates.event_type = val;
      aptUpdates.event_type = val;
    }
    if (updates.event_date || updates.eventDate) {
      const val = updates.event_date || updates.eventDate;
      brUpdates.event_date = val;
      aptUpdates.event_date = val;
    }
    if (updates.time_slot || updates.timeSlot) {
      const val = updates.time_slot || updates.timeSlot;
      brUpdates.time_slot = val;
      aptUpdates.time_slot = val;
    }
    if (updates.duration_hours || updates.durationHours) {
      brUpdates.duration_hours = Number(updates.duration_hours || updates.durationHours);
    }
    if (updates.setup_buffer_hours || updates.setupBufferHours) {
      brUpdates.setup_buffer_hours = Number(updates.setup_buffer_hours || updates.setupBufferHours);
    }
    if (updates.venue_name !== undefined || updates.venueName !== undefined) {
      const val = updates.venue_name !== undefined ? updates.venue_name : updates.venueName;
      brUpdates.venue_name = val;
      aptUpdates.venue_name = val;
    }
    if (updates.venue_address !== undefined || updates.venueAddress !== undefined) {
      brUpdates.venue_address = updates.venue_address !== undefined ? updates.venue_address : updates.venueAddress;
    }
    if (updates.venue_type || updates.venueType) {
      brUpdates.venue_type = updates.venue_type || updates.venueType;
    }
    if (updates.guest_count || updates.guestCount) {
      const val = Number(updates.guest_count || updates.guestCount);
      brUpdates.guest_count = val;
      aptUpdates.guest_count = val;
    }
    if (updates.estimated_budget_tier || updates.estimatedBudgetTier) {
      brUpdates.estimated_budget_tier = updates.estimated_budget_tier || updates.estimatedBudgetTier;
    }
    if (updates.status) {
      brUpdates.status = updates.status;
      aptUpdates.status = updates.status;
    }
    if (updates.hold_expires_at !== undefined || updates.holdExpiresAt !== undefined) {
      brUpdates.hold_expires_at = updates.hold_expires_at !== undefined ? updates.hold_expires_at : updates.holdExpiresAt;
    }
    if (updates.client_notes !== undefined || updates.clientNotes !== undefined) {
      const val = updates.client_notes !== undefined ? updates.client_notes : updates.clientNotes;
      brUpdates.client_notes = val;
      aptUpdates.client_notes = val;
    }
    if (updates.admin_notes !== undefined || updates.adminNotes !== undefined) {
      brUpdates.admin_notes = updates.admin_notes !== undefined ? updates.admin_notes : updates.adminNotes;
    }

    await Promise.allSettled([
      supabase.from('booking_requests').update(brUpdates).eq('id', id),
      supabase.from('appointments').update(aptUpdates).eq('id', id)
    ]);

    logSupabaseSync(id, updates.reference_code || updates.referenceCode || id, 'booking_requests', 'SUCCESS', `Updated in Supabase (Status: ${updates.status || 'UNCHANGED'})`);
    return { success: true };
  } catch (err: any) {
    console.error('Failed to update booking in Supabase:', err);
    return { success: false, error: err };
  }
}

// Cancel booking in Supabase
export async function cancelBookingInSupabase(id: string, reason: string): Promise<{ success: boolean; error?: any }> {
  try {
    const now = new Date().toISOString();
    await Promise.allSettled([
      supabase.from('booking_requests').update({
        status: 'CANCELLED',
        hold_expires_at: null,
        admin_notes: `Cancellation: ${reason}`,
        updated_at: now
      }).eq('id', id),
      supabase.from('appointments').update({
        status: 'CANCELLED',
        client_notes: `Cancellation: ${reason}`,
        updated_at: now
      }).eq('id', id)
    ]);

    logSupabaseSync(id, id, 'booking_requests', 'SUCCESS', `Marked CANCELLED in Supabase: ${reason}`);
    return { success: true };
  } catch (err: any) {
    console.error('Failed to cancel booking in Supabase:', err);
    return { success: false, error: err };
  }
}

// Delete booking in Supabase
export async function deleteBookingInSupabase(id: string): Promise<{ success: boolean; error?: any }> {
  try {
    await Promise.allSettled([
      supabase.from('booking_requests').delete().eq('id', id),
      supabase.from('appointments').delete().eq('id', id)
    ]);
    logSupabaseSync(id, id, 'booking_requests', 'SUCCESS', 'Deleted from Supabase');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err };
  }
}

// Import bookings from Supabase into local DB if any are missing
export async function importBookingsFromSupabase(): Promise<{
  totalInSupabase: number;
  imported: number;
  skipped: number;
}> {
  const { data } = await fetchBookingsFromSupabase();
  let imported = 0;
  let skipped = 0;

  if (!data || !Array.isArray(data)) {
    return { totalInSupabase: 0, imported: 0, skipped: 0 };
  }

  const checkStmt = db.prepare('SELECT id FROM booking_requests WHERE id = ?');
  const insertStmt = db.prepare(`
    INSERT INTO booking_requests (
      id, reference_code, customer_name, customer_phone, customer_email,
      event_type, event_date, time_slot, duration_hours, setup_buffer_hours,
      venue_name, venue_address, venue_type, guest_count, estimated_budget_tier,
      design_theme, design_brief_json, client_notes, status, hold_expires_at,
      admin_notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const updateStmt = db.prepare(`
    UPDATE booking_requests SET
      customer_name = ?, customer_phone = ?, customer_email = ?,
      event_type = ?, event_date = ?, time_slot = ?, venue_name = ?,
      guest_count = ?, status = ?, updated_at = ?
    WHERE id = ?
  `);

  for (const b of data) {
    const existing = checkStmt.get(b.id);
    const now = new Date().toISOString();
    if (!existing) {
      insertStmt.run(
        b.id,
        b.reference_code || `SUTRA-${b.id.substring(0, 8)}`,
        b.customer_name || 'Anonymous Client',
        b.customer_phone || '+91 96636 43161',
        b.customer_email || 'sutraeventss@gmail.com',
        b.event_type || 'Custom Event',
        b.event_date || now.split('T')[0],
        b.time_slot || 'Morning',
        b.duration_hours || 6,
        b.setup_buffer_hours || 4,
        b.venue_name || 'Davangere Venue',
        b.venue_address || 'Davangere, Karnataka',
        b.venue_type || 'Indoor Hall',
        b.guest_count || 100,
        b.estimated_budget_tier || 'Custom',
        b.design_theme || null,
        b.design_brief ? JSON.stringify(b.design_brief) : null,
        b.client_notes || null,
        b.status || 'PENDING',
        b.hold_expires_at || null,
        b.admin_notes || null,
        b.created_at || now,
        b.updated_at || now
      );
      imported++;
    } else {
      // Sync status and basic fields if updated
      updateStmt.run(
        b.customer_name,
        b.customer_phone,
        b.customer_email,
        b.event_type,
        b.event_date,
        b.time_slot,
        b.venue_name,
        b.guest_count,
        b.status,
        now,
        b.id
      );
      skipped++;
    }
  }

  return {
    totalInSupabase: data.length,
    imported,
    skipped
  };
}
