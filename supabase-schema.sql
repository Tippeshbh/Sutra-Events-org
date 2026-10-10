-- ============================================================================
-- SUTRA EVENTS - SUPABASE DATABASE SCHEMA
-- Project ID: hfopeubspzlxoyrljjtc
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/hfopeubspzlxoyrljjtc/sql)
-- ============================================================================

-- 1. Create table for Booking Requests
CREATE TABLE IF NOT EXISTS public.booking_requests (
  id TEXT PRIMARY KEY,
  reference_code TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  duration_hours INTEGER DEFAULT 6,
  setup_buffer_hours INTEGER DEFAULT 4,
  venue_name TEXT,
  venue_address TEXT,
  venue_type TEXT,
  guest_count INTEGER DEFAULT 100,
  estimated_budget_tier TEXT,
  design_theme TEXT,
  design_brief JSONB,
  client_notes TEXT,
  status TEXT DEFAULT 'PENDING',
  hold_expires_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create appointments table (alternate view for appointments)
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  reference_code TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  venue_name TEXT,
  guest_count INTEGER DEFAULT 100,
  status TEXT DEFAULT 'PENDING',
  client_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for booking_requests (Allow public insert, select, and update via anon key)
DROP POLICY IF EXISTS "Allow public insert to booking_requests" ON public.booking_requests;
CREATE POLICY "Allow public insert to booking_requests" ON public.booking_requests 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on booking_requests" ON public.booking_requests;
CREATE POLICY "Allow public select on booking_requests" ON public.booking_requests 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update on booking_requests" ON public.booking_requests;
CREATE POLICY "Allow public update on booking_requests" ON public.booking_requests 
  FOR UPDATE USING (true);

-- 5. Create Policies for appointments
DROP POLICY IF EXISTS "Allow public insert to appointments" ON public.appointments;
CREATE POLICY "Allow public insert to appointments" ON public.appointments 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on appointments" ON public.appointments;
CREATE POLICY "Allow public select on appointments" ON public.appointments 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update on appointments" ON public.appointments;
CREATE POLICY "Allow public update on appointments" ON public.appointments 
  FOR UPDATE USING (true);

-- Indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_booking_requests_date ON public.booking_requests (event_date);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON public.booking_requests (status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments (event_date);
