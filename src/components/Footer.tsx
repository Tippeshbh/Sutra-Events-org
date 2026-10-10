import React from 'react';
import { Phone, Mail, MapPin, Globe, Shield, ArrowUpRight, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenPolicy: (policy: 'cancellation' | 'privacy' | 'terms') => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPolicy, onOpenAdmin }) => {
  return (
    <footer className="bg-[#18251F] text-[#F6F0E4] border-t border-[#D8B77A]/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-[#D8B77A] flex items-center justify-center text-[#D8B77A]">
                <span className="font-serif text-sm font-semibold">S</span>
              </div>
              <span className="font-serif text-2xl font-normal text-[#F6F0E4]">
                Sutra Events
              </span>
            </div>
            
            <p className="text-[#D8B77A] text-sm font-serif italic">
              “Formula to execute your imaginations.”
            </p>

            <p className="text-xs text-[#F6F0E4]/70 leading-relaxed">
              Bespoke event management, traditional mandap styling, and luxury celebration décor rooted in Davangere, Karnataka. Crafting indelible memories with authenticity and precision.
            </p>

            <div className="pt-2 text-[11px] text-[#F6F0E4]/40 leading-relaxed">
              * The logo mark and typographic treatment presented here are an editorial concept crafted for Sutra Events.
            </div>
          </div>

          {/* Col 2: Verified Studio Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#D8B77A]">
              Studio & Contact
            </h4>
            
            <ul className="space-y-3 text-xs text-[#F6F0E4]/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D8B77A] shrink-0 mt-0.5" />
                <span>
                  12th Cross Road, Anjaneya Badavane, Kuvempu Nagar, Davangere, Karnataka 577004, India.
                </span>
              </li>

              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D8B77A] shrink-0" />
                <a href="tel:+919663643161" className="hover:text-[#D8B77A] transition-colors">
                  +91 96636 43161
                </a>
              </li>

              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D8B77A] shrink-0" />
                <a href="mailto:sutraeventss@gmail.com" className="hover:text-[#D8B77A] transition-colors">
                  sutraeventss@gmail.com
                </a>
              </li>

              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-[#D8B77A] shrink-0" />
                <a 
                  href="https://www.sutraevents.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#D8B77A] transition-colors flex items-center gap-1"
                >
                  www.sutraevents.com
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href="https://maps.google.com/?q=Kuvempu+Nagar+Davangere+Karnataka+577004"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#D8B77A] hover:underline"
              >
                <span>View Davangere Studio on Maps</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Col 3: Signature Celebrations */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#D8B77A]">
              Celebrations
            </h4>
            
            <ul className="space-y-2 text-xs text-[#F6F0E4]/70">
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-[#D8B77A] transition-colors text-left">
                  Royal South Indian Mandaps
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-[#D8B77A] transition-colors text-left">
                  Grand Ballroom Receptions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-[#D8B77A] transition-colors text-left">
                  Traditional Haldi & Mehendi Canopies
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-[#D8B77A] transition-colors text-left">
                  Engagement Ring Ceremony Arches
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-[#D8B77A] transition-colors text-left">
                  Traditional Seemantha & Baby Showers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-[#D8B77A] transition-colors text-left">
                  Gruha Pravesha Auspicious Décor
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-[#D8B77A] transition-colors text-left">
                  Corporate Conclaves & Brand Galas
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Service Hours & Governance */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#D8B77A]">
              Working Hours & Studio
            </h4>
            
            <p className="text-xs text-[#F6F0E4]/70 leading-relaxed">
              Consultations & Site Visits:
              <br />
              <strong className="text-[#F6F0E4]">Monday – Sunday</strong>: 9:00 AM – 9:00 PM IST
              <br />
              <span className="text-[11px] text-[#F6F0E4]/50">Davangere city & Karnataka regional venues</span>
            </p>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => onOpenPolicy('cancellation')}
                className="block text-xs text-[#D8B77A]/80 hover:text-[#D8B77A] transition-colors"
              >
                Cancellation & Advance Refund Policy
              </button>
              <button
                onClick={() => onOpenPolicy('terms')}
                className="block text-xs text-[#F6F0E4]/60 hover:text-[#F6F0E4] transition-colors"
              >
                Terms of Service & Booking Inquiry Scope
              </button>
              <button
                onClick={() => onOpenPolicy('privacy')}
                className="block text-xs text-[#F6F0E4]/60 hover:text-[#F6F0E4] transition-colors"
              >
                Privacy & Data Confidentiality
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F6F0E4]/50">
          <div>
            © {new Date().getFullYear()} Sutra Events. All rights reserved. Davangere, Karnataka.
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('track')}
              className="text-[#D8B77A] hover:underline flex items-center gap-1"
            >
              <span>Track Your Booking Status</span>
            </button>

            <span className="text-white/20">·</span>

            <button
              onClick={onOpenAdmin}
              className="hover:text-[#D8B77A] transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3 h-3 text-[#D8B77A]" />
              <span>Studio Administration</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
