import React, { useState, useEffect } from 'react';
import { 
  Lock, LogOut, CheckCircle2, AlertCircle, Clock, Calendar, DollarSign, 
  Users, RefreshCw, FileText, Search, Filter, Phone, Mail, MapPin, 
  Edit3, Plus, Trash2, ArrowRight, X, ShieldAlert, Check, Settings,
  Database, ExternalLink, Copy, XCircle
} from 'lucide-react';
import { BookingRequest, Quotation, AuditLog, QuotationItem } from '../types/index.js';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Dashboard active view: 'overview' | 'bookings' | 'settings' | 'supabase'
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'settings' | 'supabase'>('overview');

  // Supabase State
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncAllResult, setSyncAllResult] = useState<any>(null);
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Overview stats
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  // Bookings list state
  const [bookingsList, setBookingsList] = useState<BookingRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Data Source & Live Supabase Data
  const [dataSourceFilter, setDataSourceFilter] = useState<'ALL' | 'SUPABASE'>('ALL');
  const [supabaseLiveList, setSupabaseLiveList] = useState<any[]>([]);
  const [isLoadingLiveSupabase, setIsLoadingLiveSupabase] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Selected Booking Inspection / Action Drawer
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<{
    booking: BookingRequest;
    quotation: Quotation | null;
    timeline: AuditLog[];
    notifications: any[];
    dateAvailability: any;
  } | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Reschedule modal state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Quotation Editor State
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [quoteItems, setQuoteItems] = useState<QuotationItem[]>([]);
  const [quoteTax, setQuoteTax] = useState(0);
  const [quoteDiscount, setQuoteDiscount] = useState(0);
  const [quoteAdvancePct, setQuoteAdvancePct] = useState(30);
  const [quoteValidUntil, setQuoteValidUntil] = useState('');
  const [quoteTerms, setQuoteTerms] = useState('');
  const [quoteSaveError, setQuoteSaveError] = useState<string | null>(null);
  const [isSavingQuote, setIsSavingQuote] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  // Edit Appointment Modal State
  const [isEditingAppointment, setIsEditingAppointment] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [editError, setEditError] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Cancel Appointment Modal State
  const [isCancellingAppointment, setIsCancellingAppointment] = useState(false);
  const [cancelReason, setCancelReason] = useState('Client requested cancellation');
  const [isSavingCancel, setIsSavingCancel] = useState(false);

  // New Appointment Modal State
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newFormData, setNewFormData] = useState<any>({
    customerName: '',
    customerPhone: '+91 ',
    customerEmail: '',
    eventType: 'Wedding & Royal Mandap',
    eventDate: '',
    timeSlot: 'Morning (Muhurtham 6 AM - 2 PM)',
    durationHours: 6,
    setupBufferHours: 4,
    venueName: 'Davangere Venue',
    venueAddress: 'Davangere, Karnataka',
    venueType: 'Indoor Hall',
    guestCount: 200,
    estimatedBudgetTier: '₹1,50,000 - ₹3,00,000',
    clientNotes: '',
    adminNotes: '',
    status: 'PENDING'
  });
  const [newError, setNewError] = useState<string | null>(null);
  const [isSavingNew, setIsSavingNew] = useState(false);

  // Conflict Action Error
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Check existing session
  const checkSession = async () => {
    try {
      const res = await fetch('/api/admin/session');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        loadOverview();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingSession(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid admin credentials');
      }
      setIsAuthenticated(true);
      loadOverview();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setSelectedBookingId(null);
    setSelectedBookingDetail(null);
  };

  const loadOverview = async () => {
    try {
      const res = await fetch('/api/admin/overview');
      const data = await res.json();
      setStats(data.stats);
      setRecentBookings(data.recent);
      setUpcomingEvents(data.upcoming);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBookings = async () => {
    setIsLoadingBookings(true);
    try {
      let url = `/api/admin/bookings?status=${statusFilter}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      const res = await fetch(url);
      const data = await res.json();
      setBookingsList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const loadLiveSupabaseBookings = async () => {
    setIsLoadingLiveSupabase(true);
    try {
      const res = await fetch('/api/admin/supabase/live-bookings');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSupabaseLiveList(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingLiveSupabase(false);
    }
  };

  const handleImportFromSupabase = async () => {
    setIsImporting(true);
    setImportResult(null);
    try {
      const res = await fetch('/api/admin/supabase/import', { method: 'POST' });
      const json = await res.json();
      setImportResult(json);
      await loadBookings();
      await loadLiveSupabaseBookings();
      await loadOverview();
    } catch (err: any) {
      setImportResult({ success: false, error: err.message });
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'bookings') {
        loadBookings();
        loadLiveSupabaseBookings();
      }
      if (activeTab === 'overview') {
        loadOverview();
        loadLiveSupabaseBookings();
      }
      if (activeTab === 'settings') loadSettings();
      if (activeTab === 'supabase') {
        loadSupabaseStatus();
        loadSqlSchema();
        loadLiveSupabaseBookings();
      }
    }
  }, [isAuthenticated, activeTab, statusFilter, searchTerm]);

  const loadSupabaseStatus = async () => {
    setIsLoadingSupabase(true);
    try {
      const res = await fetch('/api/admin/supabase/status');
      const data = await res.json();
      setSupabaseStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSupabase(false);
    }
  };

  const loadSqlSchema = async () => {
    try {
      const res = await fetch('/api/admin/supabase/schema');
      const data = await res.json();
      if (data.sql) setSqlSchema(data.sql);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncAllToSupabase = async () => {
    setIsSyncingAll(true);
    setSyncAllResult(null);
    try {
      const res = await fetch('/api/admin/supabase/sync-all', { method: 'POST' });
      const data = await res.json();
      setSyncAllResult(data);
      await loadSupabaseStatus();
    } catch (err: any) {
      setSyncAllResult({ success: false, message: err.message });
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleCopySchema = () => {
    if (sqlSchema) {
      navigator.clipboard.writeText(sqlSchema);
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2500);
    }
  };

  const loadBookingDetail = async (id: string) => {
    setIsLoadingDetail(true);
    setActionError(null);
    setActionSuccess(null);
    setSelectedBookingId(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`);
      const data = await res.json();
      setSelectedBookingDetail(data);

      // Pre-fill reschedule defaults
      setRescheduleDate(data.booking.event_date);
      setRescheduleSlot(data.booking.time_slot);

      // Pre-fill quote editor if quotation exists
      if (data.quotation) {
        setQuoteItems(data.quotation.items || []);
        setQuoteTax(data.quotation.tax_percent || 0);
        setQuoteDiscount(data.quotation.discount_amount || 0);
        setQuoteAdvancePct(data.quotation.advance_percentage || 30);
        setQuoteValidUntil(data.quotation.valid_until || data.booking.event_date);
        setQuoteTerms(data.quotation.cancellation_terms || '');
      } else {
        // Initialize default quotation template
        setQuoteItems([
          { description: `${data.booking.event_type} - Staging & Backdrop Architecture`, category: 'Staging & Architecture', unit_cost: 95000, quantity: 1, total: 95000 },
          { description: 'Fresh Davangere Jasmine Strings & Floral Garlands', category: 'Fresh Florals', unit_cost: 65000, quantity: 1, total: 65000 },
          { description: 'Ambient Warm Uplighting, Chandeliers & Fairy Strings', category: 'Lighting & AV', unit_cost: 30000, quantity: 1, total: 30000 },
          { description: 'Local Carpenter Crew, Setup & Teardown Buffer Logistics', category: 'Logistics', unit_cost: 20000, quantity: 1, total: 20000 }
        ]);
        setQuoteTax(0);
        setQuoteDiscount(0);
        setQuoteAdvancePct(30);
        setQuoteValidUntil(data.booking.event_date);
        setQuoteTerms('Advance deposit is 30% of total estimate. 50% refund available up to 15 days prior to event date. Cancellations within 14 days forfeit deposit due to perishable floral commitments.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedBookingDetail) return;
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/bookings/${selectedBookingDetail.booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      setActionSuccess(`Status successfully updated to ${newStatus}`);
      await loadBookingDetail(selectedBookingDetail.booking.id);
      loadBookings();
      loadOverview();
    } catch (err: any) {
      setActionError(err.message || 'Error updating status');
    }
  };

  const handleOpenEdit = (booking?: any) => {
    const b = booking || selectedBookingDetail?.booking;
    if (!b) return;
    setEditFormData({
      id: b.id,
      referenceCode: b.reference_code || b.referenceCode || b.id,
      customerName: b.customer_name || b.customerName || '',
      customerPhone: b.customer_phone || b.customerPhone || '',
      customerEmail: b.customer_email || b.customerEmail || '',
      eventType: b.event_type || b.eventType || 'Wedding & Royal Mandap',
      eventDate: b.event_date || b.eventDate || '',
      timeSlot: b.time_slot || b.timeSlot || 'Morning (Muhurtham 6 AM - 2 PM)',
      durationHours: b.duration_hours || b.durationHours || 6,
      setupBufferHours: b.setup_buffer_hours || b.setupBufferHours || 4,
      venueName: b.venue_name || b.venueName || '',
      venueAddress: b.venue_address || b.venueAddress || '',
      venueType: b.venue_type || b.venueType || 'Indoor Hall',
      guestCount: b.guest_count || b.guestCount || 100,
      estimatedBudgetTier: b.estimated_budget_tier || b.estimatedBudgetTier || 'Custom / To Be Quoted',
      clientNotes: b.client_notes || b.clientNotes || '',
      adminNotes: b.admin_notes || b.adminNotes || '',
      status: b.status || 'PENDING'
    });
    setEditError(null);
    setIsEditingAppointment(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.id) return;
    setIsSavingEdit(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${editFormData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update appointment');
      setIsEditingAppointment(false);
      setActionSuccess('Appointment updated and synced to Supabase successfully');
      if (selectedBookingDetail?.booking.id === editFormData.id) {
        await loadBookingDetail(editFormData.id);
      }
      loadBookings();
      loadLiveSupabaseBookings();
      loadOverview();
    } catch (err: any) {
      setEditError(err.message || 'Error updating appointment');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleOpenCancel = (booking?: any) => {
    if (booking) {
      setSelectedBookingId(booking.id);
      loadBookingDetail(booking.id);
    }
    setCancelReason('Client requested cancellation');
    setIsCancellingAppointment(true);
  };

  const handleExecuteCancel = async () => {
    const bId = selectedBookingDetail?.booking.id || selectedBookingId;
    if (!bId) return;
    setIsSavingCancel(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel appointment');
      setIsCancellingAppointment(false);
      setActionSuccess(`Appointment cancelled and slot released.`);
      if (selectedBookingDetail) {
        await loadBookingDetail(bId);
      }
      loadBookings();
      loadLiveSupabaseBookings();
      loadOverview();
    } catch (err: any) {
      setActionError(err.message || 'Error cancelling appointment');
    } finally {
      setIsSavingCancel(false);
    }
  };

  const handleExecuteDelete = async (bookingId: string, refCode: string) => {
    if (!window.confirm(`Permanently delete booking ${refCode}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete booking');
      setSelectedBookingDetail(null);
      setSelectedBookingId(null);
      loadBookings();
      loadLiveSupabaseBookings();
      loadOverview();
    } catch (err: any) {
      alert(err.message || 'Error deleting booking');
    }
  };

  const handleCreateNewBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNew(true);
    setNewError(null);
    try {
      const res = await fetch('/api/admin/bookings/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFormData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create appointment');
      setIsCreatingNew(false);
      loadBookings();
      loadLiveSupabaseBookings();
      loadOverview();
      loadBookingDetail(data.booking.id);
    } catch (err: any) {
      setNewError(err.message || 'Error creating appointment');
    } finally {
      setIsSavingNew(false);
    }
  };

  const handleExecuteReschedule = async () => {
    if (!selectedBookingDetail) return;
    setRescheduleError(null);

    try {
      const res = await fetch(`/api/admin/bookings/${selectedBookingDetail.booking.id}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDate: rescheduleDate,
          newTimeSlot: rescheduleSlot,
          reason: rescheduleReason
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reschedule');
      }

      setIsRescheduling(false);
      setActionSuccess(`Event rescheduled to ${rescheduleDate}`);
      await loadBookingDetail(selectedBookingDetail.booking.id);
      loadBookings();
    } catch (err: any) {
      setRescheduleError(err.message || 'Error rescheduling event');
    }
  };

  const handleSaveQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingDetail) return;
    setIsSavingQuote(true);
    setQuoteSaveError(null);

    try {
      const res = await fetch(`/api/admin/bookings/${selectedBookingDetail.booking.id}/quotation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: quoteItems,
          taxPercent: quoteTax,
          discountAmount: quoteDiscount,
          advancePercentage: quoteAdvancePct,
          validUntil: quoteValidUntil,
          cancellationTerms: quoteTerms
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save quotation');
      }

      setIsEditingQuote(false);
      setActionSuccess('Itemized quotation generated and recorded');
      await loadBookingDetail(selectedBookingDetail.booking.id);
      loadBookings();
    } catch (err: any) {
      setQuoteSaveError(err.message || 'Error saving quotation');
    } finally {
      setIsSavingQuote(false);
    }
  };

  const handleAddItemToQuote = () => {
    setQuoteItems([
      ...quoteItems,
      { description: 'Custom Decor Item', category: 'Décor & Styling', unit_cost: 10000, quantity: 1, total: 10000 }
    ]);
  };

  const handleRemoveQuoteItem = (idx: number) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== idx));
  };

  const handleUpdateQuoteItem = (idx: number, field: string, val: any) => {
    const updated = [...quoteItems];
    const item = { ...updated[idx], [field]: val };
    item.total = (Number(item.unit_cost) || 0) * (Number(item.quantity) || 1);
    updated[idx] = item;
    setQuoteItems(updated);
  };

  // Settings
  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsSuccess('Settings saved successfully');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset database with initial verified Davangere sample records?')) return;
    try {
      await fetch('/api/admin/reset-demo-data', { method: 'POST' });
      alert('Demonstration records reset.');
      loadOverview();
      loadBookings();
    } catch (err) {
      console.error(err);
    }
  };

  // LOGIN SCREEN
  if (!isAuthenticated && !checkingSession) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
        <div className="bg-[#18251F] border border-[#D8B77A] max-w-md w-full p-8 shadow-2xl space-y-6 text-[#F6F0E4]">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-[#D8B77A] flex items-center justify-center text-[#D8B77A]">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-serif text-xl text-[#F6F0E4]">
                Sutra Events Studio Administration
              </h3>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-[#F6F0E4]/70 leading-relaxed">
            Authorized access only for Sutra Events management in Davangere. View customer booking briefs, prepare quotations, and resolve calendar availability conflicts.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#D8B77A] mb-1.5">
                Master Admin Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                required
                className="w-full p-2.5 bg-white/10 border border-white/20 text-xs text-[#F6F0E4] focus:outline-none focus:border-[#D8B77A]"
              />
              <div className="flex items-center justify-between mt-1.5 text-[11px]">
                <span className="text-white/40">Default: sutra_admin_davangere</span>
                <button
                  type="button"
                  onClick={() => setPasswordInput('sutra_admin_davangere')}
                  className="text-[#D8B77A] hover:underline cursor-pointer font-medium"
                >
                  Quick Fill Demo Password
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // MAIN ADMIN DASHBOARD INTERFACE
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#18251F] text-[#F6F0E4] overflow-hidden">
      
      {/* Top Admin Header */}
      <div className="h-16 px-6 bg-[#18251F] border-b border-[#D8B77A]/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-[#D8B77A] flex items-center justify-center text-[#D8B77A]">
            <span className="font-serif text-sm font-semibold">S</span>
          </div>
          <div>
            <h1 className="font-serif text-lg text-[#F6F0E4] leading-tight">
              Sutra Events · Admin Operations
            </h1>
            <span className="text-[10px] text-[#D8B77A] block">Davangere Studio Portal · Active Server Session</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="hidden md:flex items-center gap-2 bg-white/5 p-1 border border-white/10">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'bookings', label: 'Booking Requests' },
            { id: 'supabase', label: 'Supabase Database' },
            { id: 'settings', label: 'Business Settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-[#D8B77A] text-[#18251F]' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E] text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] animate-pulse" />
            <span>Supabase: hfopeubspzlxoyrljjtc</span>
          </div>

          <button
            onClick={handleResetDemoData}
            title="Reload Demo Bookings"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 border border-white/20 text-xs text-[#F6F0E4]/70 hover:text-white hover:border-white/40 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Records</span>
          </button>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 text-white/60 hover:text-rose-400 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white cursor-pointer ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#121c17]">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && stats && (
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-5 bg-[#18251F] border border-[#D8B77A]/30">
                <span className="text-[11px] text-white/50 uppercase tracking-wider block">Total Inquiries</span>
                <div className="font-serif text-3xl text-[#F6F0E4] font-medium mt-1">{stats.total}</div>
                <span className="text-[10px] text-[#D8B77A] mt-1 block">All registered records</span>
              </div>

              <div className="p-5 bg-[#18251F] border border-amber-500/30">
                <span className="text-[11px] text-amber-300/70 uppercase tracking-wider block">Pending Review</span>
                <div className="font-serif text-3xl text-amber-300 font-medium mt-1">{stats.pending}</div>
                <span className="text-[10px] text-white/40 mt-1 block">Awaiting quotation</span>
              </div>

              <div className="p-5 bg-[#18251F] border border-blue-500/30">
                <span className="text-[11px] text-blue-300/70 uppercase tracking-wider block">Quoted Enquiries</span>
                <div className="font-serif text-3xl text-blue-300 font-medium mt-1">{stats.quoted}</div>
                <span className="text-[10px] text-white/40 mt-1 block">Sent to client</span>
              </div>

              <div className="p-5 bg-[#18251F] border border-emerald-500/30">
                <span className="text-[11px] text-emerald-300/70 uppercase tracking-wider block">Confirmed Bookings</span>
                <div className="font-serif text-3xl text-emerald-300 font-medium mt-1">{stats.confirmed}</div>
                <span className="text-[10px] text-white/40 mt-1 block">Locked on calendar</span>
              </div>

              <div className="p-5 bg-[#18251F] border border-[#D8B77A]/30 col-span-2 lg:col-span-1">
                <span className="text-[11px] text-[#D8B77A] uppercase tracking-wider block">Total Quoted Pipeline</span>
                <div className="font-serif text-2xl text-[#D8B77A] font-medium mt-1">₹{Number(stats.totalQuotedValue || 0).toLocaleString('en-IN')}</div>
                <span className="text-[10px] text-white/40 mt-1 block">Active event scopes</span>
              </div>
            </div>

            {/* Split Grids: Upcoming Dates vs Recent Inquiries */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Upcoming Locked Dates (lg:col-span-6) */}
              <div className="lg:col-span-6 bg-[#18251F] border border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="font-serif text-xl text-[#F6F0E4]">
                    Upcoming Locked Celebrations
                  </h3>
                  <span className="text-xs text-[#D8B77A]">Confirmed & Active Holds</span>
                </div>

                <div className="divide-y divide-white/5">
                  {upcomingEvents.length === 0 ? (
                    <div className="py-8 text-center text-xs text-white/40">No upcoming dates locked yet.</div>
                  ) : (
                    upcomingEvents.map((evt) => (
                      <div key={evt.id} className="py-3.5 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-medium text-[#F6F0E4]">{evt.customer_name}</div>
                          <div className="text-white/50 text-[11px]">{evt.event_type} · {evt.venue_name}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-[#D8B77A] font-medium">{evt.event_date}</div>
                          <button
                            onClick={() => {
                              setActiveTab('bookings');
                              loadBookingDetail(evt.id);
                            }}
                            className="text-[11px] text-white/60 hover:text-white underline mt-0.5 block"
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Inquiries (lg:col-span-6) */}
              <div className="lg:col-span-6 bg-[#18251F] border border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="font-serif text-xl text-[#F6F0E4]">
                    Recent Inbound Enquiries
                  </h3>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs text-[#D8B77A] hover:underline"
                  >
                    View All Enquiries →
                  </button>
                </div>

                <div className="divide-y divide-white/5">
                  {recentBookings.map((b) => (
                    <div key={b.id} className="py-3.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-[#F6F0E4] flex items-center gap-2">
                          <span>{b.customer_name}</span>
                          <span className="font-mono text-[10px] text-white/40">{b.reference_code}</span>
                        </div>
                        <div className="text-white/50 text-[11px]">{b.event_type} · Target: {b.event_date}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-semibold ${
                          b.status === 'CONFIRMED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                          b.status === 'QUOTED' ? 'bg-blue-950 text-blue-300 border border-blue-500/40' :
                          b.status === 'HOLD' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                          'bg-white/10 text-white/80'
                        }`}>
                          {b.status}
                        </span>

                        <button
                          onClick={() => {
                            setActiveTab('bookings');
                            loadBookingDetail(b.id);
                          }}
                          className="px-2.5 py-1 bg-[#D8B77A] text-[#18251F] font-semibold text-[10px] uppercase"
                        >
                          Inspect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* BOOKINGS LIST TAB */}
        {activeTab === 'bookings' && (
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Top Toolbar: Data Source Selector & Actions */}
            <div className="bg-[#18251F] border border-white/10 p-4 space-y-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
                
                {/* Data Source View Switcher */}
                <div className="flex items-center gap-1 bg-white/5 p-1 border border-white/10">
                  <button
                    onClick={() => setDataSourceFilter('ALL')}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
                      dataSourceFilter === 'ALL'
                        ? 'bg-[#D8B77A] text-[#18251F]'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <span>All Appointments</span>
                    <span className={`px-1.5 py-0.2 text-[10px] font-mono ${dataSourceFilter === 'ALL' ? 'bg-black/20 text-black' : 'bg-white/10 text-white/80'}`}>
                      {bookingsList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setDataSourceFilter('SUPABASE');
                      loadLiveSupabaseBookings();
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
                      dataSourceFilter === 'SUPABASE'
                        ? 'bg-[#3ECF8E] text-black font-bold'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#3ECF8E] inline-block animate-pulse" />
                    <span>Live Supabase Cloud DB</span>
                    <span className={`px-1.5 py-0.2 text-[10px] font-mono ${dataSourceFilter === 'SUPABASE' ? 'bg-black/20 text-black' : 'bg-white/10 text-white/80'}`}>
                      {supabaseLiveList.length}
                    </span>
                  </button>
                </div>

                {/* Cloud Sync & Action Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={loadLiveSupabaseBookings}
                    disabled={isLoadingLiveSupabase}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Directly query latest appointment rows from Supabase"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLiveSupabase ? 'animate-spin text-[#3ECF8E]' : ''}`} />
                    <span>{isLoadingLiveSupabase ? 'Querying Supabase...' : 'Refresh Live Supabase'}</span>
                  </button>

                  <button
                    onClick={handleImportFromSupabase}
                    disabled={isImporting}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-[#D8B77A] flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Import any appointments created in Supabase into local booking engine"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>{isImporting ? 'Importing...' : 'Import from Supabase'}</span>
                  </button>

                  <button
                    onClick={handleSyncAllToSupabase}
                    disabled={isSyncingAll}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 text-xs text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Push all bookings to Supabase"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSyncingAll ? 'Syncing...' : 'Sync All to Supabase'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setNewError(null);
                      setIsCreatingNew(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm ml-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Appointment</span>
                  </button>
                </div>
              </div>

              {/* Feedback messages */}
              {importResult && (
                <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center justify-between">
                  <span>{importResult.message || 'Supabase import complete.'}</span>
                  <button onClick={() => setImportResult(null)} className="text-white/60 hover:text-white">✕</button>
                </div>
              )}
              {actionSuccess && (
                <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center justify-between">
                  <span>{actionSuccess}</span>
                  <button onClick={() => setActionSuccess(null)} className="text-white/60 hover:text-white">✕</button>
                </div>
              )}
              {actionError && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-center justify-between">
                  <span>{actionError}</span>
                  <button onClick={() => setActionError(null)} className="text-white/60 hover:text-white">✕</button>
                </div>
              )}

              {/* Search and Filter Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-72">
                    <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filter by client, phone, ref code, venue..."
                      className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/20 text-xs text-white focus:outline-none focus:border-[#D8B77A]"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white/5 border border-white/20 p-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="QUOTED">Quoted</option>
                    <option value="HOLD">Hold</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="text-xs text-white/60 self-end sm:self-auto">
                  Showing: <strong className="text-white">{
                    dataSourceFilter === 'SUPABASE' ? supabaseLiveList.length : bookingsList.length
                  }</strong> {dataSourceFilter === 'SUPABASE' ? 'Supabase cloud records' : 'total bookings'}
                </div>
              </div>
            </div>

            {/* LIVE SUPABASE VIEW TABLE */}
            {dataSourceFilter === 'SUPABASE' && (
              <div className="bg-[#18251F] border border-[#3ECF8E]/40 overflow-x-auto">
                <div className="p-3 bg-[#3ECF8E]/10 border-b border-[#3ECF8E]/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#3ECF8E] font-medium">
                    <Database className="w-4 h-4" />
                    <span>Direct Query: Supabase Project <code>hfopeubspzlxoyrljjtc</code></span>
                  </div>
                  <span className="text-[11px] text-white/60">
                    Live from tables: <code>booking_requests</code> & <code>appointments</code>
                  </span>
                </div>

                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider font-semibold bg-white/5">
                      <th className="p-3.5">Ref Code / ID</th>
                      <th className="p-3.5">Client & Contact</th>
                      <th className="p-3.5">Celebration</th>
                      <th className="p-3.5">Event Date & Slot</th>
                      <th className="p-3.5">Venue & Guests</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {supabaseLiveList
                      .filter((item: any) => {
                        const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
                        const matchesSearch = !searchTerm || [
                          item.reference_code,
                          item.customer_name,
                          item.customer_phone,
                          item.customer_email,
                          item.venue_name,
                          item.event_type
                        ].some(f => String(f || '').toLowerCase().includes(searchTerm.toLowerCase()));
                        return matchesStatus && matchesSearch;
                      })
                      .map((b: any) => (
                        <tr key={b.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3.5 font-mono text-[#3ECF8E] font-semibold">
                            <div>{b.reference_code || b.id}</div>
                            <span className="text-[10px] text-white/40 block font-sans">Supabase Verified</span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-white">{b.customer_name}</div>
                            <div className="text-white/50 text-[11px]">{b.customer_phone} · {b.customer_email}</div>
                          </td>
                          <td className="p-3.5 text-white/90">{b.event_type}</td>
                          <td className="p-3.5">
                            <div className="font-medium text-white">{b.event_date}</div>
                            <div className="text-white/50 text-[11px]">{b.time_slot}</div>
                          </td>
                          <td className="p-3.5 text-white/80">
                            <div className="truncate max-w-xs">{b.venue_name || 'Davangere'}</div>
                            <div className="text-white/40 text-[11px]">{b.guest_count || 100} Guests</div>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 text-[10px] uppercase font-semibold ${
                              b.status === 'CONFIRMED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                              b.status === 'QUOTED' ? 'bg-blue-950 text-blue-300 border border-blue-500/40' :
                              b.status === 'HOLD' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                              b.status === 'CANCELLED' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                              'bg-white/10 text-white/80'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(b)}
                                className="px-2.5 py-1 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] font-semibold text-[10px] uppercase tracking-wider cursor-pointer shadow-xs"
                                title="Edit customer, event date, slot, venue, or status"
                              >
                                Edit
                              </button>

                              {b.status !== 'CANCELLED' && (
                                <button
                                  onClick={() => handleOpenCancel(b)}
                                  className="px-2.5 py-1 border border-rose-500/50 text-rose-300 hover:bg-rose-950 font-semibold text-[10px] uppercase tracking-wider cursor-pointer"
                                  title="Cancel appointment and update Supabase"
                                >
                                  Cancel
                                </button>
                              )}

                              <button
                                onClick={() => handleExecuteDelete(b.id, b.reference_code || b.id)}
                                className="px-2 py-1 text-white/40 hover:text-rose-400 text-[10px] uppercase cursor-pointer"
                                title="Delete record"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {supabaseLiveList.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-white/50 text-xs">
                          No Supabase records found or query in progress. Click "Refresh Live Supabase" or "Sync All to Supabase" to push local appointments.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ALL DATABASE BOOKINGS VIEW TABLE */}
            {dataSourceFilter === 'ALL' && (
              <div className="bg-[#18251F] border border-white/10 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 uppercase tracking-wider font-semibold">
                      <th className="p-3.5">Ref Code</th>
                      <th className="p-3.5">Client & Contact</th>
                      <th className="p-3.5">Celebration</th>
                      <th className="p-3.5">Event Date & Slot</th>
                      <th className="p-3.5">Venue</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookingsList.map((b) => (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-mono text-[#D8B77A] font-semibold">
                          <div>{b.reference_code}</div>
                          <span className="text-[9px] text-[#3ECF8E] font-sans flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E]" />
                            Supabase Synced
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-white">{b.customer_name}</div>
                          <div className="text-white/50 text-[11px]">{b.customer_phone} · {b.customer_email}</div>
                        </td>
                        <td className="p-3.5 text-white/90">{b.event_type}</td>
                        <td className="p-3.5">
                          <div className="font-medium text-white">{b.event_date}</div>
                          <div className="text-white/50 text-[11px]">{b.time_slot}</div>
                        </td>
                        <td className="p-3.5 text-white/80 truncate max-w-xs">{b.venue_name}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-semibold ${
                            b.status === 'CONFIRMED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                            b.status === 'QUOTED' ? 'bg-blue-950 text-blue-300 border border-blue-500/40' :
                            b.status === 'HOLD' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                            b.status === 'CANCELLED' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                            'bg-white/10 text-white/80'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => loadBookingDetail(b.id)}
                              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white font-semibold text-[10px] uppercase tracking-wider cursor-pointer"
                              title="Inspect full brief & audit trail"
                            >
                              Manage
                            </button>
                            <button
                              onClick={() => handleOpenEdit(b)}
                              className="px-2.5 py-1 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] font-semibold text-[10px] uppercase tracking-wider cursor-pointer"
                              title="Edit appointment"
                            >
                              Edit
                            </button>
                            {b.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleOpenCancel(b)}
                                className="px-2.5 py-1 border border-rose-500/40 text-rose-300 hover:bg-rose-950/60 font-semibold text-[10px] uppercase tracking-wider cursor-pointer"
                                title="Cancel appointment"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() => handleExecuteDelete(b.id, b.reference_code)}
                              className="px-2 py-1 text-white/40 hover:text-rose-400 text-[10px] uppercase cursor-pointer"
                              title="Delete record"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto bg-[#18251F] border border-white/10 p-8 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="font-serif text-2xl text-[#F6F0E4]">
                Business Capacity & Policy Rules
              </h3>
              <p className="text-xs text-white/60 mt-1">
                Configure calendar concurrency limits, hold durations, and official studio contact credentials.
              </p>
            </div>

            {settingsSuccess && (
              <div className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/70 uppercase tracking-wider font-semibold mb-1">
                  Max Concurrent Celebrations Per Day (Capacity Rule)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={settings.max_concurrent_events || '1'}
                  onChange={(e) => setSettings({ ...settings, max_concurrent_events: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[#D8B77A]"
                />
                <span className="text-[11px] text-white/40 mt-1 block">Set to 1 to enforce sole exclusivity per calendar date across Davangere.</span>
              </div>

              <div>
                <label className="block text-white/70 uppercase tracking-wider font-semibold mb-1">
                  Temporary Hold Expiration Window (Hours)
                </label>
                <input
                  type="number"
                  min={12}
                  max={168}
                  value={settings.hold_duration_hours || '48'}
                  onChange={(e) => setSettings({ ...settings, hold_duration_hours: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[#D8B77A]"
                />
                <span className="text-[11px] text-white/40 mt-1 block">Unfunded holds expire automatically after this duration.</span>
              </div>

              <div>
                <label className="block text-white/70 uppercase tracking-wider font-semibold mb-1">
                  Official Studio Phone
                </label>
                <input
                  type="text"
                  value={settings.business_phone || '+91 96636 43161'}
                  onChange={(e) => setSettings({ ...settings, business_phone: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[#D8B77A]"
                />
              </div>

              <div>
                <label className="block text-white/70 uppercase tracking-wider font-semibold mb-1">
                  Official Studio Email
                </label>
                <input
                  type="email"
                  value={settings.business_email || 'sutraeventss@gmail.com'}
                  onChange={(e) => setSettings({ ...settings, business_email: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[#D8B77A]"
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#D8B77A] text-[#18251F] text-xs font-semibold uppercase tracking-wider hover:bg-[#c9a667] cursor-pointer"
                >
                  Save Policy Configuration
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SUPABASE DATABASE TAB */}
        {activeTab === 'supabase' && (
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Header Card */}
            <div className="bg-[#18251F] border border-[#D8B77A] p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#3ECF8E]/20 text-[#3ECF8E] flex items-center justify-center border border-[#3ECF8E]/40">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl text-[#F6F0E4]">
                      Supabase Cloud Database Integration
                    </h3>
                    <p className="text-xs text-[#D8B77A] mt-0.5">
                      Live sync for appointments and booking requests
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadSupabaseStatus}
                    disabled={isLoadingSupabase}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSupabase ? 'animate-spin' : ''}`} />
                    <span>{isLoadingSupabase ? 'Testing...' : 'Test Connection'}</span>
                  </button>

                  <a
                    href="https://supabase.com/dashboard/project/hfopeubspzlxoyrljjtc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#3ECF8E] hover:bg-[#34b67b] text-black font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>Supabase Dashboard</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Status Banner */}
              {supabaseStatus && (
                <div className={`p-4 border text-xs space-y-2 ${
                  supabaseStatus.tablesExist 
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' 
                    : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${supabaseStatus.tablesExist ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <span>
                        {supabaseStatus.tablesExist 
                          ? 'Supabase Connected & Ready for Auto-Sync' 
                          : 'Supabase Connected · Database Tables Needed'}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] text-white/70">
                      Project: {supabaseStatus.projectId}
                    </span>
                  </div>

                  <p className="text-[11px] opacity-90 leading-relaxed">
                    {supabaseStatus.message}
                  </p>

                  {supabaseStatus.tablesFound && supabaseStatus.tablesFound.length > 0 && (
                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <span className="text-white/60">Verified Active Tables:</span>
                      {supabaseStatus.tablesFound.map((tbl: string) => (
                        <span key={tbl} className="bg-emerald-900/60 text-emerald-300 px-2 py-0.5 font-mono text-[10px]">
                          {tbl}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Credentials & Endpoint Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-3 bg-white/5 border border-white/10 space-y-1">
                  <span className="text-white/50 block text-[10px] uppercase">Supabase Project ID</span>
                  <span className="font-mono text-white font-medium">hfopeubspzlxoyrljjtc</span>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 space-y-1">
                  <span className="text-white/50 block text-[10px] uppercase">API Endpoint URL</span>
                  <span className="font-mono text-white text-[11px] truncate block">https://hfopeubspzlxoyrljjtc.supabase.co</span>
                </div>
              </div>

              {/* Sync Controls */}
              <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-white/70">
                  Whenever a customer submits a booking or appointment, it is automatically pushed to your Supabase tables.
                </div>

                <button
                  onClick={handleSyncAllToSupabase}
                  disabled={isSyncingAll}
                  className="px-5 py-2.5 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] font-semibold text-xs uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSyncingAll ? 'Syncing to Supabase...' : 'Sync All Bookings Now'}
                </button>
              </div>

              {syncAllResult && (
                <div className={`p-3 text-xs border ${syncAllResult.synced > 0 ? 'bg-emerald-950 border-emerald-500 text-emerald-200' : 'bg-amber-950 border-amber-500 text-amber-200'}`}>
                  {syncAllResult.message}
                </div>
              )}
            </div>

            {/* SQL Setup Helper Card (If tables are not created yet) */}
            <div className="bg-[#18251F] border border-white/10 p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h4 className="font-serif text-xl text-[#F6F0E4]">
                    1-Click Supabase SQL Setup
                  </h4>
                  <p className="text-xs text-white/60 mt-0.5">
                    If your Supabase database doesn't have the tables yet, run this script once in your Supabase SQL Editor.
                  </p>
                </div>

                <button
                  onClick={handleCopySchema}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-[#D8B77A] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchema ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <div className="text-xs text-white/70 space-y-2">
                <p>
                  <strong>How to run:</strong>
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-[11px] text-white/60">
                  <li>Open your <a href="https://supabase.com/dashboard/project/hfopeubspzlxoyrljjtc/sql" target="_blank" rel="noopener noreferrer" className="text-[#3ECF8E] underline">Supabase SQL Editor</a>.</li>
                  <li>Click "New query", paste the script below, and click <strong>Run</strong>.</li>
                  <li>It creates both <code className="bg-black/50 text-[#3ECF8E] px-1 py-0.5">booking_requests</code> and <code className="bg-black/50 text-[#3ECF8E] px-1 py-0.5">appointments</code> tables with public insert/select permissions!</li>
                </ol>
              </div>

              <div className="relative">
                <pre className="p-4 bg-black/60 border border-white/10 font-mono text-[11px] text-[#3ECF8E] overflow-x-auto max-h-56 leading-relaxed">
                  {sqlSchema || '-- Loading SQL script...'}
                </pre>
              </div>
            </div>

            {/* Recent Supabase Sync Logs */}
            <div className="bg-[#18251F] border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="font-serif text-xl text-[#F6F0E4]">
                  Live Supabase Sync Log
                </h4>
                <span className="text-xs text-white/40">Recent Activity</span>
              </div>

              <div className="divide-y divide-white/5 text-xs">
                {supabaseStatus?.recentLogs?.length === 0 ? (
                  <div className="py-6 text-center text-white/40">
                    No sync events recorded yet. New appointments will appear here automatically.
                  </div>
                ) : (
                  supabaseStatus?.recentLogs?.map((log: any) => (
                    <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          <span className="font-mono text-[#D8B77A]">{log.reference_code || 'General Sync'}</span>
                          <span className="text-white/40">→</span>
                          <span className="font-mono text-white/70">{log.target_table}</span>
                        </div>
                        <p className="text-[11px] text-white/60">{log.message}</p>
                      </div>

                      <div className="text-right text-[10px] text-white/40 shrink-0">
                        {new Date(log.created_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* DETAIL & MANAGEMENT MODAL / DRAWER */}
      {selectedBookingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#18251F] border border-[#D8B77A] max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#F6F0E4]">
            
            <button
              onClick={() => setSelectedBookingDetail(null)}
              className="absolute top-5 right-5 p-1 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="border-b border-white/10 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#D8B77A] font-semibold uppercase tracking-wider">
                    <span>{selectedBookingDetail.booking.reference_code}</span>
                    <span aria-hidden="true">·</span>
                    <span>Current Status: {selectedBookingDetail.booking.status}</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#F6F0E4] mt-1">
                    {selectedBookingDetail.booking.customer_name}
                  </h3>
                  <div className="text-xs text-white/60 mt-1">
                    {selectedBookingDetail.booking.event_type} · {selectedBookingDetail.booking.event_date} ({selectedBookingDetail.booking.time_slot})
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit()}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#D8B77A]" />
                    <span>Edit Details</span>
                  </button>

                  {selectedBookingDetail.booking.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleOpenCancel()}
                      className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-600/50 text-rose-200 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Cancel</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleExecuteDelete(selectedBookingDetail.booking.id, selectedBookingDetail.booking.reference_code)}
                    className="p-1.5 text-white/40 hover:text-rose-400 cursor-pointer"
                    title="Permanently Delete Booking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Conflict Warning Alert if date is not available */}
            {selectedBookingDetail.dateAvailability && !selectedBookingDetail.dateAvailability.isAvailable && selectedBookingDetail.booking.status === 'PENDING' && (
              <div className="p-4 bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm">Schedule Conflict Alert!</div>
                  <p className="mt-0.5">
                    {selectedBookingDetail.dateAvailability.reason}
                  </p>
                  <p className="mt-1 text-[11px] text-rose-300">
                    You cannot change this booking to CONFIRMED or HOLD on this date without causing an active date collision. Use the Reschedule tool below to pick an open date.
                  </p>
                </div>
              </div>
            )}

            {/* Feedback Notifications */}
            {actionError && (
              <div className="p-3 bg-rose-950 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {actionSuccess && (
              <div className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Status Change Action Buttons */}
            <div className="p-4 bg-white/5 border border-white/10 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D8B77A] block">
                Update Booking Status (Rechecks Conflicts on Confirm/Hold)
              </span>

              <div className="flex flex-wrap gap-2 pt-1">
                {['PENDING', 'QUOTED', 'HOLD', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(st)}
                    disabled={selectedBookingDetail.booking.status === st}
                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors ${
                      selectedBookingDetail.booking.status === st
                        ? 'bg-white/20 text-white/50 cursor-not-allowed'
                        : st === 'CONFIRMED'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : st === 'HOLD'
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    Set to {st}
                  </button>
                ))}

                <button
                  onClick={() => setIsRescheduling(!isRescheduling)}
                  className="px-3 py-1.5 border border-[#D8B77A] text-[#D8B77A] hover:bg-[#D8B77A]/10 text-xs font-semibold uppercase tracking-wider cursor-pointer ml-auto"
                >
                  Reschedule Date
                </button>
              </div>
            </div>

            {/* Reschedule Drawer Form */}
            {isRescheduling && (
              <div className="p-4 bg-black/40 border border-[#D8B77A]/40 space-y-3">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#D8B77A]">
                  Reschedule Event Date & Verify Capacity
                </h4>

                {rescheduleError && (
                  <div className="p-2 bg-rose-950 text-rose-200 text-xs">
                    {rescheduleError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-white/60 block mb-1">New Event Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full p-2 bg-white/10 border border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-white/60 block mb-1">Slot</label>
                    <select
                      value={rescheduleSlot}
                      onChange={(e) => setRescheduleSlot(e.target.value)}
                      className="w-full p-2 bg-white/10 border border-white/20 text-white"
                    >
                      <option value="Morning (Muhurtham 6 AM - 2 PM)">Morning (Muhurtham 6 AM - 2 PM)</option>
                      <option value="Evening (Reception 4 PM - 11 PM)">Evening (Reception 4 PM - 11 PM)</option>
                      <option value="Full Day (6 AM - 11 PM)">Full Day (6 AM - 11 PM)</option>
                      <option value="Multi-Day Celebration">Multi-Day Celebration</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-white/60 block mb-1">Reason for Reschedule</label>
                    <input
                      type="text"
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                      placeholder="e.g. Astrological muhurtham shift requested by family"
                      className="w-full p-2 bg-white/10 border border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsRescheduling(false)}
                    className="px-3 py-1.5 text-xs text-white/70 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteReschedule}
                    className="px-4 py-1.5 bg-[#D8B77A] text-[#18251F] text-xs font-semibold uppercase tracking-wider"
                  >
                    Execute Reschedule
                  </button>
                </div>
              </div>
            )}

            {/* Client Requirements & Design Brief Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white/5 p-4 border border-white/10">
              <div>
                <span className="text-white/50 block text-[10px] uppercase">Venue & Guest Scale</span>
                <span className="text-white font-medium block mt-0.5">
                  {selectedBookingDetail.booking.venue_name} ({selectedBookingDetail.booking.venue_type})
                </span>
                <span className="text-white/60 block">{selectedBookingDetail.booking.venue_address} · {selectedBookingDetail.booking.guest_count} Guests</span>
              </div>

              <div>
                <span className="text-white/50 block text-[10px] uppercase">Client Budget Tier & Timing</span>
                <span className="text-[#D8B77A] font-medium block mt-0.5">{selectedBookingDetail.booking.estimated_budget_tier}</span>
                <span className="text-white/60 block">{selectedBookingDetail.booking.duration_hours}h Event · {selectedBookingDetail.booking.setup_buffer_hours}h Setup Buffer</span>
              </div>

              {selectedBookingDetail.booking.client_notes && (
                <div className="sm:col-span-2 pt-2 border-t border-white/10">
                  <span className="text-white/50 block text-[10px] uppercase">Client Notes</span>
                  <p className="text-white/90 mt-0.5">{selectedBookingDetail.booking.client_notes}</p>
                </div>
              )}
            </div>

            {/* ITEMIZED QUOTATION BUILDER */}
            <div className="border border-[#D8B77A]/40 p-4 sm:p-6 bg-black/30 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#D8B77A]" />
                  <h4 className="font-serif text-xl text-[#F6F0E4]">
                    Itemized Quotation Manager
                  </h4>
                </div>

                <button
                  onClick={() => setIsEditingQuote(!isEditingQuote)}
                  className="px-3 py-1 bg-[#D8B77A] text-[#18251F] text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  {isEditingQuote ? 'Close Editor' : selectedBookingDetail.quotation ? 'Edit Quotation' : 'Create Quotation'}
                </button>
              </div>

              {isEditingQuote ? (
                <form onSubmit={handleSaveQuotation} className="space-y-4 text-xs">
                  {quoteSaveError && (
                    <div className="p-2 bg-rose-950 text-rose-200">{quoteSaveError}</div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white/70 uppercase">Line Items</span>
                      <button
                        type="button"
                        onClick={handleAddItemToQuote}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#D8B77A] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Item</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {quoteItems.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white/5 p-2 border border-white/10">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateQuoteItem(idx, 'description', e.target.value)}
                            placeholder="Description"
                            className="col-span-5 p-1.5 bg-black/40 border border-white/20 text-white"
                          />
                          <input
                            type="text"
                            value={item.category}
                            onChange={(e) => handleUpdateQuoteItem(idx, 'category', e.target.value)}
                            placeholder="Category"
                            className="col-span-3 p-1.5 bg-black/40 border border-white/20 text-white"
                          />
                          <input
                            type="number"
                            value={item.unit_cost}
                            onChange={(e) => handleUpdateQuoteItem(idx, 'unit_cost', e.target.value)}
                            placeholder="Rate"
                            className="col-span-2 p-1.5 bg-black/40 border border-white/20 text-white font-mono"
                          />
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuoteItem(idx, 'quantity', e.target.value)}
                            placeholder="Qty"
                            className="col-span-1 p-1.5 bg-black/40 border border-white/20 text-white font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveQuoteItem(idx)}
                            className="col-span-1 p-1.5 text-rose-400 hover:text-rose-300 text-center"
                          >
                            <Trash2 className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
                    <div>
                      <label className="text-white/60 block mb-1">Tax Percentage (%)</label>
                      <input
                        type="number"
                        value={quoteTax}
                        onChange={(e) => setQuoteTax(Number(e.target.value))}
                        className="w-full p-2 bg-white/10 border border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 block mb-1">Discount Amount (₹)</label>
                      <input
                        type="number"
                        value={quoteDiscount}
                        onChange={(e) => setQuoteDiscount(Number(e.target.value))}
                        className="w-full p-2 bg-white/10 border border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 block mb-1">Advance Deposit (%)</label>
                      <input
                        type="number"
                        value={quoteAdvancePct}
                        onChange={(e) => setQuoteAdvancePct(Number(e.target.value))}
                        className="w-full p-2 bg-white/10 border border-white/20 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-white/60 block mb-1">Cancellation & Advance Policy Terms</label>
                    <textarea
                      rows={2}
                      value={quoteTerms}
                      onChange={(e) => setQuoteTerms(e.target.value)}
                      className="w-full p-2 bg-white/10 border border-white/20 text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingQuote(false)}
                      className="px-4 py-2 text-white/70"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingQuote}
                      className="px-6 py-2 bg-[#D8B77A] text-[#18251F] font-semibold uppercase tracking-wider hover:bg-[#c9a667]"
                    >
                      {isSavingQuote ? 'Saving...' : 'Save & Issue Quotation'}
                    </button>
                  </div>
                </form>
              ) : selectedBookingDetail.quotation ? (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center text-white/80">
                    <span>Quotation #{selectedBookingDetail.quotation.quotation_number} ({selectedBookingDetail.quotation.status})</span>
                    <span className="font-mono text-base text-[#D8B77A] font-semibold">
                      Total: ₹{selectedBookingDetail.quotation.grand_total.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="bg-white/5 p-3 space-y-1">
                    <div className="flex justify-between text-white/60">
                      <span>Advance Amount ({selectedBookingDetail.quotation.advance_percentage}%):</span>
                      <span className="font-mono text-white">₹{selectedBookingDetail.quotation.advance_amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-white/60">
                      <span>Balance Due:</span>
                      <span className="font-mono text-white">₹{selectedBookingDetail.quotation.balance_amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-white/50 text-center py-4">
                  No quotation created yet. Click "Create Quotation" above to prepare an itemized estimate.
                </div>
              )}
            </div>

            {/* AUDIT TIMELINE IN MODAL */}
            <div className="space-y-2 border-t border-white/10 pt-4 text-xs">
              <span className="font-semibold uppercase tracking-wider text-white/60 block">
                Booking Audit Trail
              </span>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {selectedBookingDetail.timeline.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-white/70 text-[11px]">
                    <span className="text-[#D8B77A]">•</span>
                    <div>
                      <strong>{log.performed_by}</strong>: {log.notes} ({new Date(log.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })})
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* EDIT APPOINTMENT MODAL */}
      {isEditingAppointment && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#18251F] border border-[#D8B77A] max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#F6F0E4]">
            
            <button
              onClick={() => setIsEditingAppointment(false)}
              className="absolute top-5 right-5 p-1 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-white/10 pb-3">
              <div className="text-xs font-semibold text-[#D8B77A] uppercase tracking-wider">
                Edit Appointment · {editFormData.referenceCode}
              </div>
              <h3 className="font-serif text-2xl text-[#F6F0E4] mt-1">
                Update Booking & Venue Specifications
              </h3>
            </div>

            {editError && (
              <div className="p-3 bg-rose-950 border border-rose-500 text-rose-200 text-xs">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 uppercase font-semibold mb-1">Customer / Family Name *</label>
                  <input
                    type="text"
                    value={editFormData.customerName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                    required
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[#D8B77A]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 uppercase font-semibold mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    value={editFormData.customerPhone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, customerPhone: e.target.value })}
                    required
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[#D8B77A]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 uppercase font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={editFormData.customerEmail || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, customerEmail: e.target.value })}
                    required
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[#D8B77A]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 uppercase font-semibold mb-1">Celebration Type *</label>
                  <select
                    value={editFormData.eventType || 'Wedding & Royal Mandap'}
                    onChange={(e) => setEditFormData({ ...editFormData, eventType: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none"
                  >
                    <option value="Wedding & Royal Mandap">Wedding & Royal Mandap</option>
                    <option value="Grand Reception Gala">Grand Reception Gala</option>
                    <option value="Traditional Haldi & Mehendi">Traditional Haldi & Mehendi</option>
                    <option value="Engagement & Ring Ceremony">Engagement & Ring Ceremony</option>
                    <option value="Traditional Seemantha / Baby Shower">Traditional Seemantha / Baby Shower</option>
                    <option value="Milestone Birthday & Anniversary">Milestone Birthday & Anniversary</option>
                    <option value="Gruha Pravesha (Housewarming)">Gruha Pravesha (Housewarming)</option>
                    <option value="Corporate Conclave & Brand Gala">Corporate Conclave & Brand Gala</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 uppercase font-semibold mb-1">Event Date *</label>
                  <input
                    type="date"
                    value={editFormData.eventDate || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, eventDate: e.target.value })}
                    required
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[#D8B77A]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 uppercase font-semibold mb-1">Time Slot *</label>
                  <select
                    value={editFormData.timeSlot || 'Morning (Muhurtham 6 AM - 2 PM)'}
                    onChange={(e) => setEditFormData({ ...editFormData, timeSlot: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none"
                  >
                    <option value="Morning (Muhurtham 6 AM - 2 PM)">Morning (Muhurtham 6 AM - 2 PM)</option>
                    <option value="Evening (Reception 4 PM - 11 PM)">Evening (Reception 4 PM - 11 PM)</option>
                    <option value="Full Day (6 AM - 11 PM)">Full Day (6 AM - 11 PM)</option>
                    <option value="Multi-Day Celebration">Multi-Day Celebration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 uppercase font-semibold mb-1">Venue Name</label>
                  <input
                    type="text"
                    value={editFormData.venueName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, venueName: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white/70 uppercase font-semibold mb-1">Venue Locality in Davangere</label>
                  <input
                    type="text"
                    value={editFormData.venueAddress || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, venueAddress: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white/70 uppercase font-semibold mb-1">Estimated Guests</label>
                  <input
                    type="number"
                    value={editFormData.guestCount || 100}
                    onChange={(e) => setEditFormData({ ...editFormData, guestCount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white/70 uppercase font-semibold mb-1">Status</label>
                  <select
                    value={editFormData.status || 'PENDING'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="QUOTED">QUOTED</option>
                    <option value="HOLD">HOLD</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/70 uppercase font-semibold mb-1">Client Special Notes</label>
                <textarea
                  rows={2}
                  value={editFormData.clientNotes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, clientNotes: e.target.value })}
                  className="w-full p-2 bg-white/5 border border-white/20 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 uppercase font-semibold mb-1">Admin Internal Notes</label>
                <textarea
                  rows={2}
                  value={editFormData.adminNotes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, adminNotes: e.target.value })}
                  className="w-full p-2 bg-white/5 border border-white/20 text-white focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingAppointment(false)}
                  className="px-4 py-2 text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-6 py-2.5 bg-[#D8B77A] text-[#18251F] font-semibold uppercase tracking-wider hover:bg-[#c9a667]"
                >
                  {isSavingEdit ? 'Saving...' : 'Save & Sync Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL APPOINTMENT CONFIRMATION MODAL */}
      {isCancellingAppointment && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#18251F] border border-rose-500/60 max-w-md w-full p-6 space-y-4 shadow-2xl relative text-[#F6F0E4]">
            
            <div className="flex items-center gap-3 text-rose-300">
              <XCircle className="w-6 h-6" />
              <h3 className="font-serif text-2xl text-[#F6F0E4]">
                Cancel Appointment
              </h3>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Are you sure you want to cancel this celebration appointment? Cancelling releases the calendar date lock and records the audit history.
            </p>

            <div className="space-y-2 text-xs">
              <label className="block text-white/80 uppercase font-semibold">
                Reason for Cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none"
              >
                <option value="Client requested cancellation">Client requested cancellation</option>
                <option value="Event postponed indefinitely">Event postponed indefinitely</option>
                <option value="Unpaid advance deposit expired">Unpaid advance deposit expired</option>
                <option value="Venue unavailability or conflict">Venue unavailability or conflict</option>
                <option value="Duplicate booking enquiry">Duplicate booking enquiry</option>
                <option value="Other administrative reason">Other administrative reason</option>
              </select>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCancellingAppointment(false)}
                className="px-4 py-2 text-white/70 hover:text-white text-xs"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleExecuteCancel}
                disabled={isSavingCancel}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs uppercase tracking-wider"
              >
                {isSavingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW APPOINTMENT MODAL */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#18251F] border border-[#D8B77A] max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#F6F0E4]">
            
            <button
              onClick={() => setIsCreatingNew(false)}
              className="absolute top-5 right-5 p-1 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-white/10 pb-3">
              <div className="text-xs font-semibold text-[#D8B77A] uppercase tracking-wider">
                Direct Studio Booking
              </div>
              <h3 className="font-serif text-2xl text-[#F6F0E4] mt-1">
                Create New Celebration Appointment
              </h3>
            </div>

            {newError && (
              <div className="p-3 bg-rose-950 border border-rose-500 text-rose-200 text-xs">
                {newError}
              </div>
            )}

            <form onSubmit={handleCreateNewBooking} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 uppercase font-semibold mb-1">Customer / Family Name *</label>
                  <input
                    type="text"
                    value={newFormData.customerName}
                    onChange={(e) => setNewFormData({ ...newFormData, customerName: e.target.value })}
                    required
                    placeholder="e.g. Nagaraj & Suma"
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[#D8B77A]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 uppercase font-semibold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    value={newFormData.customerPhone}
                    onChange={(e) => setNewFormData({ ...newFormData, customerPhone: e.target.value })}
                    required
                    placeholder="+91 98450..."
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[#D8B77A]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 uppercase font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newFormData.customerEmail}
                    onChange={(e) => setNewFormData({ ...newFormData, customerEmail: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[#D8B77A]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 uppercase font-semibold mb-1">Celebration Type *</label>
                  <select
                    value={newFormData.eventType}
                    onChange={(e) => setNewFormData({ ...newFormData, eventType: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none"
                  >
                    <option value="Wedding & Royal Mandap">Wedding & Royal Mandap</option>
                    <option value="Grand Reception Gala">Grand Reception Gala</option>
                    <option value="Traditional Haldi & Mehendi">Traditional Haldi & Mehendi</option>
                    <option value="Engagement & Ring Ceremony">Engagement & Ring Ceremony</option>
                    <option value="Traditional Seemantha / Baby Shower">Traditional Seemantha / Baby Shower</option>
                    <option value="Milestone Birthday & Anniversary">Milestone Birthday & Anniversary</option>
                    <option value="Gruha Pravesha (Housewarming)">Gruha Pravesha (Housewarming)</option>
                    <option value="Corporate Conclave & Brand Gala">Corporate Conclave & Brand Gala</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 uppercase font-semibold mb-1">Event Date *</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={newFormData.eventDate}
                    onChange={(e) => setNewFormData({ ...newFormData, eventDate: e.target.value })}
                    required
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[#D8B77A]"
                  />
                </div>

                <div>
                  <label className="block text-white/70 uppercase font-semibold mb-1">Time Slot *</label>
                  <select
                    value={newFormData.timeSlot}
                    onChange={(e) => setNewFormData({ ...newFormData, timeSlot: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none"
                  >
                    <option value="Morning (Muhurtham 6 AM - 2 PM)">Morning (Muhurtham 6 AM - 2 PM)</option>
                    <option value="Evening (Reception 4 PM - 11 PM)">Evening (Reception 4 PM - 11 PM)</option>
                    <option value="Full Day (6 AM - 11 PM)">Full Day (6 AM - 11 PM)</option>
                    <option value="Multi-Day Celebration">Multi-Day Celebration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 uppercase font-semibold mb-1">Venue Name</label>
                  <input
                    type="text"
                    value={newFormData.venueName}
                    onChange={(e) => setNewFormData({ ...newFormData, venueName: e.target.value })}
                    placeholder="e.g. Bapuji Convention Center"
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white/70 uppercase font-semibold mb-1">Initial Status</label>
                  <select
                    value={newFormData.status}
                    onChange={(e) => setNewFormData({ ...newFormData, status: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white focus:outline-none"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="HOLD">HOLD (48h Reservation)</option>
                    <option value="CONFIRMED">CONFIRMED (Advance Received)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/70 uppercase font-semibold mb-1">Notes / Special Instructions</label>
                <textarea
                  rows={2}
                  value={newFormData.clientNotes}
                  onChange={(e) => setNewFormData({ ...newFormData, clientNotes: e.target.value })}
                  placeholder="Floral preferences, entrance details, etc."
                  className="w-full p-2 bg-white/5 border border-white/20 text-white focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingNew}
                  className="px-6 py-2.5 bg-[#D8B77A] text-[#18251F] font-semibold uppercase tracking-wider hover:bg-[#c9a667]"
                >
                  {isSavingNew ? 'Creating...' : 'Create Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
