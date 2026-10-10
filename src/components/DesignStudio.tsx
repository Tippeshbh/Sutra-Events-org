import React, { useState } from 'react';
import { Sparkles, Palette, Flower2, Layers, Lightbulb, Users, MapPin, ArrowRight, Check } from 'lucide-react';
import { DesignBrief } from '../types/index.js';

interface DesignStudioProps {
  onTransferBriefToBooking: (brief: DesignBrief) => void;
}

export const DesignStudio: React.FC<DesignStudioProps> = ({ onTransferBriefToBooking }) => {
  const [step, setStep] = useState(1);

  const [brief, setBrief] = useState<DesignBrief>({
    celebrationType: 'Wedding & Royal Mandap',
    aesthetic: 'Royal Heritage & Traditional Luxury',
    palette: 'Champagne Gold & Forest Green',
    florals: ['Fresh Mogra (Jasmine) Curtains', 'Traditional Genda Phool (Marigold)'],
    backdrop: 'Hand-carved Wooden Chettinad Pillars with Brass Lanterns',
    stageAndLighting: ['Warm Spotlight Illumination', 'Crystal Chandeliers', 'Brass Oil Kuthuvilakku Glow'],
    guestEstimate: '300 - 800 Guests (Medium to Grand)',
    venueType: 'Indoor Kalyana Mantapa / Convention Center in Davangere',
    specialRequests: ''
  });

  const celebrationTypes = [
    'Wedding & Royal Mandap',
    'Grand Reception Gala',
    'Traditional Haldi & Mehendi',
    'Engagement & Ring Ceremony',
    'Traditional Seemantha / Baby Shower',
    'Milestone Birthday & Anniversary',
    'Gruha Pravesha (Housewarming)',
    'Corporate Conclave & Brand Gala'
  ];

  const aesthetics = [
    { title: 'Royal Heritage & Traditional Luxury', desc: 'Carved temple pillars, brass kuthuvilakku lamps, deep cultural roots.' },
    { title: 'Contemporary Editorial Romance', desc: 'Sleek geometric lines, cascading English roses, subtle acrylics.' },
    { title: 'Botanical & Garden Whimsical', desc: 'Lush eucalyptus foliage, organic floral arches, soft natural sunlight.' },
    { title: 'Minimalist Modern Elegance', desc: 'Fluted wood textures, warm ivory monochromes, discreet ambient glow.' },
    { title: 'Vibrant Folk Festival', desc: 'Bright yellow marigold curtains, festive bandhani fabrics, folk accents.' }
  ];

  const colorPalettes = [
    { name: 'Champagne Gold & Forest Green', colors: ['#D8B77A', '#18251F', '#F6F0E4'] },
    { name: 'Muted Rose, Blush & Champagne', colors: ['#8D5962', '#E8C5C8', '#D8B77A'] },
    { name: 'Traditional Marigold Sunshine & Brass', colors: ['#EAA822', '#D96528', '#D8B77A'] },
    { name: 'Regal Crimson, Maroon & Antique Gold', colors: ['#7A1C25', '#4A1118', '#D8B77A'] },
    { name: 'Pastel Peach, Mint & Warm Ivory', colors: ['#F2C4B2', '#C6DFD4', '#F6F0E4'] }
  ];

  const floralOptions = [
    'Fresh Mogra (Jasmine) Curtains',
    'Traditional Genda Phool (Marigold)',
    'Imported English Blush Roses',
    'Exotic White Orchids & Baby’s Breath',
    'Sacred Pink & White Lotus Blooms',
    'Cascading Eucalyptus & Ivy Foliage'
  ];

  const stageBackdrops = [
    'Hand-carved Wooden Chettinad Pillars with Brass Lanterns',
    'Panoramic Curving 3D Filigree Panel with Champagne Drapes',
    'Asymmetrical Botanical Archway with Monogram Backlight',
    'Geometric Gold Lattice with Mirror Inlays',
    'Temple Sanctum Gopuram Silhouette with Floral Trim',
    'Fluted Wooden Panels with Warm Glow LED Lettering'
  ];

  const lightingAtmospheres = [
    'Warm Spotlight Illumination',
    'Crystal Chandeliers',
    'Brass Oil Kuthuvilakku Glow',
    'Starlight Fairy Light Canopy Ceiling',
    'Floor Uplighters on Architectural Pillars',
    'Sparkular Cold Pyro Machine (Couple Entry)',
    'Low-Fog Dry Ice Atmospheric Smoke'
  ];

  const toggleFloral = (flower: string) => {
    setBrief(prev => ({
      ...prev,
      florals: prev.florals.includes(flower)
        ? prev.florals.filter(f => f !== flower)
        : [...prev.florals, flower]
    }));
  };

  const toggleLighting = (light: string) => {
    setBrief(prev => ({
      ...prev,
      stageAndLighting: prev.stageAndLighting.includes(light)
        ? prev.stageAndLighting.filter(l => l !== light)
        : [...prev.stageAndLighting, light]
    }));
  };

  const handleCompleteBrief = () => {
    onTransferBriefToBooking(brief);
  };

  return (
    <div className="bg-[#18251F] text-[#F6F0E4] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold text-[#D8B77A] tracking-widest uppercase mb-2">
            Interactive Brief Builder
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#F6F0E4] font-normal">
            Event Design Studio
          </h2>
          <p className="mt-3 text-sm text-[#F6F0E4]/70 leading-relaxed">
            Curate the creative direction for your celebration in Davangere. Customize color palettes, stage structures, floral styles, and ambience to build a tailored design brief for our senior creative director.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Configurator (lg:col-span-8) */}
          <div className="lg:col-span-8 bg-[#18251F]/90 border border-[#D8B77A]/30 p-6 sm:p-8 space-y-8">
            
            {/* Steps Navigation Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs">
              <span className="text-[#D8B77A] font-medium">
                Design Configuration Step {step} of 4
              </span>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(s => (
                  <button
                    key={s}
                    onClick={() => setStep(s)}
                    className={`w-7 h-7 flex items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                      step === s 
                        ? 'bg-[#D8B77A] text-[#18251F]' 
                        : 'border border-white/20 text-[#F6F0E4]/60 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 1: Celebration & Style Aesthetic */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="font-serif text-xl text-[#F6F0E4] mb-1">
                    Select Celebration Type
                  </h3>
                  <p className="text-xs text-[#F6F0E4]/60 mb-4">
                    Choose the celebration you wish to design with Sutra Events.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {celebrationTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => setBrief({ ...brief, celebrationType: type })}
                        className={`p-3 text-left border text-xs transition-all cursor-pointer ${
                          brief.celebrationType === type
                            ? 'border-[#D8B77A] bg-[#D8B77A]/15 text-[#F6F0E4] font-medium'
                            : 'border-white/10 hover:border-white/30 text-[#F6F0E4]/80'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="font-serif text-xl text-[#F6F0E4] mb-1">
                    Design Aesthetic Direction
                  </h3>
                  <p className="text-xs text-[#F6F0E4]/60 mb-4">
                    The overarching emotional tone and visual philosophy of the stage.
                  </p>
                  <div className="space-y-2.5">
                    {aesthetics.map(a => (
                      <button
                        key={a.title}
                        onClick={() => setBrief({ ...brief, aesthetic: a.title })}
                        className={`w-full p-3.5 text-left border transition-all cursor-pointer ${
                          brief.aesthetic === a.title
                            ? 'border-[#D8B77A] bg-[#D8B77A]/15 text-[#F6F0E4]'
                            : 'border-white/10 hover:border-white/30 text-[#F6F0E4]/80'
                        }`}
                      >
                        <div className="font-medium text-xs text-[#D8B77A]">{a.title}</div>
                        <div className="text-[11px] text-[#F6F0E4]/60 mt-0.5">{a.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 bg-[#D8B77A] text-[#18251F] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:bg-[#c9a667]"
                  >
                    <span>Next: Color & Florals</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Color Palette & Florals */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="font-serif text-xl text-[#F6F0E4] mb-1">
                    Harmonized Color Palette
                  </h3>
                  <p className="text-xs text-[#F6F0E4]/60 mb-4">
                    Select a curated color balance for drapes, upholstery, and florals.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {colorPalettes.map(palette => (
                      <button
                        key={palette.name}
                        onClick={() => setBrief({ ...brief, palette: palette.name })}
                        className={`p-3.5 text-left border transition-all cursor-pointer ${
                          brief.palette === palette.name
                            ? 'border-[#D8B77A] bg-[#D8B77A]/15 text-[#F6F0E4]'
                            : 'border-white/10 hover:border-white/30 text-[#F6F0E4]/80'
                        }`}
                      >
                        <div className="text-xs font-medium mb-2">{palette.name}</div>
                        <div className="flex gap-1.5">
                          {palette.colors.map((c, idx) => (
                            <span 
                              key={idx} 
                              className="w-5 h-5 rounded-full border border-black/20" 
                              style={{ backgroundColor: c }} 
                            />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="font-serif text-xl text-[#F6F0E4] mb-1">
                    Signature Floral Selections
                  </h3>
                  <p className="text-xs text-[#F6F0E4]/60 mb-4">
                    Select one or more fresh botanical components sourced for your function.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {floralOptions.map(flower => {
                      const selected = brief.florals.includes(flower);
                      return (
                        <button
                          key={flower}
                          onClick={() => toggleFloral(flower)}
                          className={`p-3 text-left border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            selected 
                              ? 'border-[#D8B77A] bg-[#D8B77A]/15 text-[#F6F0E4]' 
                              : 'border-white/10 text-[#F6F0E4]/70 hover:border-white/30'
                          }`}
                        >
                          <span>{flower}</span>
                          <span className={`w-4 h-4 border flex items-center justify-center ${selected ? 'border-[#D8B77A] bg-[#D8B77A] text-[#18251F]' : 'border-white/30'}`}>
                            {selected && <Check className="w-3 h-3" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-white/20 text-xs text-[#F6F0E4]/80 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-2.5 bg-[#D8B77A] text-[#18251F] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:bg-[#c9a667]"
                  >
                    <span>Next: Stage & Ambience</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Backdrop & Lighting */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="font-serif text-xl text-[#F6F0E4] mb-1">
                    Stage Architecture & Backdrop
                  </h3>
                  <p className="text-xs text-[#F6F0E4]/60 mb-4">
                    Choose the central architectural focal point for ceremony rituals or couple seating.
                  </p>
                  <div className="space-y-2.5">
                    {stageBackdrops.map(backdrop => (
                      <button
                        key={backdrop}
                        onClick={() => setBrief({ ...brief, backdrop })}
                        className={`w-full p-3 text-left border text-xs transition-colors cursor-pointer ${
                          brief.backdrop === backdrop
                            ? 'border-[#D8B77A] bg-[#D8B77A]/15 text-[#F6F0E4]'
                            : 'border-white/10 text-[#F6F0E4]/80 hover:border-white/30'
                        }`}
                      >
                        {backdrop}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="font-serif text-xl text-[#F6F0E4] mb-1">
                    Lighting & Atmospheric Ambience
                  </h3>
                  <p className="text-xs text-[#F6F0E4]/60 mb-4">
                    Lighting transforms photography quality and guest immersion.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {lightingAtmospheres.map(light => {
                      const selected = brief.stageAndLighting.includes(light);
                      return (
                        <button
                          key={light}
                          onClick={() => toggleLighting(light)}
                          className={`p-3 text-left border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            selected 
                              ? 'border-[#D8B77A] bg-[#D8B77A]/15 text-[#F6F0E4]' 
                              : 'border-white/10 text-[#F6F0E4]/70 hover:border-white/30'
                          }`}
                        >
                          <span>{light}</span>
                          <span className={`w-4 h-4 border flex items-center justify-center ${selected ? 'border-[#D8B77A] bg-[#D8B77A] text-[#18251F]' : 'border-white/30'}`}>
                            {selected && <Check className="w-3 h-3" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 border border-white/20 text-xs text-[#F6F0E4]/80 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="px-6 py-2.5 bg-[#D8B77A] text-[#18251F] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:bg-[#c9a667]"
                  >
                    <span>Next: Venue & Scale</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Scale, Venue Style & Notes */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="font-serif text-xl text-[#F6F0E4] mb-1">
                    Estimated Guest Attendance
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
                    {[
                      'Intimate (50 - 200 Guests)',
                      'Medium to Grand (200 - 600 Guests)',
                      'Mega Celebration (600 - 2000+ Guests)'
                    ].map(g => (
                      <button
                        key={g}
                        onClick={() => setBrief({ ...brief, guestEstimate: g })}
                        className={`p-3 text-left border text-xs transition-colors cursor-pointer ${
                          brief.guestEstimate === g
                            ? 'border-[#D8B77A] bg-[#D8B77A]/15 text-[#F6F0E4]'
                            : 'border-white/10 text-[#F6F0E4]/80 hover:border-white/30'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h3 className="font-serif text-xl text-[#F6F0E4] mb-1">
                    Venue Style in Davangere
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                    {[
                      'Indoor Kalyana Mantapa / Convention Center',
                      'Open-Air Resort Lawn / Farmhouse',
                      'Private Ancestral Courtyard / Home Residence',
                      'Hotel Ballroom / Banquet Hall'
                    ].map(v => (
                      <button
                        key={v}
                        onClick={() => setBrief({ ...brief, venueType: v })}
                        className={`p-3 text-left border text-xs transition-colors cursor-pointer ${
                          brief.venueType === v
                            ? 'border-[#D8B77A] bg-[#D8B77A]/15 text-[#F6F0E4]'
                            : 'border-white/10 text-[#F6F0E4]/80 hover:border-white/30'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <label className="font-serif text-xl text-[#F6F0E4] block mb-1">
                    Special Inclusions or Reference Notes
                  </label>
                  <p className="text-xs text-[#F6F0E4]/60 mb-3">
                    Mention specific family rituals, temple flower preferences, entrance gate requests, or venue names in Davangere.
                  </p>
                  <textarea
                    rows={3}
                    value={brief.specialRequests || ''}
                    onChange={(e) => setBrief({ ...brief, specialRequests: e.target.value })}
                    placeholder="e.g. Need grand elephant floral statues at the main hall gate, and couple entry with cold pyros at 7:30 PM..."
                    className="w-full bg-white/5 border border-white/20 p-3 text-xs text-[#F6F0E4] focus:outline-none focus:border-[#D8B77A]"
                  />
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setStep(3)}
                    className="px-4 py-2 border border-white/20 text-xs text-[#F6F0E4]/80 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCompleteBrief}
                    className="px-6 py-2.5 bg-[#D8B77A] text-[#18251F] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer hover:bg-[#c9a667]"
                  >
                    <span>Finalize Brief & Check Date Availability</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Live Design Brief Summary Card (lg:col-span-4) */}
          <div className="lg:col-span-4 bg-[#18251F] border border-[#D8B77A] p-6 space-y-6 shadow-xl sticky top-28">
            <div className="border-b border-[#D8B77A]/30 pb-4">
              <span className="text-xs font-semibold text-[#D8B77A] tracking-wider uppercase">
                Curated Design Brief
              </span>
              <h3 className="font-serif text-2xl text-[#F6F0E4] mt-1">
                {brief.celebrationType}
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[#F6F0E4]/50 uppercase tracking-widest text-[10px] block">Aesthetic</span>
                <span className="text-[#D8B77A] font-medium mt-0.5 block">{brief.aesthetic}</span>
              </div>

              <div>
                <span className="text-[#F6F0E4]/50 uppercase tracking-widest text-[10px] block">Color Harmony</span>
                <span className="text-[#F6F0E4] font-medium mt-0.5 block">{brief.palette}</span>
              </div>

              <div>
                <span className="text-[#F6F0E4]/50 uppercase tracking-widest text-[10px] block">Backdrop Structure</span>
                <span className="text-[#F6F0E4]/90 mt-0.5 block">{brief.backdrop}</span>
              </div>

              <div>
                <span className="text-[#F6F0E4]/50 uppercase tracking-widest text-[10px] block">Florals Selected</span>
                <div className="text-[#F6F0E4]/90 mt-0.5 flex flex-wrap gap-1.5">
                  {brief.florals.map(f => (
                    <span key={f} className="text-[#D8B77A] bg-[#D8B77A]/10 px-2 py-0.5 text-[11px]">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[#F6F0E4]/50 uppercase tracking-widest text-[10px] block">Lighting Ambience</span>
                <div className="text-[#F6F0E4]/90 mt-0.5 flex flex-wrap gap-1.5">
                  {brief.stageAndLighting.map(l => (
                    <span key={l} className="text-[#F6F0E4] bg-white/5 px-2 py-0.5 text-[11px]">
                      {l}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[#F6F0E4]/50 uppercase tracking-widest text-[10px] block">Scale & Venue</span>
                <span className="text-[#F6F0E4]/80 mt-0.5 block">{brief.guestEstimate} · {brief.venueType}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <button
                onClick={handleCompleteBrief}
                className="w-full py-3.5 bg-[#D8B77A] hover:bg-[#c9a667] text-[#18251F] text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Request Quotation with This Brief</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-[#F6F0E4]/50 leading-relaxed text-center">
                * Design briefs are reviewed by Sutra Events to verify floral season availability and structural venue fit before quotation issuance.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
