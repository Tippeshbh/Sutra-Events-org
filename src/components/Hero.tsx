import React, { useState } from 'react';
import { Calendar, ArrowRight, ShieldCheck, MapPin, Sparkles, CheckCircle } from 'lucide-react';
import heroImage from '../assets/images/hero_mandap_wedding_1791577194939.jpg';

interface HeroProps {
  onExploreDesigns: () => void;
  onCheckDate: (date?: string) => void;
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreDesigns, onCheckDate, onOpenBooking }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [quickCheckResult, setQuickCheckResult] = useState<{
    date: string;
    isAvailable: boolean;
    reason?: string;
  } | null>(null);

  const handleQuickCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
    setIsChecking(true);
    setQuickCheckResult(null);

    try {
      const res = await fetch(`/api/calendar/check-date?date=${selectedDate}&slot=Morning`);
      const data = await res.json();
      setQuickCheckResult({
        date: selectedDate,
        isAvailable: data.isAvailable,
        reason: data.reason
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <section className="relative bg-[#18251F] text-[#F6F0E4] overflow-hidden">
      {/* Background Image with Measured Scrim Contrast */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Sutra Events Royal South Indian Mandap Floral Styling in Davangere"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-30 transform scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18251F] via-[#18251F]/80 to-[#18251F]/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-3xl space-y-6">
          
          {/* Subtle Tagline kicker */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#D8B77A] tracking-widest uppercase">
            <span>Sutra Events</span>
            <span aria-hidden="true">·</span>
            <span>Formula to execute your imaginations</span>
          </div>

          {/* Sample Hero Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.15] text-[#F6F0E4] tracking-normal text-balance">
            Your Vision. Our Artistry. <br />
            <span className="italic text-[#D8B77A]">Unforgettable Celebrations.</span>
          </h1>

          {/* Sample Supporting Copy */}
          <p className="text-base sm:text-lg text-[#F6F0E4]/85 leading-relaxed font-light max-w-2xl">
            From intimate family functions to extraordinary weddings, we bring every detail of your celebration to life with thoughtful planning and beautiful design.
          </p>

          {/* Davangere Local Trust Kicker */}
          <div className="flex items-center gap-2 text-xs text-[#F6F0E4]/70 pt-1">
            <MapPin className="w-3.5 h-3.5 text-[#D8B77A] shrink-0" />
            <span>Studio based in Kuvempu Nagar, Davangere · Serving premier venues across Karnataka</span>
          </div>

          {/* Primary & Secondary Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={onExploreDesigns}
              className="px-7 py-3.5 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Our Designs</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onCheckDate()}
              className="px-7 py-3.5 border border-[#D8B77A]/60 hover:border-[#D8B77A] hover:bg-[#D8B77A]/10 text-[#F6F0E4] text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#D8B77A]" />
              <span>Check Your Event Date</span>
            </button>
          </div>
        </div>

        {/* Live Date Availability Quick Strip */}
        <div className="mt-14 max-w-2xl bg-[#18251F]/80 backdrop-blur-md border border-[#D8B77A]/30 p-4 sm:p-5">
          <div className="text-xs font-medium text-[#D8B77A] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D8B77A]" />
            <span>Direct Database Availability Check</span>
          </div>

          <form onSubmit={handleQuickCheck} className="flex flex-col sm:flex-row items-stretch gap-3">
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              className="flex-1 bg-white/10 border border-white/20 px-3.5 py-2.5 text-xs text-[#F6F0E4] focus:outline-none focus:border-[#D8B77A]"
            />

            <button
              type="submit"
              disabled={isChecking || !selectedDate}
              className="px-5 py-2.5 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              {isChecking ? 'Checking...' : 'Check Status'}
            </button>

            <button
              type="button"
              onClick={() => onCheckDate(selectedDate || undefined)}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-xs text-[#F6F0E4] border border-white/10 whitespace-nowrap cursor-pointer"
            >
              Full Calendar
            </button>
          </form>

          {/* Quick Check Live Result */}
          {quickCheckResult && (
            <div className={`mt-3 p-3 text-xs border flex items-start justify-between gap-3 ${
              quickCheckResult.isAvailable 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}>
              <div className="space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${quickCheckResult.isAvailable ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <span>
                    {quickCheckResult.isAvailable 
                      ? `Date ${quickCheckResult.date} is currently OPEN for bookings!` 
                      : `Date ${quickCheckResult.date} is restricted.`}
                  </span>
                </div>
                <p className="text-[11px] opacity-90">
                  {quickCheckResult.isAvailable 
                    ? 'Our team has active capacity to design and execute your event on this date.'
                    : quickCheckResult.reason || 'This date is already locked or under active client hold.'}
                </p>
              </div>

              {quickCheckResult.isAvailable && (
                <button
                  onClick={() => onCheckDate(quickCheckResult.date)}
                  className="px-3 py-1 bg-emerald-500 text-black text-[11px] font-semibold whitespace-nowrap shrink-0 hover:bg-emerald-400 transition-colors"
                >
                  Book Date
                </button>
              )}
            </div>
          )}
        </div>

        {/* 4 Trust Highlights Below Hero */}
        <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-[#F6F0E4]/80">
          <div>
            <div className="text-[#D8B77A] font-serif text-lg">Authentic Sourcing</div>
            <div className="text-[#F6F0E4]/60 text-[11px] mt-0.5">Fresh daily jasmine, lotus & exotic florals directly curated</div>
          </div>
          <div>
            <div className="text-[#D8B77A] font-serif text-lg">Real Conflict Prevention</div>
            <div className="text-[#F6F0E4]/60 text-[11px] mt-0.5">Strict database scheduling; no double-booked dates</div>
          </div>
          <div>
            <div className="text-[#D8B77A] font-serif text-lg">Itemized Quotations</div>
            <div className="text-[#F6F0E4]/60 text-[11px] mt-0.5">Transparent line-item breakdowns before contract</div>
          </div>
          <div>
            <div className="text-[#D8B77A] font-serif text-lg">Davangere On-Site Crews</div>
            <div className="text-[#F6F0E4]/60 text-[11px] mt-0.5">Dedicated carpenters, florists & lighting technicians</div>
          </div>
        </div>

      </div>
    </section>
  );
};
