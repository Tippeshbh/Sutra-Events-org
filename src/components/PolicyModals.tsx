import React from 'react';
import { X, ShieldAlert, FileText, Lock } from 'lucide-react';

interface PolicyModalsProps {
  activePolicy: 'cancellation' | 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const PolicyModals: React.FC<PolicyModalsProps> = ({ activePolicy, onClose }) => {
  if (!activePolicy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-[#D8B77A] p-6 sm:p-8 space-y-6 shadow-2xl relative text-[#18251F]">
        
        <button
          onClick={onClose}
          aria-label="Close policy"
          className="absolute top-5 right-5 p-1 text-neutral-400 hover:text-black cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* CANCELLATION & REFUND POLICY */}
        {activePolicy === 'cancellation' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8D5962]">
              <ShieldAlert className="w-4 h-4 text-[#8D5962]" />
              <span>Studio Policy Document</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl text-[#18251F]">
              Cancellation & Advance Refund Policy
            </h3>

            <div className="text-xs text-neutral-500 italic p-3 bg-neutral-50 border border-neutral-200">
              * Draft policy template prepared for Sutra Events owner review. Actual contract specifics govern every individual signed quotation.
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-neutral-700">
              <h4 className="font-semibold text-[#18251F]">1. Advance Deposit to Lock Event Date</h4>
              <p>
                A standard advance deposit (typically 30% to 40% of the itemized quotation total) is required to transition an enquiry from temporary hold status into a confirmed reservation. Until this deposit is acknowledged, the date remains subject to standard expiration windows.
              </p>

              <h4 className="font-semibold text-[#18251F]">2. Cancellation Timelines & Refunds</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Cancellation 30+ Days Prior:</strong> 70% refund of advance deposit, less non-refundable custom fabrication charges (such as personalized monogram acrylics or bespoke wooden frames).
                </li>
                <li>
                  <strong>Cancellation 15 – 29 Days Prior:</strong> 50% refund of advance deposit.
                </li>
                <li>
                  <strong>Cancellation Within 14 Days:</strong> Advance deposit is non-refundable due to pre-purchased seasonal blooms, reserved carpentry crews, and blocked equipment inventory.
                </li>
              </ul>

              <h4 className="font-semibold text-[#18251F]">3. Rescheduling Policies</h4>
              <p>
                Clients may request a date change up to 14 days before the scheduled date subject to calendar availability. If the new date is open, the full advance is carried over with zero transfer penalty.
              </p>

              <h4 className="font-semibold text-[#18251F]">4. Force Majeure & Weather</h4>
              <p>
                In events of governmental restrictions or severe natural disruptions in Davangere, Sutra Events will work with the client to apply deposits to an alternate date within 12 months.
              </p>
            </div>
          </div>
        )}

        {/* PRIVACY POLICY */}
        {activePolicy === 'privacy' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8D5962]">
              <Lock className="w-4 h-4 text-[#8D5962]" />
              <span>Client Privacy & Data Security</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl text-[#18251F]">
              Client Privacy & Confidentiality Policy
            </h3>

            <div className="space-y-3 text-xs leading-relaxed text-neutral-700">
              <h4 className="font-semibold text-[#18251F]">1. Confidentiality of Client Information</h4>
              <p>
                Sutra Events strictly maintains the privacy of all clients. Customer names, contact numbers, event dates, and venue addresses are never published to the public availability calendar or shared with third-party advertising brokers.
              </p>

              <h4 className="font-semibold text-[#18251F]">2. Secure Verification</h4>
              <p>
                The online Booking Status Tracker requires both a private Reference Code and the registered client telephone number or email address to prevent unauthorized inspection of financial quotations.
              </p>

              <h4 className="font-semibold text-[#18251F]">3. Photography & Social Media Release</h4>
              <p>
                Stage and decoration photographs taken by our team for studio archival or portfolio purposes will not display identifiable family members or minors without express family consent.
              </p>
            </div>
          </div>
        )}

        {/* TERMS OF SERVICE */}
        {activePolicy === 'terms' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8D5962]">
              <FileText className="w-4 h-4 text-[#8D5962]" />
              <span>Terms of Service</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl text-[#18251F]">
              Terms of Service & Booking Inquiry Scope
            </h3>

            <div className="space-y-3 text-xs leading-relaxed text-neutral-700">
              <h4 className="font-semibold text-[#18251F]">1. Scope of Online Enquiries</h4>
              <p>
                Submission of a booking request through www.sutraevents.com generates an official reference code and initiates our availability evaluation. It does not create an irrevocable contract until verified and mutually accepted via official quotation.
              </p>

              <h4 className="font-semibold text-[#18251F]">2. Venue Permissions & Electrical Access</h4>
              <p>
                Clients are responsible for ensuring the booked venue management grants required setup access times (typically 6 to 12 hours buffer) and sufficient power supply for stage illumination and audio systems.
              </p>

              <h4 className="font-semibold text-[#18251F]">3. Fresh Floral Variations</h4>
              <p>
                Due to natural agricultural and seasonal conditions, natural flower shades may slightly vary. Sutra Events guarantees equivalent or superior quality floral species in all circumstances.
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#18251F] text-[#F6F0E4] text-xs font-semibold uppercase tracking-wider cursor-pointer"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};
