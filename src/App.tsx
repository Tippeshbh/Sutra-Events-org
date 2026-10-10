import React, { useState } from 'react';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { QuickContactBar } from './components/QuickContactBar.js';
import { Hero } from './components/Hero.js';
import { ServicesView } from './components/ServicesView.js';
import { PortfolioView } from './components/PortfolioView.js';
import { DesignStudio } from './components/DesignStudio.js';
import { AvailabilityCalendar } from './components/AvailabilityCalendar.js';
import { BookingForm } from './components/BookingForm.js';
import { BookingStatusTracker } from './components/BookingStatusTracker.js';
import { AboutContactView } from './components/AboutContactView.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { PolicyModals } from './components/PolicyModals.js';
import { DesignBrief, PortfolioProject } from './types/index.js';
import { ArrowRight, Sparkles, MapPin, ShieldCheck, HeartHandshake, Award } from 'lucide-react';

import mandapImg from './assets/images/hero_mandap_wedding_1791577194939.jpg';
import receptionImg from './assets/images/reception_stage_luxury_1791577205984.jpg';
import haldiImg from './assets/images/haldi_mehendi_decor_1791577220588.jpg';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'services' | 'portfolio' | 'studio' | 'calendar' | 'booking' | 'track' | 'about'>('home');
  
  // Cross-view state transfers
  const [bookingDate, setBookingDate] = useState<string | undefined>(undefined);
  const [bookingSlot, setBookingSlot] = useState<string | undefined>(undefined);
  const [bookingBrief, setBookingBrief] = useState<DesignBrief | null>(null);

  const [trackRef, setTrackRef] = useState<string>('');
  const [trackContact, setTrackContact] = useState<string>('');

  // Modals
  const [activePolicy, setActivePolicy] = useState<'cancellation' | 'privacy' | 'terms' | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  // Navigation handlers
  const handleNavigate = (tab: string) => {
    setCurrentTab(tab as any);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = (date?: string, slot?: string, brief?: DesignBrief) => {
    if (date) setBookingDate(date);
    if (slot) setBookingSlot(slot);
    if (brief) setBookingBrief(brief);
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDateAndProceed = (date: string, slot: string) => {
    setBookingDate(date);
    setBookingSlot(slot);
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTransferBriefToBooking = (brief: DesignBrief) => {
    setBookingBrief(brief);
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackCreatedBooking = (refCode: string, verifyContact: string) => {
    setTrackRef(refCode);
    setTrackContact(verifyContact);
    setCurrentTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectServiceToBook = (serviceTitle: string) => {
    setBookingBrief({
      celebrationType: serviceTitle,
      aesthetic: 'Signature Studio Aesthetic',
      palette: 'Champagne Gold & Warm Ivory',
      florals: ['Fresh Jasmine Strings', 'Exotic Roses'],
      backdrop: 'Custom Designed Stage',
      stageAndLighting: ['Warm Spotlight Ambience'],
      guestEstimate: '200 - 500 Guests',
      venueType: 'Kalyana Mantapa in Davangere'
    });
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProjectToEnquire = (project: PortfolioProject) => {
    setBookingBrief({
      celebrationType: project.category,
      aesthetic: project.style,
      palette: project.palette,
      florals: project.elements,
      backdrop: project.title,
      stageAndLighting: ['Curated Studio Rigging'],
      guestEstimate: '300+ Guests',
      venueType: project.location
    });
    setCurrentTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F0E4] text-[#18251F] font-sans antialiased selection:bg-[#D8B77A]/30 selection:text-[#18251F]">
      {/* 3-Zone Top Navigation Contract */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenBooking={() => handleOpenBooking()}
        onOpenAdmin={() => setShowAdmin(true)}
      />

      {/* Floating Action Quick Contact Bar */}
      <QuickContactBar
        onCheckDate={() => handleNavigate('calendar')}
        onTrackBooking={() => handleNavigate('track')}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <div>
            {/* Cinematic Hero */}
            <Hero
              onExploreDesigns={() => handleNavigate('portfolio')}
              onCheckDate={(date) => {
                if (date) setBookingDate(date);
                handleNavigate('calendar');
              }}
              onOpenBooking={() => handleOpenBooking()}
            />

            {/* Featured Celebrations Bento Highlight */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                  <div className="text-xs font-semibold text-[#8D5962] tracking-widest uppercase mb-1">
                    Signature Davangere Installations
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl text-[#18251F]">
                    Artistry Rooted in Heritage & Modern Luxury
                  </h2>
                </div>

                <button
                  onClick={() => handleNavigate('portfolio')}
                  className="text-xs font-semibold uppercase tracking-wider text-[#18251F] hover:text-[#8D5962] flex items-center gap-1.5 transition-colors cursor-pointer self-start md:self-auto"
                >
                  <span>Explore Full Portfolio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1: Mandaps */}
                <div 
                  onClick={() => handleNavigate('services')}
                  className="bg-white border border-[#D8B77A]/30 overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="aspect-4/3 overflow-hidden bg-neutral-900 relative">
                    <img
                      src={mandapImg}
                      alt="Royal Mandap by Sutra Events"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <span className="absolute bottom-3 left-4 text-xs font-serif text-[#D8B77A] italic">
                      Traditional Sanctums
                    </span>
                  </div>
                  <div className="p-6 space-y-2">
                    <h3 className="font-serif text-2xl text-[#18251F] group-hover:text-[#8D5962] transition-colors">
                      Royal South Indian Mandaps
                    </h3>
                    <p className="text-xs text-[#18251F]/70 leading-relaxed">
                      Carved wood temple architectures adorned with fresh jasmine strings, brass kuthuvilakku lamps, and agnikund safety buffers.
                    </p>
                  </div>
                </div>

                {/* Card 2: Receptions */}
                <div 
                  onClick={() => handleNavigate('services')}
                  className="bg-white border border-[#D8B77A]/30 overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="aspect-4/3 overflow-hidden bg-neutral-900 relative">
                    <img
                      src={receptionImg}
                      alt="Grand Ballroom Reception Styling"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <span className="absolute bottom-3 left-4 text-xs font-serif text-[#D8B77A] italic">
                      Ballroom Elegance
                    </span>
                  </div>
                  <div className="p-6 space-y-2">
                    <h3 className="font-serif text-2xl text-[#18251F] group-hover:text-[#8D5962] transition-colors">
                      Grand Ballroom Receptions
                    </h3>
                    <p className="text-xs text-[#18251F]/70 leading-relaxed">
                      Grand 40-to-80-foot panoramic stages featuring imported blush English roses, crystal chandeliers, and cold pyro entry effects.
                    </p>
                  </div>
                </div>

                {/* Card 3: Haldi & Mehendi */}
                <div 
                  onClick={() => handleNavigate('services')}
                  className="bg-white border border-[#D8B77A]/30 overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
                >
                  <div className="aspect-4/3 overflow-hidden bg-neutral-900 relative">
                    <img
                      src={haldiImg}
                      alt="Traditional Haldi Mandap"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <span className="absolute bottom-3 left-4 text-xs font-serif text-[#D8B77A] italic">
                      Folk Radiance
                    </span>
                  </div>
                  <div className="p-6 space-y-2">
                    <h3 className="font-serif text-2xl text-[#18251F] group-hover:text-[#8D5962] transition-colors">
                      Traditional Haldi & Sangeet
                    </h3>
                    <p className="text-xs text-[#18251F]/70 leading-relaxed">
                      Sunshine yellow marigold canopies, antique hammered brass urlis with floating petals, and relaxed courtyard seating.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Design Studio Teaser Banner */}
            <section className="bg-[#18251F] text-[#F6F0E4] py-16 px-4 sm:px-6 lg:px-8 border-y border-[#D8B77A]/30">
              <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="space-y-3 max-w-2xl">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#D8B77A]">
                    Interactive Brief Configurator
                  </span>
                  <h3 className="font-serif text-3xl sm:text-4xl text-[#F6F0E4]">
                    Sculpt Your Dream Celebration Brief
                  </h3>
                  <p className="text-sm text-[#F6F0E4]/80 leading-relaxed">
                    Experiment with floral pairings, royal color palettes, stage structures, and atmospheric lighting before speaking with our creative team.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                  <button
                    onClick={() => handleNavigate('studio')}
                    className="px-8 py-3.5 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    Open Design Studio
                  </button>

                  <button
                    onClick={() => handleNavigate('calendar')}
                    className="px-6 py-3.5 border border-white/20 hover:border-white text-xs font-semibold uppercase tracking-wider text-[#F6F0E4] cursor-pointer"
                  >
                    Check Date Availability
                  </button>
                </div>
              </div>
            </section>

            {/* Working Process */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="max-w-3xl mb-14">
                <div className="text-xs font-semibold text-[#8D5962] tracking-widest uppercase mb-1">
                  Our Discipline & Craftsmanship
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#18251F]">
                  The Sutra Execution Formula
                </h2>
                <p className="text-xs text-[#18251F]/70 mt-2">
                  How we translate family imaginations into breathtaking reality without friction.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="p-6 bg-white border border-[#D8B77A]/30 space-y-3">
                  <span className="font-mono text-2xl font-bold text-[#8D5962]">01</span>
                  <h3 className="font-serif text-xl text-[#18251F]">Discovery & Intake</h3>
                  <p className="text-xs text-[#18251F]/70 leading-relaxed">
                    We listen to your ritual requirements, family traditions, and venue dimensions in Davangere.
                  </p>
                </div>

                <div className="p-6 bg-white border border-[#D8B77A]/30 space-y-3">
                  <span className="font-mono text-2xl font-bold text-[#8D5962]">02</span>
                  <h3 className="font-serif text-xl text-[#18251F]">Itemized Quotation</h3>
                  <p className="text-xs text-[#18251F]/70 leading-relaxed">
                    Clear transparent estimates for staging, fresh flowers, lighting, and labour before commitments.
                  </p>
                </div>

                <div className="p-6 bg-white border border-[#D8B77A]/30 space-y-3">
                  <span className="font-mono text-2xl font-bold text-[#8D5962]">03</span>
                  <h3 className="font-serif text-xl text-[#18251F]">Artisanal Sourcing</h3>
                  <p className="text-xs text-[#18251F]/70 leading-relaxed">
                    Pristine flowers sourced from early morning markets and custom carpentry built in our local workshop.
                  </p>
                </div>

                <div className="p-6 bg-white border border-[#D8B77A]/30 space-y-3">
                  <span className="font-mono text-2xl font-bold text-[#8D5962]">04</span>
                  <h3 className="font-serif text-xl text-[#18251F]">On-Site Execution</h3>
                  <p className="text-xs text-[#18251F]/70 leading-relaxed">
                    Dedicated on-site supervisors oversee lighting tests, floral preservation, and respectful teardown.
                  </p>
                </div>
              </div>
            </section>

            {/* Quick Davangere Studio Location Strip */}
            <section className="bg-white py-12 px-4 sm:px-6 lg:px-8 border-t border-[#D8B77A]/20">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#18251F]/80">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#8D5962] shrink-0" />
                  <div>
                    <span className="font-semibold text-[#18251F] block text-sm">Davangere Event Studio</span>
                    <span>12th Cross Road, Anjaneya Badavane, Kuvempu Nagar, Davangere, Karnataka 577004</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <a href="tel:+919663643161" className="font-semibold text-[#18251F] hover:text-[#8D5962]">
                    +91 96636 43161
                  </a>
                  <span className="text-neutral-300">·</span>
                  <a href="mailto:sutraeventss@gmail.com" className="font-semibold text-[#18251F] hover:text-[#8D5962]">
                    sutraeventss@gmail.com
                  </a>
                </div>
              </div>
            </section>
          </div>
        )}

        {currentTab === 'services' && (
          <ServicesView onSelectServiceToBook={handleSelectServiceToBook} />
        )}

        {currentTab === 'portfolio' && (
          <PortfolioView onSelectProjectToEnquire={handleSelectProjectToEnquire} />
        )}

        {currentTab === 'studio' && (
          <DesignStudio onTransferBriefToBooking={handleTransferBriefToBooking} />
        )}

        {currentTab === 'calendar' && (
          <AvailabilityCalendar
            initialDate={bookingDate}
            onSelectDateAndProceed={handleSelectDateAndProceed}
          />
        )}

        {currentTab === 'booking' && (
          <BookingForm
            initialDate={bookingDate}
            initialSlot={bookingSlot}
            initialBrief={bookingBrief}
            onTrackCreatedBooking={handleTrackCreatedBooking}
            onNavigateHome={() => handleNavigate('home')}
          />
        )}

        {currentTab === 'track' && (
          <BookingStatusTracker
            initialRefCode={trackRef}
            initialVerifyContact={trackContact}
          />
        )}

        {currentTab === 'about' && (
          <AboutContactView />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenPolicy={(policy) => setActivePolicy(policy)}
        onOpenAdmin={() => setShowAdmin(true)}
      />

      {/* Policy Modals */}
      <PolicyModals
        activePolicy={activePolicy}
        onClose={() => setActivePolicy(null)}
      />

      {/* Admin Dashboard */}
      {showAdmin && (
        <AdminDashboard onClose={() => setShowAdmin(false)} />
      )}
    </div>
  );
}
