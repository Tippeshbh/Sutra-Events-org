import React, { useState } from 'react';
import { MapPin, Phone, Mail, Globe, Clock, ArrowUpRight, MessageSquare, Send, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export const AboutContactView: React.FC = () => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="bg-[#F6F0E4] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Section 1: About Sutra Events */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="text-xs font-semibold text-[#8D5962] tracking-widest uppercase">
              The Davangere Event Studio
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl text-[#18251F] font-normal leading-tight">
              Formula to execute your imaginations.
            </h2>

            <p className="text-sm text-[#18251F]/80 leading-relaxed">
              Based in Kuvempu Nagar, Davangere, <strong>Sutra Events</strong> was founded with a singular conviction: every family celebration and milestone deserves the synthesis of authentic traditional craftsmanship and modern editorial design.
            </p>

            <p className="text-sm text-[#18251F]/80 leading-relaxed">
              From majestic Chettinad and temple-inspired royal mandaps laden with fresh fragrant jasmine strings to contemporary crystal reception stages, we take pride in our on-ground execution capabilities across premier venues in central Karnataka.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#D8B77A]/30">
              <div>
                <span className="font-serif text-2xl text-[#18251F]">Local Sourcing</span>
                <p className="text-xs text-neutral-600 mt-1">Direct relationships with Davangere flower markets & artisans.</p>
              </div>
              <div>
                <span className="font-serif text-2xl text-[#18251F]">Precision Buffers</span>
                <p className="text-xs text-neutral-600 mt-1">Mandatory setup & electrical safety intervals for every stage.</p>
              </div>
              <div>
                <span className="font-serif text-2xl text-[#18251F]">Transparent Pricing</span>
                <p className="text-xs text-neutral-600 mt-1">Itemized quotation breakdowns with zero hidden line costs.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#18251F] text-[#F6F0E4] p-8 border border-[#D8B77A]/30 space-y-6 shadow-xl">
            <h3 className="font-serif text-2xl text-[#D8B77A]">
              Our 4-Step Execution Sutra
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <span className="font-mono text-[#D8B77A] font-bold">01.</span>
                <div>
                  <strong className="text-[#F6F0E4] block">Consultation & Date Lock:</strong>
                  <span className="text-[#F6F0E4]/70">Initial brief intake, ritual schedule alignment, and server date availability check.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-mono text-[#D8B77A] font-bold">02.</span>
                <div>
                  <strong className="text-[#F6F0E4] block">Itemized Quotation & Hold:</strong>
                  <span className="text-[#F6F0E4]/70">Transparent line-item costing. Customer accepts to place a temporary 48h hold.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-mono text-[#D8B77A] font-bold">03.</span>
                <div>
                  <strong className="text-[#F6F0E4] block">Artisanal Sourcing:</strong>
                  <span className="text-[#F6F0E4]/70">Carpentry prep, customized lighting trusses, and morning-of fresh flower sourcing.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="font-mono text-[#D8B77A] font-bold">04.</span>
                <div>
                  <strong className="text-[#F6F0E4] block">Flawless On-Site Execution:</strong>
                  <span className="text-[#F6F0E4]/70">Rigorous quality supervision, ritual coordination, and respectful teardown.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Details & Map Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-12 border-t border-[#D8B77A]/30">
          
          {/* Verified Business Information (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <div className="text-xs font-semibold text-[#8D5962] tracking-widest uppercase mb-1">
                Studio Address & Contact
              </div>
              <h3 className="font-serif text-3xl text-[#18251F]">
                Get in Touch with Sutra Events
              </h3>
            </div>

            <div className="space-y-4 text-xs text-[#18251F]/80">
              <div className="flex items-start gap-3 p-4 bg-white border border-[#D8B77A]/30">
                <MapPin className="w-5 h-5 text-[#8D5962] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#18251F] block text-sm">Studio Location</strong>
                  <p className="mt-1 leading-relaxed">
                    12th Cross Road, Anjaneya Badavane, Kuvempu Nagar,<br />
                    Davangere, Karnataka 577004, India.
                  </p>
                  <a
                    href="https://maps.google.com/?q=Kuvempu+Nagar+Davangere+Karnataka+577004"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#8D5962] font-semibold hover:underline mt-2"
                  >
                    <span>Open in Google Maps</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-[#D8B77A]/30 space-y-1">
                  <div className="flex items-center gap-2 text-[#8D5962] font-semibold">
                    <Phone className="w-4 h-4" />
                    <span>Direct Calling</span>
                  </div>
                  <a href="tel:+919663643161" className="text-sm font-semibold text-[#18251F] hover:text-[#8D5962] block">
                    +91 96636 43161
                  </a>
                  <span className="text-[11px] text-neutral-500">Mon–Sun 9:00 AM – 9:00 PM</span>
                </div>

                <div className="p-4 bg-white border border-[#D8B77A]/30 space-y-1">
                  <div className="flex items-center gap-2 text-[#8D5962] font-semibold">
                    <Mail className="w-4 h-4" />
                    <span>Official Email</span>
                  </div>
                  <a href="mailto:sutraeventss@gmail.com" className="text-xs font-semibold text-[#18251F] hover:text-[#8D5962] block truncate">
                    sutraeventss@gmail.com
                  </a>
                  <span className="text-[11px] text-neutral-500">Formal queries & quotations</span>
                </div>
              </div>

              <div className="p-4 bg-white border border-[#D8B77A]/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Globe className="w-4 h-4 text-[#D8B77A]" />
                    <span>Existing Website Domain</span>
                  </div>
                  <a 
                    href="https://www.sutraevents.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-[#18251F] hover:underline text-xs mt-0.5 block"
                  >
                    https://www.sutraevents.com/
                  </a>
                </div>

                <a
                  href="https://wa.me/919663643161?text=Hello%20Sutra%20Events%2C%20I%20would%20like%20to%20visit%20your%20Davangere%20studio."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#25D366] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#20ba5a] transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-white" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Direct Note Form (lg:col-span-6) */}
          <div className="lg:col-span-6 bg-white border border-[#D8B77A]/40 p-6 sm:p-8 shadow-sm">
            <h4 className="font-serif text-2xl text-[#18251F] mb-1">
              Send a Direct Note to our Studio
            </h4>
            <p className="text-xs text-[#18251F]/60 mb-6">
              For general inquiries, venue inspections in Davangere, or vendor collaborations.
            </p>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-semibold text-sm">Message Received</div>
                <p>
                  Thank you, {name}. Our Davangere team will reach out to you shortly via {contact}.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 px-4 py-1.5 bg-emerald-800 text-white text-[11px] font-semibold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your name"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#18251F] focus:outline-none focus:border-[#D8B77A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1">
                    Phone or Email *
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                    placeholder="+91 96636... or email@domain.com"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#18251F] focus:outline-none focus:border-[#D8B77A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#18251F] mb-1">
                    Message or Question *
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Tell us about your upcoming celebration or questions..."
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-300 text-xs text-[#18251F] focus:outline-none focus:border-[#D8B77A]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#18251F] hover:bg-[#253930] text-[#F6F0E4] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#D8B77A]" />
                  <span>Send Studio Inquiry</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
