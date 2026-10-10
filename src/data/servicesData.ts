export interface ServiceItem {
  id: string;
  title: string;
  tagline: string;
  category: string;
  description: string;
  highlights: string[];
  setupTime: string;
  recommendedVenues: string;
  typicalCapacity: string;
  iconName: string;
}

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'weddings-mandap',
    title: 'Wedding Decoration & Royal Mandap Styling',
    tagline: 'Sacred architectural sanctums sculpted with fresh florals and royal heritage artistry.',
    category: 'Wedding Sanctum',
    description: 'We conceive and construct bespoke wedding mandaps that honor traditional rituals while introducing refined editorial elegance. From traditional South Indian carved wooden pillars draped in fragrant white jasmine and fresh marigold, to modern crystal-accented glass mandaps, every proportion is engineered for flawless photography and ritual sacredness.',
    highlights: [
      'Authentic South Indian & Contemporary Mandap Architecture',
      'Fresh Daily Flower Sourcing (Jasmine, Marigold, Lotus & Exotic Orchids)',
      'Agnikund Stage Fire-Safety Engineering and Ritual Buffers',
      'Entrance Torana, Floral Walkway & Welcoming Archways',
      'Complete Guest Aisle Seating and Dignitary Seating Styling'
    ],
    setupTime: '12 – 16 Hours Pre-Event Buffer',
    recommendedVenues: 'Convention Centers, Kalyana Mantapas, Resort Lawns across Davangere',
    typicalCapacity: '300 – 2,500+ Guests',
    iconName: 'Crown'
  },
  {
    id: 'reception-styling',
    title: 'Reception Stage & Grand Ballroom Styling',
    tagline: 'Immersive stage environments crafted with architectural backdrops, crystal and ambient light.',
    category: 'Reception & Gala',
    description: 'The wedding reception is your evening of celebration and royal grandeur. We engineer grand 40-to-80-foot panoramic stage backdrops with multilayered textures, customized royal monogram crests, cascading imported florals, and programmable architectural illumination.',
    highlights: [
      'Panoramic 3D Stage Sets with Curved Filigree & Velvet Drapery',
      'Imported Crystal Chandeliers and Warm Ambient Starlight Rigging',
      'Couple Entrance Concepts (Sparkular Cold Pyro, Dry Ice Cloud Smoke)',
      'Custom Monogram Photobooth & Memory Galleries',
      'VIP Dining Enclosure & Centerpiece Table Styling'
    ],
    setupTime: '8 – 12 Hours Prior',
    recommendedVenues: 'Grand Lawns, Hotel Ballrooms, Banquet Complexes',
    typicalCapacity: '250 – 1,800 Guests',
    iconName: 'Sparkles'
  },
  {
    id: 'haldi-mehendi',
    title: 'Traditional Haldi & Mehendi Functions',
    tagline: 'Sun-drenched, joyful celebration environments infused with authentic folk vibrancy.',
    category: 'Pre-Wedding Festivities',
    description: 'Haldi celebrations demand cheerful, radiant spaces built for music, laughter, and haldi rituals. We create vivid open-air and courtyard setups featuring overhead floral canopies, brass urlis filled with rose petals, colorful drapes, and traditional swing (jhula) backdrops.',
    highlights: [
      'Genda Phool (Marigold) Canopies and Floral Curtains',
      'Antique Hammered Brass Urlis for Couple Haldi Bath',
      'Folk Jute Charpai Seating & Bandhani Draped Cabanas',
      'Interactive Mehendi Lounges & Hand-painted Photo Corners',
      'Dholak & Music Stage Elevation'
    ],
    setupTime: '5 – 7 Hours Buffer',
    recommendedVenues: 'Private Home Courtyards, Farmhouses, Lawn Spaces',
    typicalCapacity: '75 – 350 Guests',
    iconName: 'Sun'
  },
  {
    id: 'engagement-ceremony',
    title: 'Engagement & Ring Ceremony Backdrops',
    tagline: 'Intimate romance sculpted with soft pastel tones, floral arches, and gentle luminescence.',
    category: 'Ring Ceremony',
    description: 'Celebrate the beginning of your journey with romantic, refined backdrop designs. Featuring asymmetric arches, blush roses, eucalyptus greenery, custom LED neon names, and warm candlelight pathways.',
    highlights: [
      'Asymmetric Geometric & Ring Floral Arches',
      'Custom Calligraphy Monogram Crests & Backlit Acrylics',
      'Elevated Couple Ring Exchange Dais with Luxury Seating',
      'Aisle Floral Pillars and Warm Lantern Pathways',
      'Audio & Mic Aesthetics for Ring Ceremony Exchanges'
    ],
    setupTime: '5 – 8 Hours',
    recommendedVenues: 'Boutique Banquet Halls, Club Pavilions, Courtyards',
    typicalCapacity: '100 – 500 Guests',
    iconName: 'Heart'
  },
  {
    id: 'baby-shower-naming',
    title: 'Traditional Seemantha & Whimsical Baby Showers',
    tagline: 'Cherishing new beginnings with traditional grace and dreamy celebratory palettes.',
    category: 'Maternity & Milestones',
    description: 'Whether honoring South Indian Seemantha traditions with lotus flowers and brass elements, or styling a contemporary pastel baby shower with organic balloon architecture and baby florals, we make every detail tender and memorable.',
    highlights: [
      'Traditional Seemantha Stage with Brass Lamps & Jasmine Canopies',
      'Pastel Organic Balloon Garlands with Fresh Floral Accents',
      'Custom Cradle / Thottil Décor for Naming Ceremonies',
      'Fluted Wooden Display Pedestals & Welcome Signage',
      'Family Photography Vignettes'
    ],
    setupTime: '4 – 6 Hours',
    recommendedVenues: 'Home Residences, Community Halls, Banquet Rooms',
    typicalCapacity: '50 – 250 Guests',
    iconName: 'Feather'
  },
  {
    id: 'milestone-birthdays',
    title: 'Milestone Birthdays & Anniversaries',
    tagline: 'Dynamic themed environments designed for uninhibited celebration.',
    category: 'Milestones',
    description: 'From 1st birthday wonderlands to grand 50th and 75th Shashtipoorthi celebrations. We build immersive bespoke stages tailored directly to the milestone honoree.',
    highlights: [
      'Thematic 3D Character Backdrops & Organic Garlands',
      'Shashtipoorthi Traditional Temple Sanctum Designs',
      'Illuminated Number Marquee Signage & LED Ambience',
      'Customized Dessert & Cake Table Architectures',
      'High-Energy Dance Floor Layouts'
    ],
    setupTime: '4 – 6 Hours',
    recommendedVenues: 'Banquet Halls, Clubs, Outdoor Lawns',
    typicalCapacity: '50 – 350 Guests',
    iconName: 'Gift'
  },
  {
    id: 'housewarming-ceremony',
    title: 'Gruha Pravesha (Housewarming) Décor',
    tagline: 'Welcoming prosperity into new homes with auspicious flowers and traditional toranas.',
    category: 'Home Rituals',
    description: 'Bestow auspicious blessings onto your new home. We adorn main door entrances with sacred mango leaves, fresh jasmine and marigold toranas, Rangoli floor floral artistry, and puja room sanctum highlights.',
    highlights: [
      'Grand Main Entrance Toranas with Fragrant Jasmine & Mango Leaves',
      'Sacred Homa Kunda Decor with Fire-Resistant Flooring Protection',
      'Intricate Flower Carpet (Pookkalam) at Main Foyer',
      'Puja Mandir Sanctum Backdrops & Brass Lamp Glow',
      'Terrace & Balcony Festive Lighting Strings'
    ],
    setupTime: '4 – 6 Hours Early Morning Access',
    recommendedVenues: 'Private Villas, Apartments, Residential Houses in Davangere',
    typicalCapacity: '50 – 200 Guests',
    iconName: 'Home'
  },
  {
    id: 'corporate-events',
    title: 'Corporate Galas, Conclaves & Brand Launches',
    tagline: 'Polished brand environments with professional staging, AV, and executive seating.',
    category: 'Corporate',
    description: 'Elevate business conferences, medical conventions, dealer meets, and corporate anniversaries. We provide professional acoustic staging, branded podiums, LED video wall backdrops, and seamless registration zones.',
    highlights: [
      'LED Video Wall Stage Trusses & High-Resolution Backdrop Sets',
      'Corporate Branded Registration Desks & Executive Seating',
      'Award Ceremony Staging with Dynamic Spotlighting',
      'Corporate Sound & Lapel Mic Management',
      'Signage, Standees & Press Conference Photowalls'
    ],
    setupTime: '6 – 10 Hours',
    recommendedVenues: 'Convention Centers, Star Hotels, Auditorium Venues',
    typicalCapacity: '100 – 1,000+ Attendees',
    iconName: 'Briefcase'
  },
  {
    id: 'photography-videography',
    title: 'Event Photography & Cinematic Videography',
    tagline: 'Professional visual documentation coordinated seamlessly with décor lighting setups.',
    category: 'Visual Media',
    description: 'Ensure every moment and intricate décor detail is preserved forever. We coordinate trusted local professional candid photographers and drone cinematographers who understand event lighting and auspicious ritual timings.',
    highlights: [
      'Candid Ritual & Ceremony Documentation',
      'High-Resolution Décor & Architectural Portfolio Capture',
      'Cinematic 4K Highlights Teaser & Full Function Video',
      'Drone Aerial Coverage (Permitted Venues)',
      'Same-Day Teaser Edits for Family Sharing'
    ],
    setupTime: 'Coordinated with Event Flow',
    recommendedVenues: 'Any booked celebration venue',
    typicalCapacity: 'Full Coverage',
    iconName: 'Camera'
  }
];
