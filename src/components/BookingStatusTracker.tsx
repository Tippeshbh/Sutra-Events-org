import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle2, AlertCircle, FileText, Calendar, MapPin, User, ShieldCheck, ArrowRight, XCircle, Phone, MessageSquare } from 'lucide-react';
import { BookingRequest, Quotation, AuditLog } from '../types/index.js';

interface BookingStatusTrackerProps {
  initialRefCode?: string;
  initialVerifyContact?: string;
}

export const BookingStatusTracker: React.FC<BookingStatusTrackerProps> = ({
  initialRefCode = '',
  initialVerifyContact = ''
}) => {
  const [refCode, setRefCode] = useState(initialRefCode);
  const [verifyContact, setVerifyContact] = useState(initialVerifyContact);
  
  const [isLoading, setIsLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [bookingData, setBookingData] = useState<{
    booking: BookingRequest;
    quotation: Quotation | null;
    timeline: AuditLog[];
  } | null>(null);

  // Response action state (Accept / Decline quote)
  const [isResponding, setIsResponding] = useState(false);
  const [responseNotice, setResponseNotice] = useState<string | null>(null);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!refCode.trim() || !verifyContact.trim()) {
      setLookupError('Please enter both your Reference Code and registered Phone or Email.');
      return;
    }

    setIsLoading(true);
    setLookupError(null);
    setResponseNotice(null);

    try {
      const res = await fetch('/api/bookings/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceCode: refCode, verifyContact })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to retrieve booking records.');
      }

      setBookingData(data);
    } catch (err: any) {
      setLookupError(err.message || 'Error communicating with server.');
      setBookingData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialRefCode && initialVerifyContact) {
      handleLookup();
    }
  }, [initialRefCode, initialVerifyContact]);

  const handleQuotationResponse = async (action: 'ACCEPT' | 'DECLINE') => {
    if (!bookingData) return;
    setIsResponding(true);
    setLookupError(null);

    try {
      const res = await fetch(`/api/bookings/${bookingData.booking.id}/quotation/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          verifyContact,
          declineReason: action === 'DECLINE' ? 'Customer opted not to proceed at this time.' : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update quotation response');
      }

      setResponseNotice(data.message);
      // Refresh details
      await handleLookup();
    } catch (err: any) {
      setLookupError(err.message || 'Error processing your response');
    } finally {
      setIsResponding(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="text-emerald-800 font-semibold">● Confirmed Reservation</span>;
      case 'HOLD':
        return <span className="text-amber-800 font-semibold">● Active 48h Temporary Hold</span>;
      case 'QUOTED':
        return <span className="text-blue-800 font-semibold">● Itemized Quotation Ready</span>;
      case 'PENDING':
        return <span className="text-neutral-700 font-semibold">● Under Review / Availability Verification</span>;
      case 'COMPLETED':
        return <span className="text-emerald-900 font-semibold">● Celebration Completed</span>;
      case 'CANCELLED':
        return <span className="text-rose-800 font-semibold">● Cancelled / Inactive</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="bg-[#F6F0E4] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="max-w-3xl">
          <div className="text-xs font-semibold text-[#8D5962] tracking-widest uppercase mb-2">
            Secure Client Portal
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#18251F] font-normal">
            Track Booking & Review Quotation
          </h2>
          <p className="mt-2 text-sm text-[#18251F]/70 leading-relaxed">
            Verify the real-time progress of your celebration enquiry, inspect itemized estimates, and confirm temporary reservation holds securely.
          </p>
        </div>

        {/* Lookup Box */}
        <div className="bg-white border border-[#D8B77A]/40 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1.5">
                  Enquiry Reference Code *
                </label>
                <input
                  type="text"
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value)}
                  placeholder="e.g. SUTRA-2026-8812"
                  required
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 text-xs font-mono uppercase tracking-wider text-[#18251F] focus:outline-none focus:border-[#D8B77A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1.5">
                  Registered Phone or Email *
                </label>
                <input
                  type="text"
                  value={verifyContact}
                  onChange={(e) => setVerifyContact(e.target.value)}
                  placeholder="e.g. 9845012345 or email@domain.com"
                  required
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#18251F] focus:outline-none focus:border-[#D8B77A]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-neutral-500">
                Identity verification enforces customer confidentiality.
              </span>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-[#18251F] hover:bg-[#253930] text-[#F6F0E4] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <Search className="w-4 h-4 text-[#D8B77A]" />
                <span>{isLoading ? 'Verifying...' : 'Check Status'}</span>
              </button>
            </div>
          </form>

          {/* Lookup Error Alert */}
          {lookupError && (
            <div className="mt-4 p-3.5 bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{lookupError}</span>
            </div>
          )}

          {/* Response Notification Message */}
          {responseNotice && (
            <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{responseNotice}</span>
            </div>
          )}
        </div>

        {/* BOOKING DETAILS DISPLAY */}
        {bookingData && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Status Card Banner */}
            <div className="bg-[#18251F] text-[#F6F0E4] border border-[#D8B77A]/40 p-6 sm:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[11px] text-[#D8B77A] uppercase tracking-widest block">
                    Official Booking Status
                  </span>
                  <div className="text-xl sm:text-2xl font-serif text-[#F6F0E4] mt-1">
                    {getStatusBadge(bookingData.booking.status)}
                  </div>
                </div>

                <div className="text-right sm:text-right">
                  <span className="text-[11px] text-white/50 uppercase tracking-widest block">Reference Code</span>
                  <span className="font-mono text-lg font-semibold text-[#D8B77A]">
                    {bookingData.booking.reference_code}
                  </span>
                </div>
              </div>

              {/* Hold Warning if in HOLD state */}
              {bookingData.booking.status === 'HOLD' && bookingData.booking.hold_expires_at && (
                <div className="p-3 bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Your date is locked under temporary reservation until <strong>{new Date(bookingData.booking.hold_expires_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</strong>. Please complete the advance deposit to finalize your confirmed contract.
                  </span>
                </div>
              )}

              {/* Key Event Summary Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
                <div>
                  <span className="text-white/50 block text-[10px] uppercase">Celebration</span>
                  <span className="text-[#F6F0E4] font-medium mt-0.5 block">{bookingData.booking.event_type}</span>
                </div>
                <div>
                  <span className="text-white/50 block text-[10px] uppercase">Event Date</span>
                  <span className="text-[#D8B77A] font-medium mt-0.5 block">{bookingData.booking.event_date}</span>
                </div>
                <div>
                  <span className="text-white/50 block text-[10px] uppercase">Slot</span>
                  <span className="text-[#F6F0E4] font-medium mt-0.5 block">{bookingData.booking.time_slot}</span>
                </div>
                <div>
                  <span className="text-white/50 block text-[10px] uppercase">Venue</span>
                  <span className="text-[#F6F0E4] font-medium mt-0.5 block truncate">{bookingData.booking.venue_name}</span>
                </div>
              </div>

              {bookingData.booking.admin_notes && (
                <div className="mt-4 pt-4 border-t border-white/10 text-xs text-[#F6F0E4]/90">
                  <span className="text-[#D8B77A] font-semibold">Studio Coordinator Update: </span>
                  <span>{bookingData.booking.admin_notes}</span>
                </div>
              )}
            </div>

            {/* ITEMIZED QUOTATION SECTION (IF ISSUED) */}
            {bookingData.quotation ? (
              <div className="bg-white border border-[#D8B77A] p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                  <div>
                    <span className="text-xs font-semibold text-[#8D5962] uppercase tracking-wider">
                      Itemized Décor Quotation
                    </span>
                    <h3 className="font-serif text-2xl text-[#18251F] mt-0.5">
                      Quote #{bookingData.quotation.quotation_number}
                    </h3>
                  </div>

                  <div className="text-xs text-neutral-600">
                    <div>Valid Until: <strong>{bookingData.quotation.valid_until}</strong></div>
                    <div className="mt-0.5">Quote Status: <span className="font-semibold text-[#18251F]">{bookingData.quotation.status}</span></div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-300 text-neutral-500 font-semibold uppercase tracking-wider">
                        <th className="py-2.5 pr-4">Description</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 pl-3 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {bookingData.quotation.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/50">
                          <td className="py-3 pr-4 font-medium text-[#18251F]">{item.description}</td>
                          <td className="py-3 px-3 text-neutral-600">{item.category}</td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums">{item.unit_cost.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-3 text-center font-mono tabular-nums">{item.quantity}</td>
                          <td className="py-3 pl-3 text-right font-mono font-semibold tabular-nums text-[#18251F]">{item.total.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Totals Calculation Box */}
                <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row justify-between gap-6">
                  <div className="sm:max-w-md space-y-2 text-xs text-neutral-600">
                    <div className="font-semibold text-[#18251F]">Advance & Cancellation Terms:</div>
                    <p className="leading-relaxed text-[11px]">
                      {bookingData.quotation.cancellation_terms}
                    </p>
                  </div>

                  <div className="w-full sm:w-72 space-y-2 text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>Subtotal</span>
                      <span className="font-mono tabular-nums">₹{bookingData.quotation.subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    {bookingData.quotation.tax_amount > 0 && (
                      <div className="flex justify-between text-neutral-600">
                        <span>GST ({bookingData.quotation.tax_percent}%)</span>
                        <span className="font-mono tabular-nums">₹{bookingData.quotation.tax_amount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {bookingData.quotation.discount_amount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Special Discount</span>
                        <span className="font-mono tabular-nums">-₹{bookingData.quotation.discount_amount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm font-serif font-bold text-[#18251F] pt-2 border-t border-neutral-200">
                      <span>Grand Total</span>
                      <span className="font-mono tabular-nums">₹{bookingData.quotation.grand_total.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-xs text-[#8D5962] font-semibold pt-1">
                      <span>Required Advance ({bookingData.quotation.advance_percentage}%)</span>
                      <span className="font-mono tabular-nums">₹{bookingData.quotation.advance_amount.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>Balance on Event Completion</span>
                      <span className="font-mono tabular-nums">₹{bookingData.quotation.balance_amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Action Buttons if quotation is pending review */}
                {(bookingData.booking.status === 'QUOTED' || bookingData.quotation.status === 'SENT') && (
                  <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-neutral-600">
                      Ready to lock your celebration date with Sutra Events?
                    </p>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => handleQuotationResponse('ACCEPT')}
                        disabled={isResponding}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        {isResponding ? 'Processing...' : 'Accept Quotation & Place Hold'}
                      </button>

                      <button
                        onClick={() => handleQuotationResponse('DECLINE')}
                        disabled={isResponding}
                        className="flex-1 sm:flex-none px-4 py-2.5 border border-neutral-300 hover:border-neutral-500 text-neutral-700 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Decline Quote
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-neutral-200 p-6 text-center space-y-3">
                <FileText className="w-8 h-8 text-[#D8B77A] mx-auto" />
                <h4 className="font-serif text-lg text-[#18251F]">Itemized Quotation Preparation in Progress</h4>
                <p className="text-xs text-neutral-600 max-w-md mx-auto">
                  Our design directors are examining venue structural buffers and calculating fresh flower sourcing quantities. You will be notified via email and WhatsApp as soon as your quotation is ready.
                </p>
              </div>
            )}

            {/* AUDIT LOG TIMELINE */}
            <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-4">
              <h4 className="font-serif text-xl text-[#18251F] border-b border-neutral-100 pb-3">
                Auditable Reservation History
              </h4>

              <div className="space-y-4 pt-2">
                {bookingData.timeline.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#D8B77A] mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                        <span>{log.performed_by} · {log.action}</span>
                        <span>{new Date(log.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                      </div>
                      <p className="text-[#18251F] font-medium mt-0.5">
                        {log.notes || 'Status changed'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Contact Assistance */}
            <div className="p-4 bg-[#F6F0E4] border border-[#D8B77A]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D8B77A]" />
                <span>Need assistance with your booking? Direct Studio Phone: <strong>+91 96636 43161</strong></span>
              </div>

              <a
                href={`https://wa.me/919663643161?text=Hello%20Sutra%20Events%2C%20I%20am%20enquiring%20about%20my%20booking%20reference%20${bookingData.booking.reference_code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 bg-[#25D366] text-white font-semibold flex items-center gap-1.5 hover:bg-[#20ba5a] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
