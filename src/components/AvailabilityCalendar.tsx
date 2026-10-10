import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { MonthAvailability, CalendarDayInfo } from '../types/index.js';

interface AvailabilityCalendarProps {
  onSelectDateAndProceed: (date: string, timeSlot: string) => void;
  initialDate?: string;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  onSelectDateAndProceed,
  initialDate,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-indexed

  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || today.toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string>('Morning (Muhurtham 6 AM - 2 PM)');

  const [availabilityData, setAvailabilityData] = useState<MonthAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  const fetchAvailability = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/calendar/availability?month=${monthStr}`);
      if (!res.ok) throw new Error('Failed to load database calendar');
      const data = await res.json();
      setAvailabilityData(data);
    } catch (err: any) {
      setFetchError(err.message || 'Error connecting to availability service');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [monthStr]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Helper for generating calendar grid days
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 is Sun

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Selected date status lookup
  const getSelectedDayInfo = (): CalendarDayInfo => {
    if (availabilityData?.dates && availabilityData.dates[selectedDate]) {
      return availabilityData.dates[selectedDate];
    }
    return {
      status: 'AVAILABLE',
      slotsOccupied: [],
      pendingEnquiriesCount: 0,
      canAcceptBooking: true
    };
  };

  const dayInfo = getSelectedDayInfo();
  const isSelectedPast = selectedDate < today.toISOString().split('T')[0];
  const canBookSelectedDate = dayInfo.canAcceptBooking && !isSelectedPast;

  return (
    <div className="bg-[#F6F0E4] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold text-[#8D5962] tracking-widest uppercase mb-2">
            Real-Time Capacity & Schedule Engine
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#18251F] font-normal leading-tight">
            Event Date Availability Calendar
          </h2>
          <p className="mt-3 text-sm text-[#18251F]/70 leading-relaxed">
            All dates and time slots shown are derived directly from active database bookings and verified setup buffers. To safeguard our clients’ confidentiality, personal event details are never revealed on the public schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Calendar Grid Section (lg:col-span-8) */}
          <div className="lg:col-span-8 bg-white border border-[#D8B77A]/30 p-6 shadow-sm">
            
            {/* Month Header & Controls */}
            <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
              <div>
                <h3 className="font-serif text-2xl text-[#18251F]">
                  {monthNames[currentMonth - 1]} {currentYear}
                </h3>
                <div className="text-xs text-[#18251F]/60 mt-0.5">
                  Asia/Kolkata (IST) Standard Time
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  aria-label="Previous Month"
                  className="p-2 border border-neutral-200 hover:border-[#D8B77A] text-[#18251F] hover:bg-[#F6F0E4] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  aria-label="Next Month"
                  className="p-2 border border-neutral-200 hover:border-[#D8B77A] text-[#18251F] hover:bg-[#F6F0E4] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Availability Legend */}
            <div className="py-4 flex flex-wrap items-center gap-6 text-xs text-[#18251F]/80 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500 rounded-sm" />
                <span>Available for Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-amber-500 rounded-sm" />
                <span>Temporary Hold (48h Active Window)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#8D5962] rounded-sm" />
                <span>Confirmed & Locked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-neutral-300 rounded-sm" />
                <span>Past Date</span>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 pt-4 text-center text-xs font-semibold uppercase tracking-wider text-[#18251F]/50">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar Days Cells */}
            {isLoading ? (
              <div className="py-24 text-center text-sm text-[#18251F]/60">
                Checking studio availability records...
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1 pt-2">
                {/* Empty cells for leading days */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-14 sm:min-h-16 p-1 bg-neutral-50/40 rounded-none opacity-20" />
                ))}

                {/* Month Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${monthStr}-${String(dayNum).padStart(2, '0')}`;
                  const isPast = dateStr < today.toISOString().split('T')[0];
                  const isSelected = dateStr === selectedDate;
                  const info = availabilityData?.dates?.[dateStr];

                  let statusBg = 'bg-emerald-50/40 hover:bg-emerald-100/60 border-emerald-200/60 text-emerald-950';
                  let statusBadge = 'Available';
                  let statusDot = 'bg-emerald-500';

                  if (isPast) {
                    statusBg = 'bg-neutral-100/50 text-neutral-400 border-neutral-100';
                    statusBadge = 'Past';
                    statusDot = 'bg-neutral-300';
                  } else if (info?.status === 'CONFIRMED' || !info?.canAcceptBooking) {
                    statusBg = 'bg-rose-50/70 border-rose-200 text-rose-950';
                    statusBadge = 'Booked';
                    statusDot = 'bg-[#8D5962]';
                  } else if (info?.status === 'HOLD') {
                    statusBg = 'bg-amber-50/80 border-amber-200 text-amber-950';
                    statusBadge = 'On Hold';
                    statusDot = 'bg-amber-500';
                  }

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`min-h-14 sm:min-h-16 p-2 text-left border transition-all cursor-pointer flex flex-col justify-between relative ${statusBg} ${
                        isSelected ? 'ring-2 ring-[#D8B77A] border-[#D8B77A] font-bold shadow-sm' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs sm:text-sm font-medium">{dayNum}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                      </div>

                      <div className="text-[10px] sm:text-[11px] leading-tight truncate">
                        {statusBadge}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Note on hold policy */}
            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-start gap-2.5 text-xs text-[#18251F]/70">
              <ShieldCheck className="w-4 h-4 text-[#D8B77A] shrink-0 mt-0.5" />
              <span>
                <strong>Confidentiality & Reservation Guarantee:</strong> An enquiry does not prevent others from requesting the same date. Dates are placed on exclusive temporary hold only after an itemized quotation is formally accepted by the customer.
              </span>
            </div>
          </div>

          {/* Selected Date Inspector & Booking Intent (lg:col-span-4) */}
          <div className="lg:col-span-4 bg-[#18251F] text-[#F6F0E4] border border-[#D8B77A]/30 p-6 shadow-md space-y-6">
            
            <div className="border-b border-white/10 pb-4">
              <span className="text-xs font-semibold text-[#D8B77A] uppercase tracking-wider">
                Selected Date Inspector
              </span>
              <h3 className="font-serif text-2xl text-[#F6F0E4] mt-1">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
            </div>

            {/* Status Breakdown */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#F6F0E4]/60">
                Current Studio Status
              </div>

              {isSelectedPast ? (
                <div className="p-3 bg-white/5 border border-white/10 text-xs text-[#F6F0E4]/60 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-neutral-400" />
                  <span>This date has passed. Please select an upcoming date.</span>
                </div>
              ) : dayInfo.status === 'CONFIRMED' || !dayInfo.canAcceptBooking ? (
                <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-rose-300">
                    <XCircle className="w-4 h-4" />
                    <span>Fully Booked Date</span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">
                    Our artisanal décor crew and setup buffers are fully committed for this date. We cannot accept additional bookings.
                  </p>
                </div>
              ) : dayInfo.status === 'HOLD' ? (
                <div className="p-3.5 bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                    <Clock className="w-4 h-4" />
                    <span>Under Active 48-Hour Client Hold</span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">
                    A quotation has been accepted for this date. If the advance deposit is not received within the 48-hour window, the date will be released.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Open for Celebration Booking</span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">
                    Our design team, carpenters, and floral artisans are ready to create your celebration on this date.
                  </p>
                </div>
              )}
            </div>

            {/* Time Slot Selection */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#F6F0E4]/60 block">
                Desired Function Time Slot
              </label>
              
              <div className="space-y-2">
                {[
                  'Morning (Muhurtham 6 AM - 2 PM)',
                  'Evening (Reception 4 PM - 11 PM)',
                  'Full Day (6 AM - 11 PM)',
                  'Multi-Day Celebration'
                ].map((slot) => (
                  <label
                    key={slot}
                    className={`flex items-center justify-between p-3 border text-xs cursor-pointer transition-colors ${
                      selectedSlot === slot 
                        ? 'border-[#D8B77A] bg-[#D8B77A]/15 text-[#F6F0E4]' 
                        : 'border-white/10 hover:border-white/30 text-[#F6F0E4]/80'
                    }`}
                  >
                    <span>{slot}</span>
                    <input
                      type="radio"
                      name="slot"
                      value={slot}
                      checked={selectedSlot === slot}
                      onChange={() => setSelectedSlot(slot)}
                      className="accent-[#D8B77A]"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* CTA to request booking */}
            <div className="pt-4">
              <button
                disabled={!canBookSelectedDate}
                onClick={() => onSelectDateAndProceed(selectedDate, selectedSlot)}
                className="w-full py-3.5 px-4 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Proceed with This Date</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!canBookSelectedDate && !isSelectedPast && (
                <p className="text-[11px] text-[#F6F0E4]/60 text-center mt-2">
                  This date cannot accept new requests. Please pick another available calendar day.
                </p>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
