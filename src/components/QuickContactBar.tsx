import React from 'react';
import { Phone, MessageCircle, Calendar, Search } from 'lucide-react';

interface QuickContactBarProps {
  onCheckDate: () => void;
  onTrackBooking: () => void;
}

export const QuickContactBar: React.FC<QuickContactBarProps> = ({ onCheckDate, onTrackBooking }) => {
  const whatsappUrl = 'https://wa.me/919663643161?text=Hello%20Sutra%20Events%2C%20I%20would%20like%20to%20enquire%20about%20event%20decoration%20and%20booking%20in%20Davangere.';

  return (
    <aside aria-label="Quick contact actions" className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
      {/* WhatsApp Floating Action */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Enquire directly on WhatsApp"
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-2.5 rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 text-xs font-semibold"
      >
        <MessageCircle className="w-4 h-4 fill-white" />
        <span className="hidden sm:inline">WhatsApp Enquiry</span>
      </a>

      {/* Direct Call Floating Action */}
      <a
        href="tel:+919663643161"
        aria-label="Call Sutra Events directly"
        className="flex items-center gap-2 bg-[#18251F] hover:bg-[#24352d] text-[#D8B77A] border border-[#D8B77A]/40 px-3.5 py-2.5 rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 text-xs font-semibold"
      >
        <Phone className="w-4 h-4 text-[#D8B77A]" />
        <span className="hidden md:inline">+91 96636 43161</span>
      </a>

      {/* Fast Check Date */}
      <button
        onClick={onCheckDate}
        title="Check Event Date Availability"
        className="hidden lg:flex items-center gap-1.5 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] px-3.5 py-2.5 rounded-full shadow-lg transition-all text-xs font-semibold cursor-pointer"
      >
        <Calendar className="w-4 h-4" />
        <span>Check Date</span>
      </button>
    </aside>
  );
};
