import React, { useState } from 'react';
import { Crown, Sparkles, Sun, Heart, Feather, Gift, Home, Briefcase, Camera, ArrowRight, Check, X, Clock, Users, MapPin } from 'lucide-react';
import { SERVICES_LIST, ServiceItem } from '../data/servicesData.js';

interface ServicesViewProps {
  onSelectServiceToBook: (serviceTitle: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ onSelectServiceToBook }) => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crown': return <Crown className="w-5 h-5 text-[#D8B77A]" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-[#D8B77A]" />;
      case 'Sun': return <Sun className="w-5 h-5 text-[#D8B77A]" />;
      case 'Heart': return <Heart className="w-5 h-5 text-[#D8B77A]" />;
      case 'Feather': return <Feather className="w-5 h-5 text-[#D8B77A]" />;
      case 'Gift': return <Gift className="w-5 h-5 text-[#D8B77A]" />;
      case 'Home': return <Home className="w-5 h-5 text-[#D8B77A]" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-[#D8B77A]" />;
      case 'Camera': return <Camera className="w-5 h-5 text-[#D8B77A]" />;
      default: return <Sparkles className="w-5 h-5 text-[#D8B77A]" />;
    }
  };

  return (
    <div className="bg-[#F6F0E4] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-semibold text-[#8D5962] tracking-widest uppercase mb-2">
            Comprehensive Celebration Portfolio
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#18251F] font-normal leading-tight">
            Event Management & Decoration Services
          </h2>
          <p className="mt-3 text-sm text-[#18251F]/70 leading-relaxed">
            From auspicious traditional rituals to grand evening receptions, Sutra Events engineers every dimension of your celebration with meticulous staging, fresh botanicals, and bespoke lighting across Davangere and Karnataka.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES_LIST.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-[#D8B77A]/30 p-7 flex flex-col justify-between hover:shadow-md hover:border-[#D8B77A] transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-[#18251F] flex items-center justify-center">
                    {getIcon(service.iconName)}
                  </div>
                  <span className="text-[11px] font-medium text-[#8D5962] uppercase tracking-wider">
                    {service.category}
                  </span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl text-[#18251F] group-hover:text-[#8D5962] transition-colors">
                  {service.title}
                </h3>

                <p className="text-xs text-[#18251F]/70 leading-relaxed">
                  {service.tagline}
                </p>

                <div className="pt-2 border-t border-neutral-100 space-y-1.5 text-xs text-[#18251F]/80">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#D8B77A] shrink-0" />
                    <span className="text-[11px]">Buffer: {service.setupTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#D8B77A] shrink-0" />
                    <span className="text-[11px]">Scale: {service.typicalCapacity}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-100 flex items-center justify-between gap-3 mt-6">
                <button
                  onClick={() => setSelectedService(service)}
                  className="text-xs font-semibold text-[#18251F] hover:text-[#8D5962] transition-colors cursor-pointer"
                >
                  View Details & Specs
                </button>

                <button
                  onClick={() => onSelectServiceToBook(service.title)}
                  className="px-3.5 py-2 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Book Service
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* SERVICE DETAIL MODAL */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#D8B77A] p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <button
              onClick={() => setSelectedService(null)}
              aria-label="Close details"
              className="absolute top-5 right-5 p-1 text-neutral-500 hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#8D5962] uppercase tracking-wider">
                {selectedService.category} Specification
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#18251F]">
                {selectedService.title}
              </h3>
              <p className="text-xs text-[#D8B77A] font-serif italic">
                “{selectedService.tagline}”
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#18251F]/80 leading-relaxed border-t border-neutral-100 pt-4">
              {selectedService.description}
            </p>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#18251F]">
                Execution Highlights & Deliverables
              </h4>
              <ul className="space-y-2 text-xs text-[#18251F]/80">
                {selectedService.highlights.map((h, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F6F0E4]/60 border border-[#D8B77A]/20 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#8D5962] block">Setup & Teardown Buffer</span>
                <span className="text-[#18251F] font-medium mt-0.5 block">{selectedService.setupTime}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#8D5962] block">Recommended Venues</span>
                <span className="text-[#18251F] font-medium mt-0.5 block">{selectedService.recommendedVenues}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-4">
              <span className="text-xs text-neutral-500">
                Customizable to your specific hall or home dimensions.
              </span>

              <button
                onClick={() => {
                  onSelectServiceToBook(selectedService.title);
                  setSelectedService(null);
                }}
                className="px-6 py-2.5 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Proceed to Book This Celebration
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
