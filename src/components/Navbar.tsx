import React, { useState } from 'react';
import { Menu, X, Sparkles, Calendar, Search, Lock } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onOpenBooking, onOpenAdmin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'studio', label: 'Design Studio' },
    { id: 'calendar', label: 'Availability' },
    { id: 'track', label: 'Track Booking' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#18251F]/95 backdrop-blur-md border-b border-[#D8B77A]/20 transition-all text-[#F6F0E4]">
      {/* Top Bar 3-Zone Contract: Zone 1 (Brand) — Zone 2 (Nav Links) — Zone 3 (Action) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single Brand Wordmark */}
        <button 
          onClick={() => handleLinkClick('home')}
          className="text-left group flex items-center gap-2 whitespace-nowrap shrink-0 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full border border-[#D8B77A] flex items-center justify-center text-[#D8B77A] group-hover:bg-[#D8B77A]/10 transition-colors">
            <span className="font-serif text-sm font-semibold tracking-wider">S</span>
          </div>
          <span className="font-serif text-2xl lg:text-3xl font-normal tracking-wide text-[#F6F0E4] group-hover:text-[#D8B77A] transition-colors">
            Sutra Events
          </span>
        </button>

        {/* Zone 2: Clean single-line text links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 relative ${
                  isActive 
                    ? 'text-[#D8B77A]' 
                    : 'text-[#F6F0E4]/80 hover:text-[#F6F0E4]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#D8B77A]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Admin Quick Access */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAdmin}
            title="Open Studio Admin Panel"
            className="px-3.5 py-2.5 border border-[#D8B77A]/40 hover:border-[#D8B77A] text-[#D8B77A] hover:bg-[#D8B77A]/10 text-xs font-semibold uppercase tracking-wider rounded-none transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Panel</span>
          </button>

          <button
            onClick={onOpenBooking}
            className="px-5 py-2.5 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] text-xs font-semibold uppercase tracking-wider rounded-none transition-all cursor-pointer shadow-sm hover:shadow-md whitespace-nowrap shrink-0"
          >
            Enquire Celebration
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 text-[#F6F0E4] hover:text-[#D8B77A] focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#18251F] border-b border-[#D8B77A]/20 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`text-left text-base font-medium py-2 transition-colors ${
                  currentTab === link.id ? 'text-[#D8B77A]' : 'text-[#F6F0E4]/90 hover:text-[#F6F0E4]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 border border-[#D8B77A] text-[#D8B77A] font-semibold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Studio Admin Panel</span>
            </button>

            <button
              onClick={() => {
                onOpenBooking();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-[#D8B77A] text-[#18251F] font-semibold text-xs uppercase tracking-wider text-center"
            >
              Enquire Celebration
            </button>
            <div className="text-xs text-[#F6F0E4]/60 text-center">
              Davangere, Karnataka · +91 96636 43161
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
