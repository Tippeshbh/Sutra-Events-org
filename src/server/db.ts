import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'sutra_events.sqlite');

export const db = new DatabaseSync(DB_PATH);

// Initialize schema
export function initDatabase() {
  db.exec('PRAGMA foreign_keys = ON;');

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS business_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Booking Requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS booking_requests (
      id TEXT PRIMARY KEY,
      reference_code TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      duration_hours INTEGER NOT NULL DEFAULT 6,
      setup_buffer_hours INTEGER NOT NULL DEFAULT 4,
      venue_name TEXT NOT NULL,
      venue_address TEXT NOT NULL,
      venue_type TEXT NOT NULL,
      guest_count INTEGER NOT NULL,
      estimated_budget_tier TEXT NOT NULL,
      design_theme TEXT,
      design_brief_json TEXT,
      client_notes TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      hold_expires_at TEXT,
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Quotations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      quotation_number TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax_percent REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      discount_amount REAL NOT NULL DEFAULT 0,
      grand_total REAL NOT NULL,
      advance_percentage REAL NOT NULL DEFAULT 30,
      advance_amount REAL NOT NULL,
      balance_amount REAL NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'PENDING',
      valid_until TEXT NOT NULL,
      cancellation_terms TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES booking_requests (id) ON DELETE CASCADE
    );
  `);

  // Audit Log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS booking_audit_logs (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      action TEXT NOT NULL,
      previous_status TEXT,
      new_status TEXT,
      performed_by TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (booking_id) REFERENCES booking_requests (id) ON DELETE CASCADE
    );
  `);

  // Calendar Manual Blackouts / Holidays
  db.exec(`
    CREATE TABLE IF NOT EXISTS calendar_blackouts (
      id TEXT PRIMARY KEY,
      date TEXT UNIQUE NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Notifications log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notification_logs (
      id TEXT PRIMARY KEY,
      booking_id TEXT,
      recipient TEXT NOT NULL,
      channel TEXT NOT NULL,
      template TEXT NOT NULL,
      status TEXT NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Supabase sync logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS supabase_sync_logs (
      id TEXT PRIMARY KEY,
      booking_id TEXT,
      reference_code TEXT,
      target_table TEXT,
      status TEXT NOT NULL,
      message TEXT,
      error_details TEXT,
      created_at TEXT NOT NULL
    );
  `);

  seedDefaults();
}

function seedDefaults() {
  const getSetting = db.prepare('SELECT value FROM business_settings WHERE key = ?');
  
  // Set default admin password hash if not set
  const adminPassword = process.env.ADMIN_PASSWORD || 'sutra_admin_davangere';
  const existingPw = getSetting.get('admin_password_hash');
  if (!existingPw) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(adminPassword, salt);
    db.prepare('INSERT OR REPLACE INTO business_settings (key, value, updated_at) VALUES (?, ?, ?)')
      .run('admin_password_hash', hash, new Date().toISOString());
  }

  // Set default settings
  const defaults: Record<string, string> = {
    business_name: 'Sutra Events',
    business_tagline: 'Formula to execute your imaginations.',
    business_phone: '+91 96636 43161',
    business_email: 'sutraeventss@gmail.com',
    business_address: '12th Cross Road, Anjaneya Badavane, Kuvempu Nagar, Davangere, Karnataka 577004, India.',
    business_website: 'https://www.sutraevents.com/',
    max_concurrent_events: '1',
    hold_duration_hours: '48',
    setup_buffer_hours: '4',
    working_hours: '09:00 - 21:00 IST',
    is_demo_seeded: 'true',
  };

  const insertSetting = db.prepare('INSERT OR IGNORE INTO business_settings (key, value, updated_at) VALUES (?, ?, ?)');
  for (const [key, val] of Object.entries(defaults)) {
    insertSetting.run(key, val, new Date().toISOString());
  }

  // Check if we need to seed initial demonstration bookings
  const checkBookings = db.prepare('SELECT COUNT(*) as count FROM booking_requests').get() as { count: number };
  if (checkBookings.count === 0) {
    seedDemonstrationData();
  }
}

export function seedDemonstrationData() {
  const now = new Date();
  
  // Helper to format YYYY-MM-DD
  const formatOffsetDate = (daysAhead: number) => {
    const d = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  };

  const sampleBookings = [
    {
      id: 'demo-booking-1',
      reference_code: 'SUTRA-2026-8812',
      customer_name: 'Dr. Ramesh & Smt. Vidya Kulkarni',
      customer_phone: '+91 98450 12345',
      customer_email: 'ramesh.kulkarni.dvg@example.com',
      event_type: 'Wedding & Royal Mandap',
      event_date: formatOffsetDate(12),
      time_slot: 'Morning (Muhurtham 6 AM - 2 PM)',
      duration_hours: 8,
      setup_buffer_hours: 6,
      venue_name: 'Bapuji Convention Center',
      venue_address: 'MCC B Block, Davangere',
      venue_type: 'Indoor Hall',
      guest_count: 850,
      estimated_budget_tier: '₹3,50,000 - ₹5,00,000',
      design_theme: 'Royal South Indian Heritage',
      design_brief_json: JSON.stringify({
        palette: 'Champagne Gold & Forest Green',
        florals: 'Fresh White Jasmine, Royal Marigolds & Lotus Urli',
        stage: 'Carved Chettinad Wood Pillar Mandap with Brass Oil Lamps',
        lighting: 'Warm Ambient Focus, Chandelier, Temple Uplighting'
      }),
      client_notes: 'Traditional Brahmin muhurtham at 9:15 AM. Need grand flower canopy entrance.',
      status: 'CONFIRMED',
      hold_expires_at: null,
      admin_notes: 'Advance deposit received. Floral vendors locked for Davangere flower market sourcing.',
      created_at: new Date(now.getTime() - 5 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 86400000).toISOString()
    },
    {
      id: 'demo-booking-2',
      reference_code: 'SUTRA-2026-4590',
      customer_name: 'Ananya Deshmukh',
      customer_phone: '+91 99801 56789',
      customer_email: 'ananya.deshmukh@example.com',
      event_type: 'Reception Gala',
      event_date: formatOffsetDate(18),
      time_slot: 'Evening (Reception 4 PM - 11 PM)',
      duration_hours: 7,
      setup_buffer_hours: 4,
      venue_name: 'Trishul Lawns & Banquet',
      venue_address: 'Hadadi Road, Davangere',
      venue_type: 'Outdoor Lawn',
      guest_count: 450,
      estimated_budget_tier: '₹2,00,000 - ₹3,00,000',
      design_theme: 'Contemporary Grandeur',
      design_brief_json: JSON.stringify({
        palette: 'Muted Rose, Champagne & Ivory',
        florals: 'Blush English Roses, Baby Breath & Eucalyptus',
        stage: 'Grand Geometric Arch with Starlight Ceiling',
        lighting: 'Crystal Chandeliers, Fairy Light Tunnel, Cold Pyro'
      }),
      client_notes: 'Evening reception. Couple entry with sparkular cold pyro requested.',
      status: 'QUOTED',
      hold_expires_at: new Date(now.getTime() + 36 * 3600000).toISOString(),
      admin_notes: 'Quotation SUTRA-Q-2026-002 sent. Awaiting couple review.',
      created_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 1 * 86400000).toISOString()
    },
    {
      id: 'demo-booking-3',
      reference_code: 'SUTRA-2026-7321',
      customer_name: 'Pradeep & Meghana Gowda',
      customer_phone: '+91 94480 34567',
      customer_email: 'pradeep.gowda@example.com',
      event_type: 'Haldi & Sangeet Ceremony',
      event_date: formatOffsetDate(25),
      time_slot: 'Morning (Muhurtham 6 AM - 2 PM)',
      duration_hours: 6,
      setup_buffer_hours: 3,
      venue_name: 'Ancestral Courtyard Villa',
      venue_address: 'Kuvempu Nagar, Davangere',
      venue_type: 'Private Home',
      guest_count: 180,
      estimated_budget_tier: '₹1,00,000 - ₹1,80,000',
      design_theme: 'Traditional Sunshine Marigold',
      design_brief_json: JSON.stringify({
        palette: 'Sunshine Yellow, Orange & Green',
        florals: 'Fresh Genda Phool Canopies & Brass Urli with Floating Petals',
        stage: 'Low Wooden Charpai Seating with Embroidered Bolsters',
        lighting: 'Natural Day Illumination with Warm Fairy Accents'
      }),
      client_notes: 'Traditional haldi bath at home lawn. Water drainage required near setup.',
      status: 'PENDING',
      hold_expires_at: null,
      admin_notes: 'New inquiry from Kuvempu Nagar. Schedule initial site visit.',
      created_at: new Date(now.getTime() - 12 * 3600000).toISOString(),
      updated_at: new Date(now.getTime() - 12 * 3600000).toISOString()
    }
  ];

  const insertBooking = db.prepare(`
    INSERT OR REPLACE INTO booking_requests (
      id, reference_code, customer_name, customer_phone, customer_email,
      event_type, event_date, time_slot, duration_hours, setup_buffer_hours,
      venue_name, venue_address, venue_type, guest_count, estimated_budget_tier,
      design_theme, design_brief_json, client_notes, status, hold_expires_at,
      admin_notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertAudit = db.prepare(`
    INSERT OR REPLACE INTO booking_audit_logs (
      id, booking_id, action, previous_status, new_status, performed_by, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertQuote = db.prepare(`
    INSERT OR REPLACE INTO quotations (
      id, booking_id, quotation_number, status, items_json, subtotal, tax_percent,
      tax_amount, discount_amount, grand_total, advance_percentage, advance_amount,
      balance_amount, payment_status, valid_until, cancellation_terms, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const b of sampleBookings) {
    insertBooking.run(
      b.id, b.reference_code, b.customer_name, b.customer_phone, b.customer_email,
      b.event_type, b.event_date, b.time_slot, b.duration_hours, b.setup_buffer_hours,
      b.venue_name, b.venue_address, b.venue_type, b.guest_count, b.estimated_budget_tier,
      b.design_theme, b.design_brief_json, b.client_notes, b.status, b.hold_expires_at,
      b.admin_notes, b.created_at, b.updated_at
    );

    insertAudit.run(
      `audit-${b.id}-init`,
      b.id,
      'REQUEST_CREATED',
      null,
      'PENDING',
      'CUSTOMER',
      'Initial booking request received via website',
      b.created_at
    );

    if (b.status === 'CONFIRMED') {
      insertAudit.run(
        `audit-${b.id}-confirmed`,
        b.id,
        'BOOKING_CONFIRMED',
        'QUOTED',
        'CONFIRMED',
        'ADMIN',
        'Advance payment verified & dates locked in schedule',
        b.updated_at
      );

      // Quote for confirmed booking
      const quoteItems = [
        { description: 'Royal Chettinad Wood Pillar Mandap Architecture', category: 'Stage & Structure', unit_cost: 120000, quantity: 1, total: 120000 },
        { description: 'Fresh Jasmine Strings (Mogra), Marigold Garlands & Lotus Urli', category: 'Floral Artistry', unit_cost: 110000, quantity: 1, total: 110000 },
        { description: 'Traditional Brass Kuthuvilakku Lamps & Pathway Lighting', category: 'Lighting & Decor', unit_cost: 35000, quantity: 1, total: 35000 },
        { description: 'Davangere On-site Labour, Transport, Setup & Teardown Crews', category: 'Logistics', unit_cost: 25000, quantity: 1, total: 25000 }
      ];
      const subtotal = 290000;
      const grandTotal = 290000;
      insertQuote.run(
        'quote-demo-1',
        b.id,
        'SUTRA-Q-2026-001',
        'ACCEPTED',
        JSON.stringify(quoteItems),
        subtotal,
        0,
        0,
        0,
        grandTotal,
        30,
        87000,
        203000,
        'ADVANCE_PAID',
        formatOffsetDate(10),
        'Cancellation before 15 days retains 50% of advance; after 15 days non-refundable due to fresh floral and structure reservation costs.',
        'Official quotation accepted by Dr. Ramesh Kulkarni.',
        b.created_at,
        b.updated_at
      );
    }

    if (b.status === 'QUOTED') {
      const quoteItems = [
        { description: 'Contemporary Geometric Arch & Velvet Drapery', category: 'Stage & Backdrop', unit_cost: 95000, quantity: 1, total: 95000 },
        { description: 'Imported Blush English Roses & Eucalyptus Garland Waterfall', category: 'Floral Artistry', unit_cost: 75000, quantity: 1, total: 75000 },
        { description: 'Crystal Chandeliers & Starlight Fairy Canopy', category: 'Ambient Lighting', unit_cost: 40000, quantity: 1, total: 40000 },
        { description: 'Sparkular Cold Pyro Machine Couple Entry Effect (4 nozzles)', category: 'Special Effects', unit_cost: 18000, quantity: 1, total: 18000 }
      ];
      const subtotal = 228000;
      insertQuote.run(
        'quote-demo-2',
        b.id,
        'SUTRA-Q-2026-002',
        'SENT',
        JSON.stringify(quoteItems),
        subtotal,
        0,
        0,
        0,
        228000,
        30,
        68400,
        159600,
        'PENDING',
        formatOffsetDate(15),
        'Advance deposit of 30% required to lock date. Date remains on temporary 48-hour hold.',
        'Quotation shared via email and WhatsApp link for client review.',
        b.updated_at,
        b.updated_at
      );
    }
  }
}
