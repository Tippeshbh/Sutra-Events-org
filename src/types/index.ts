export type EventStatus = 'PENDING' | 'QUOTED' | 'HOLD' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export type TimeSlot = 
  | 'Morning (Muhurtham 6 AM - 2 PM)'
  | 'Evening (Reception 4 PM - 11 PM)'
  | 'Full Day (6 AM - 11 PM)'
  | 'Multi-Day Celebration';

export interface BookingRequest {
  id: string;
  reference_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  event_type: string;
  event_date: string;
  time_slot: string;
  duration_hours: number;
  setup_buffer_hours: number;
  venue_name: string;
  venue_address: string;
  venue_type: string;
  guest_count: number;
  estimated_budget_tier: string;
  design_theme?: string;
  design_brief_json?: string;
  client_notes?: string;
  status: EventStatus;
  hold_expires_at?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotationItem {
  description: string;
  category: string;
  unit_cost: number;
  quantity: number;
  total: number;
}

export interface Quotation {
  id: string;
  booking_id: string;
  quotation_number: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  items: QuotationItem[];
  subtotal: number;
  tax_percent: number;
  tax_amount: number;
  discount_amount: number;
  grand_total: number;
  advance_percentage: number;
  advance_amount: number;
  balance_amount: number;
  payment_status: 'PENDING' | 'ADVANCE_PAID' | 'FULLY_PAID' | 'WAIVED';
  valid_until: string;
  cancellation_terms: string;
  notes?: string;
  created_at: string;
}

export interface AuditLog {
  action: string;
  previous_status?: string | null;
  new_status?: string | null;
  performed_by: string;
  notes?: string;
  created_at: string;
}

export interface CalendarDayInfo {
  status: 'AVAILABLE' | 'HOLD' | 'CONFIRMED' | 'UNAVAILABLE';
  slotsOccupied: string[];
  pendingEnquiriesCount: number;
  canAcceptBooking: boolean;
  note?: string;
}

export interface MonthAvailability {
  month: string;
  maxConcurrentEvents: number;
  dates: Record<string, CalendarDayInfo>;
}

export interface DesignBrief {
  celebrationType: string;
  aesthetic: string;
  palette: string;
  florals: string[];
  backdrop: string;
  stageAndLighting: string[];
  guestEstimate: string;
  venueType: string;
  specialRequests?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  category: 'Weddings & Mandap' | 'Receptions' | 'Haldi & Sangeet' | 'Engagements' | 'Baby Shower & Birthdays';
  style: 'Royal Heritage' | 'Contemporary Luxury' | 'Traditional Festive' | 'Romantic Floral' | 'Pastel Whimsical';
  palette: 'Champagne Gold & Forest Green' | 'Ivory & Blush Rose' | 'Sunshine Yellow & Brass' | 'Muted Rose & Champagne' | 'Warm Peach & Cream';
  image: string;
  location: string;
  description: string;
  elements: string[];
  durationSetup: string;
  demonstrationNotice?: string;
}

