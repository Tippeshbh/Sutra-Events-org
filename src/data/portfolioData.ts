import heroMandap from '../assets/images/hero_mandap_wedding_1791577194939.jpg';
import receptionStage from '../assets/images/reception_stage_luxury_1791577205984.jpg';
import haldiDecor from '../assets/images/haldi_mehendi_decor_1791577220588.jpg';
import engagementBackdrop from '../assets/images/engagement_backdrop_1791577232426.jpg';
import babyShowerDecor from '../assets/images/birthday_baby_shower_1791577243606.jpg';

export interface PortfolioProject {
  id: string;
  title: string;
  category: 'Weddings & Mandap' | 'Receptions' | 'Haldi & Sangeet' | 'Engagements' | 'Baby Shower & Birthdays';
  style: 'Royal Heritage' | 'Contemporary Luxury' | 'Traditional Festive' | 'Romantic Floral' | 'Pastel Whimsical';
  palette: 'Champagne Gold & Forest Green' | 'Ivory & Blush Rose' | 'Sunshine Yellow & Brass' | 'Muted Rose & Champagne' | 'Warm Peach & Cream';
  image: string;
  location: string;
  description: string;
  elements: string[];
  durationSetup: string;
  demonstrationNotice?: string;
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'proj-royal-mandap',
    title: 'Royal Chettinad Floral Mandap',
    category: 'Weddings & Mandap',
    style: 'Royal Heritage',
    palette: 'Champagne Gold & Forest Green',
    image: heroMandap,
    location: 'Bapuji Convention Center, Davangere',
    description: 'An authentic South Indian royal wedding mandap conceived with hand-carved pillars, fresh white jasmine curtains, and tiered golden marigold arches framed by traditional brass oil lamps.',
    elements: ['Fresh Mogra (Jasmine) Strings', 'Tiered Marigold Torans', 'Carved Wood Architecture', 'Warm Kuthuvilakku Glow', 'Sanctum Stage Carpet'],
    durationSetup: '14-Hour Precision Setup & Florist Team',
    demonstrationNotice: 'Studio concept photograph representing Sutra Events signature mandap architecture and floral standards in Davangere.'
  },
  {
    id: 'proj-reception-stage',
    title: 'The Imperial Crystal Reception Stage',
    category: 'Receptions',
    style: 'Contemporary Luxury',
    palette: 'Ivory & Blush Rose',
    image: receptionStage,
    location: 'Trishul Banquet Lawn, Davangere',
    description: 'Grand ballroom styling featuring tiered cascading blush roses, backlit champagne filigree arches, vintage crystal chandeliers, and an elevated couple stage.',
    elements: ['Crystal Chandeliers', 'English Blush Roses & Hydrangeas', 'Champagne Silk Draping', 'Warm Spotlights', 'Polished Monogram Flooring'],
    durationSetup: '10-Hour Structural & Electrical Rigging',
    demonstrationNotice: 'Studio showcase concept for grand wedding receptions and anniversary galas.'
  },
  {
    id: 'proj-haldi-mehendi',
    title: 'Anandotsav Traditional Haldi Mandap',
    category: 'Haldi & Sangeet',
    style: 'Traditional Festive',
    palette: 'Sunshine Yellow & Brass',
    image: haldiDecor,
    location: 'Courtyard Villa, Kuvempu Nagar, Davangere',
    description: 'A vibrant outdoor courtyard transformed with overhead yellow marigold canopies, antique hand-hammered brass urlis filled with fresh rose petals, and ethnic jute seating.',
    elements: ['Genda Phool Floral Canopies', 'Brass Urlis with Floating Petals', 'Low Diwan Seating', 'Mango Leaf Thoranas', 'Custom Folk Photobooth'],
    durationSetup: '6-Hour On-Site Installation',
    demonstrationNotice: 'Studio concept depicting courtyard and lawn haldi celebrations.'
  },
  {
    id: 'proj-engagement-backdrop',
    title: 'Eternal Bloom Ring Ceremony Arch',
    category: 'Engagements',
    style: 'Romantic Floral',
    palette: 'Muted Rose & Champagne',
    image: engagementBackdrop,
    location: 'Davangere Club Banquet Hall',
    description: 'Sleek romantic engagement backdrop featuring an asymmetrical floral arch woven with muted rose, eucalyptus, and baby’s breath, anchored by a custom illuminated initials crest.',
    elements: ['Backlit Acrylic Monogram', 'Curved Floral Archway', 'Warm Fairy String Tunnel', 'Velvet Accent Chairs', 'Foliage Centerpieces'],
    durationSetup: '5-Hour Quick Turnaround Setup',
    demonstrationNotice: 'Studio demonstration render for intimate engagements and ring ceremonies.'
  },
  {
    id: 'proj-baby-shower',
    title: 'Celestial Bloom Baby Shower & First Birthday',
    category: 'Baby Shower & Birthdays',
    style: 'Pastel Whimsical',
    palette: 'Warm Peach & Cream',
    image: babyShowerDecor,
    location: 'Private Residence, Anjaneya Badavane, Davangere',
    description: 'Sophisticated celebration setup blending organic matte balloon arches with fresh ivory blooms, fluted wooden cake pedestals, and subtle warm neon signage.',
    elements: ['Fluted Timber Pedestals', 'Matte Balloon Garland', 'Fresh Rose & Baby Breath Accents', 'Warm Neon Script', 'Vintage Wooden Rocking Horse'],
    durationSetup: '4-Hour Clean Styling',
    demonstrationNotice: 'Studio showcase photo highlighting milestone and baby shower decor.'
  }
];
