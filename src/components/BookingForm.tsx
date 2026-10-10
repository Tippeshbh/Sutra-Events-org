import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Copy, Check, ArrowRight, ArrowLeft, ShieldCheck, Calendar, Clock, MapPin, User, Mail, Phone } from 'lucide-react';
import { DesignBrief } from '../types/index.js';

interface BookingFormProps {
  initialDate?: string;
  initialSlot?: string;
  initialBrief?: DesignBrief | null;
  onTrackCreatedBooking: (refCode: string, verifyContact: string) => void;
  onNavigateHome: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  initialDate,
  initialSlot,
  initialBrief,
  onTrackCreatedBooking,
  onNavigateHome
}) => {
  const [step, setStep] = useState(1);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+91 ');
  const [customerEmail, setCustomerEmail] = useState('');
  
  const [eventType, setEventType] = useState(initialBrief?.celebrationType || 'Wedding & Royal Mandap');
  const [eventDate, setEventDate] = useState(initialDate || '');
  const [timeSlot, setTimeSlot] = useState(initialSlot || 'Morning (Muhurtham 6 AM - 2 PM)');
  const [durationHours, setDurationHours] = useState(6);
  const [setupBufferHours, setSetupBufferHours] = useState(4);

  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('Davangere, Karnataka');
  const [venueType, setVenueType] = useState(initialBrief?.venueType || 'Indoor Hall');
  const [guestCount, setGuestCount] = useState(350);

  const [estimatedBudgetTier, setEstimatedBudgetTier] = useState('₹2,00,000 - ₹3,50,000');
  const [clientNotes, setClientNotes] = useState(initialBrief?.specialRequests || '');
  const [termsConsent, setTermsConsent] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<{
    referenceCode: string;
    bookingId: string;
    eventDate: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  // Validation
  const validateStep1 = () => {
    if (!customerName.trim()) return 'Please enter your full name.';
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      return 'Please provide a valid contact number (at least 10 digits).';
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      return 'Please provide a valid email address for receiving your quotation.';
    }
    return null;
  };

  const validateStep2 = () => {
    if (!eventDate) return 'Please choose an event date.';
    const today = new Date().toISOString().split('T')[0];
    if (eventDate < today) return 'The chosen date cannot be in the past.';
    return null;
  };

  const validateStep3 = () => {
    if (!venueName.trim()) return 'Please specify the venue name or indicate "To be finalized".';
    if (!guestCount || guestCount < 10) return 'Please enter a realistic guest count estimate.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsConsent) {
      setServerError('Please review and check the terms acknowledgment.');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
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
        designTheme: initialBrief?.aesthetic || 'Custom Celebration',
        designBrief: initialBrief || null,
        clientNotes,
        termsConsent
      };

      const res = await fetch('/api/bookings/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit booking request');
      }

      setBookingSuccess({
        referenceCode: data.referenceCode,
        bookingId: data.bookingId,
        eventDate: data.eventDate
      });
    } catch (err: any) {
      setServerError(err.message || 'Error communicating with booking system');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReference = () => {
    if (bookingSuccess) {
      navigator.clipboard.writeText(bookingSuccess.referenceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // SUCCESS SCREEN
  if (bookingSuccess) {
    return (
      <div className="bg-[#F6F0E4] py-16 px-4 sm:px-6 lg:px-8 min-h-[70vh] flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white border border-[#D8B77A] p-8 sm:p-10 shadow-xl space-y-8 animate-in fade-in duration-300">
          
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <h2 className="font-serif text-3xl sm:text-4xl text-[#18251F]">
              Enquiry Submitted Successfully
            </h2>

            <p className="text-sm text-[#18251F]/70 max-w-lg mx-auto">
              Thank you, <strong className="text-[#18251F]">{customerName}</strong>. Your celebration enquiry has been recorded in our Davangere studio booking system.
            </p>
          </div>

          {/* Reference Box */}
          <div className="bg-[#18251F] text-[#F6F0E4] p-6 text-center space-y-3 border border-[#D8B77A]/40">
            <div className="text-xs uppercase tracking-widest text-[#D8B77A]">
              Your Official Enquiry Reference Code
            </div>

            <div className="text-2xl sm:text-3xl font-mono tracking-wider font-semibold text-[#F6F0E4]">
              {bookingSuccess.referenceCode}
            </div>

            <button
              onClick={handleCopyReference}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs text-[#D8B77A] rounded-none transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Reference Code'}</span>
            </button>
          </div>

          {/* Next Steps Explanation */}
          <div className="space-y-4 text-xs text-[#18251F]/80 border-t border-neutral-100 pt-6">
            <h4 className="font-semibold text-[#18251F] text-sm uppercase tracking-wider">
              What Happens Next?
            </h4>
            
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-[#D8B77A]/20 text-[#18251F] rounded-full flex items-center justify-center font-bold shrink-0 text-[11px]">1</span>
                <span><strong>Date & Buffer Review:</strong> Our senior coordinator verifies technician and floral buffer capacity for {bookingSuccess.eventDate}.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-[#D8B77A]/20 text-[#18251F] rounded-full flex items-center justify-center font-bold shrink-0 text-[11px]">2</span>
                <span><strong>Itemized Quotation:</strong> We prepare a transparent line-item quotation covering structure, fresh flowers, and lighting.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-[#D8B77A]/20 text-[#18251F] rounded-full flex items-center justify-center font-bold shrink-0 text-[11px]">3</span>
                <span><strong>Temporary 48h Hold:</strong> Upon quotation acceptance, your event date is placed on exclusive temporary hold.</span>
              </li>
            </ul>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onTrackCreatedBooking(bookingSuccess.referenceCode, customerPhone)}
              className="flex-1 py-3.5 px-4 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] text-xs font-semibold uppercase tracking-wider transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Track Your Booking Status Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateHome}
              className="py-3.5 px-6 border border-[#18251F]/20 hover:border-[#18251F] text-[#18251F] text-xs font-semibold uppercase tracking-wider transition-colors text-center"
            >
              Return to Home
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F6F0E4] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="text-xs font-semibold text-[#8D5962] tracking-widest uppercase mb-2">
            Verified Studio Reservation System
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#18251F] font-normal">
            Request Event Quotation & Reservation
          </h2>
          <p className="mt-2 text-sm text-[#18251F]/70 leading-relaxed">
            Fill in your celebration specifications below. Every submission is assigned a unique tracking reference and reviewed by our studio in Kuvempu Nagar, Davangere.
          </p>
        </div>

        {/* Steps Progress Header */}
        <div className="bg-white border border-[#D8B77A]/30 p-4 mb-8 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            {[
              { num: 1, label: 'Contact' },
              { num: 2, label: 'Date & Slot' },
              { num: 3, label: 'Venue' },
              { num: 4, label: 'Budget & Terms' }
            ].map(s => (
              <div 
                key={s.num} 
                className={`flex items-center gap-1.5 whitespace-nowrap ${
                  step === s.num ? 'font-bold text-[#18251F]' : step > s.num ? 'text-emerald-700' : 'text-neutral-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === s.num ? 'bg-[#18251F] text-[#F6F0E4]' : step > s.num ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'
                }`}>
                  {step > s.num ? '✓' : s.num}
                </span>
                <span>{s.label}</span>
                {s.num < 4 && <span className="text-neutral-300 ml-1">/</span>}
              </div>
            ))}
          </div>

          <div className="text-[#8D5962] font-semibold text-xs hidden sm:block">
            Step {step} of 4
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm">Submission Incomplete</div>
              <p className="mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white border border-[#D8B77A]/40 p-6 sm:p-10 shadow-sm space-y-8">
          
          {/* STEP 1: CONTACT DETAILS */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-neutral-100 pb-3">
                <h3 className="font-serif text-2xl text-[#18251F]">
                  Step 1: Your Contact Information
                </h3>
                <p className="text-xs text-[#18251F]/60">
                  We use these details strictly to share itemized quotations and secure status updates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1.5">
                    Full Name / Family Representative *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ramesh Kulkarni / Dr. Ananya"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#18251F] focus:outline-none focus:border-[#D8B77A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1.5">
                    Phone / WhatsApp Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 98450 12345"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#18251F] focus:outline-none focus:border-[#D8B77A]"
                    />
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1 block">Used for booking status verification code.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#18251F] focus:outline-none focus:border-[#D8B77A]"
                    />
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1 block">Itemized PDF quote summary will be sent here.</span>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const err = validateStep1();
                    if (err) setServerError(err);
                    else {
                      setServerError(null);
                      setStep(2);
                    }
                  }}
                  className="px-6 py-3 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Continue to Date & Slot</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: EVENT DATE & TIME SLOT */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-neutral-100 pb-3">
                <h3 className="font-serif text-2xl text-[#18251F]">
                  Step 2: Event Type, Date & Time Slot
                </h3>
                <p className="text-xs text-[#18251F]/60">
                  Our system verifies conflict availability for this specific day and slot.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1.5">
                    Celebration Type *
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#18251F] focus:outline-none focus:border-[#D8B77A]"
                  >
                    <option value="Wedding & Royal Mandap">Wedding & Royal Mandap</option>
                    <option value="Grand Reception Gala">Grand Reception Gala</option>
                    <option value="Traditional Haldi & Mehendi">Traditional Haldi & Mehendi</option>
                    <option value="Engagement & Ring Ceremony">Engagement & Ring Ceremony</option>
                    <option value="Traditional Seemantha / Baby Shower">Traditional Seemantha / Baby Shower</option>
                    <option value="Milestone Birthday & Anniversary">Milestone Birthday & Anniversary</option>
                    <option value="Gruha Pravesha (Housewarming)">Gruha Pravesha (Housewarming)</option>
                    <option value="Corporate Conclave & Brand Gala">Corporate Conclave & Brand Gala</option>
                    <option value="Bespoke Celebration">Bespoke Celebration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1.5">
                    Event Date * (Asia/Kolkata)
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#18251F] focus:outline-none focus:border-[#D8B77A]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1.5">
                    Time Slot *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      'Morning (Muhurtham 6 AM - 2 PM)',
                      'Evening (Reception 4 PM - 11 PM)',
                      'Full Day (6 AM - 11 PM)',
                      'Multi-Day Celebration'
                    ].map(slot => (
                      <label
                        key={slot}
                        className={`p-3 border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          timeSlot === slot 
                            ? 'border-[#D8B77A] bg-[#D8B77A]/10 font-semibold' 
                            : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        <span>{slot}</span>
                        <input
                          type="radio"
                          name="timeSlot"
                          checked={timeSlot === slot}
                          onChange={() => setTimeSlot(slot)}
                          className="accent-[#D8B77A]"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1.5">
                    Function Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={24}
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#18251F] focus:outline-none focus:border-[#D8B77A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1.5">
                    Required Setup Buffer (Hours)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={16}
                    value={setupBufferHours}
                    onChange={(e) => setSetupBufferHours(Number(e.target.value))}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#18251F] focus:outline-none focus:border-[#D8B77A]"
                  />
                  <span className="text-[11px] text-neutral-500 mt-1 block">Time needed prior to guest arrival for floral & carpentry setup.</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 border border-neutral-300 text-xs text-neutral-700 hover:bg-neutral-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const err = validateStep2();
                    if (err) setServerError(err);
                    else {
                      setServerError(null);
                      setStep(3);
                    }
                  }}
                  className="px-6 py-3 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Continue to Venue Information</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: VENUE & SCALE */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-neutral-100 pb-3">
                <h3 className="font-serif text-2xl text-[#18251F]">
                  Step 3: Venue & Guest Attendance
                </h3>
                <p className="text-xs text-[#18251F]/60">
                  Venue dimensions dictate structural trussing, flower quantities, and electrical safety.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1.5">
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. Bapuji Convention Center / Trishul Lawns"
                    required
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#18251F] focus:outline-none focus:border-[#D8B77A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1.5">
                    Venue Type *
                  </label>
                  <select
                    value={venueType}
                    onChange={(e) => setVenueType(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#18251F] focus:outline-none focus:border-[#D8B77A]"
                  >
                    <option value="Indoor Hall">Indoor Kalyana Mantapa / Convention Hall</option>
                    <option value="Outdoor Lawn">Outdoor Resort Lawn / Open-air</option>
                    <option value="Private Home">Private Courtyard / Family Residence</option>
                    <option value="Hotel Ballroom">Hotel Ballroom / Banquet</option>
                    <option value="Other">Other Unique Venue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1.5">
                    Venue Address / Locality in Davangere *
                  </label>
                  <input
                    type="text"
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    placeholder="e.g. Kuvempu Nagar / Hadadi Road / MCC B Block"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#18251F] focus:outline-none focus:border-[#D8B77A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1.5">
                    Estimated Guest Attendance *
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={5000}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    required
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#18251F] focus:outline-none focus:border-[#D8B77A]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 border border-neutral-300 text-xs text-neutral-700 hover:bg-neutral-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const err = validateStep3();
                    if (err) setServerError(err);
                    else {
                      setServerError(null);
                      setStep(4);
                    }
                  }}
                  className="px-6 py-3 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Continue to Budget & Consent</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: BUDGET RANGE, NOTES & CONSENT */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-neutral-100 pb-3">
                <h3 className="font-serif text-2xl text-[#18251F]">
                  Step 4: Estimated Budget & Terms Acknowledgment
                </h3>
                <p className="text-xs text-[#18251F]/60">
                  We customize the floral species and staging complexity to maximize value within your planned range.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1.5">
                    Estimated Décor Budget Tier
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      '₹75,000 - ₹1,50,000 (Essential)',
                      '₹1,50,000 - ₹3,00,000 (Grand)',
                      '₹3,00,000 - ₹6,00,000+ (Royal Luxury)'
                    ].map(tier => (
                      <button
                        type="button"
                        key={tier}
                        onClick={() => setEstimatedBudgetTier(tier)}
                        className={`p-3 text-left border text-xs transition-colors cursor-pointer ${
                          estimatedBudgetTier === tier
                            ? 'border-[#D8B77A] bg-[#D8B77A]/15 font-semibold text-[#18251F]'
                            : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1.5">
                    Specific Requests, Inspirations or Ceremony Details
                  </label>
                  <textarea
                    rows={3}
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Include flower varieties, stage dimensions, muhurtham timing, special entrance ideas, or any family preferences..."
                    className="w-full p-3 bg-neutral-50 border border-neutral-300 text-xs text-[#18251F] focus:outline-none focus:border-[#D8B77A]"
                  />
                </div>

                {/* Terms & Consent Checkbox */}
                <div className="p-4 bg-[#F6F0E4]/60 border border-[#D8B77A]/40 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="termsConsent"
                      checked={termsConsent}
                      onChange={(e) => setTermsConsent(e.target.checked)}
                      className="mt-0.5 accent-[#18251F] cursor-pointer"
                    />
                    <label htmlFor="termsConsent" className="text-xs text-[#18251F]/90 leading-relaxed cursor-pointer">
                      I understand that submitting this enquiry constitutes a quotation and capacity inquiry, and <strong>does not guarantee a confirmed booking</strong> until Sutra Events verifies date availability, issues an itemized quotation, and the formal advance deposit is completed.
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 border border-neutral-300 text-xs text-neutral-700 hover:bg-neutral-50"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !termsConsent}
                  className="px-8 py-3.5 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  <span>{isSubmitting ? 'Verifying & Submitting...' : 'Submit Booking Enquiry'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </form>

      </div>
    </div>
  );
};
