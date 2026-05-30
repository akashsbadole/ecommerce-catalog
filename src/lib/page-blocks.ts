export type BlockType = 'hero' | 'features' | 'cta' | 'testimonials' | 'image-gallery' | 'text' | 'spacer' | 'divider' | 'products' | 'faq' | 'slider' | 'product-carousel' | 'about'
  | 'trust-bar' | 'audience-cards' | 'capabilities' | 'product-categories' | 'factory-reel'
  | 'certifications' | 'lead-capture' | 'leadership' | 'partner-logos' | 'sticky-cta';

export interface PageBlock {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
}

export const BLOCK_DEFAULTS: Record<BlockType, { label: string; icon: string; defaultData: Record<string, unknown> }> = {
  hero: {
    label: 'Hero Banner',
    icon: 'Image',
    defaultData: {
      title: 'Welcome',
      subtitle: '',
      buttonText: 'Learn More',
      buttonLink: '/catalogue',
      backgroundImage: '',
      height: 'medium',
      alignment: 'center',
    },
  },
  features: {
    label: 'Features Grid',
    icon: 'LayoutGrid',
    defaultData: {
      title: 'Our Features',
      columns: 3,
      features: [{ title: 'Feature 1', description: 'Description', icon: 'Star' }],
    },
  },
  cta: {
    label: 'Call to Action',
    icon: 'MousePointerClick',
    defaultData: {
      title: 'Get Started Today',
      description: 'Sign up now',
      buttonText: 'Sign Up',
      buttonLink: '/contact',
      backgroundColor: 'emerald',
    },
  },
  testimonials: {
    label: 'Testimonials',
    icon: 'Quote',
    defaultData: {
      title: 'What Our Clients Say',
      testimonials: [{ name: 'John Doe', role: 'CEO', quote: 'Great product!', avatar: '' }],
    },
  },
  'image-gallery': {
    label: 'Image Gallery',
    icon: 'Images',
    defaultData: {
      title: 'Gallery',
      columns: 3,
      images: [''],
    },
  },
  text: {
    label: 'Text Block',
    icon: 'Type',
    defaultData: {
      content: '<p>Enter your text here...</p>',
    },
  },
  spacer: {
    label: 'Spacer',
    icon: 'MoveVertical',
    defaultData: {
      height: 64,
    },
  },
  divider: {
    label: 'Divider',
    icon: 'Minus',
    defaultData: {
      style: 'solid',
    },
  },
  products: {
    label: 'Product Showcase',
    icon: 'Package',
    defaultData: {
      title: 'Featured Products',
      maxProducts: 6,
      layout: 'grid',
    },
  },
  faq: {
    label: 'FAQ Section',
    icon: 'HelpCircle',
    defaultData: {
      title: 'Frequently Asked Questions',
      items: [{ question: 'Question?', answer: 'Answer.' }],
    },
  },
  slider: {
    label: 'Image Slider',
    icon: 'GalleryHorizontal',
    defaultData: {
      items: [
        { image: '', title: 'Slide 1', subtitle: 'Description 1', link: '' }
      ],
      autoplay: true,
      interval: 5000,
    },
  },
  'product-carousel': {
    label: 'Product Carousel',
    icon: 'Layers',
    defaultData: {
      title: 'Our Products',
      maxProducts: 10,
      categoryId: '',
    },
  },
  about: {
    label: 'About Section',
    icon: 'User',
    defaultData: {
      title: 'About Us',
      content: '<p>Tell your story here...</p>',
      image: '',
      imagePosition: 'left',
      buttonText: 'Read More',
      buttonLink: '',
    },
  },
  'trust-bar': {
    label: 'Trust Numbers Bar',
    icon: 'TrendingUp',
    defaultData: {
      stats: [
        { value: 15, suffix: '+', label: 'Years in manufacturing' },
        { value: 5000, suffix: '+', label: 'MT annual capacity' },
        { value: 80, suffix: '+', label: 'SKUs across categories' },
        { value: 12, suffix: '+', label: 'States served' },
        { value: 100, suffix: '%', label: 'Own manufacturing' },
      ],
    },
  },
  'audience-cards': {
    label: 'Who We Serve',
    icon: 'Users',
    defaultData: {
      label: 'Who we serve',
      heading: 'We manufacture for',
      description: 'From first batch to full-scale production',
      cards: [
        { title: 'B2B brands', description: 'Bulk supply of finished goods under your brand', cta: 'Enquire now' },
        { title: 'Private label', description: 'Custom packaging, your branding, our recipe', cta: 'Get details' },
        { title: 'Distributors', description: 'Trade pricing, consistent supply, multi-SKU range', cta: 'Partner with us' },
        { title: 'Institutional buyers', description: 'Canteens, airlines, hospitality, govt procurement', cta: 'Send requirement' },
      ],
    },
  },
  capabilities: {
    label: 'Manufacturing Capabilities',
    icon: 'Factory',
    defaultData: {
      label: 'Manufacturing capabilities',
      heading: 'Why partner with us',
      items: [
        'Own factory & machinery',
        'FSSAI & ISO certified',
        '5 production lines',
        'Custom packaging ready',
        'Hygiene-first processes',
        'On-time delivery',
      ],
      imageCaption: 'Facility / production line image',
      ctaText: 'View full capabilities',
      ctaLink: '/page/manufacturing',
    },
  },
  'product-categories': {
    label: 'Product Category Preview',
    icon: 'LayoutGrid',
    defaultData: {
      label: 'Our product range',
      heading: 'Product categories',
      description: 'Manufactured in-house · available for bulk, private label & contract production',
      categories: [
        { name: 'Khakhra', variants: '12+ variants' },
        { name: 'Bhakhri', variants: '8+ variants' },
        { name: 'Makhana', variants: '10+ variants' },
        { name: 'Extruder products', variants: '6+ variants' },
        { name: 'Digestive', variants: '4+ variants' },
      ],
      ctaText: 'View all products & packaging',
      ctaLink: '/catalogue',
    },
  },
  'factory-reel': {
    label: 'Factory & Facility Reel',
    icon: 'Video',
    defaultData: {
      label: 'Factory & facility reel',
      heading: 'See our facility in action',
      description: 'Factory floor · machinery · warehouse · loading trucks · staff · hygiene systems',
      videoUrl: '',
      thumbnailUrl: '',
      ctaText: 'Watch full factory tour',
      ctaLink: '/page/manufacturing',
    },
  },
  certifications: {
    label: 'Certifications & Compliance',
    icon: 'Award',
    defaultData: {
      label: 'Certifications & compliance',
      heading: 'Certified. Compliant. Trusted.',
      items: ['FSSAI', 'ISO', 'BIS', 'HACCP', 'GMP'],
      ctaText: 'View all certifications',
      ctaLink: '/page/manufacturing',
    },
  },
  'lead-capture': {
    label: 'Lead Capture Form',
    icon: 'FormInput',
    defaultData: {
      label: 'Looking for a manufacturing partner?',
      heading: 'Let\'s talk manufacturing',
      description: 'Tell us your requirement — we\'ll get back within 24 hours',
      successMessage: 'Enquiry submitted! We\'ll call you back within 24 hours.',
      apiEndpoint: '/api/enquiries',
      submitText: 'Submit enquiry — we\'ll call you back',
      disclaimer: 'Data goes directly to CRM · sales team alerted instantly · no spam',
      fields: [
        { name: 'name', label: 'Your name', type: 'text', required: true, placeholder: 'Your name *' },
        { name: 'company', label: 'Company name', type: 'text', required: true, placeholder: 'Company name *' },
        { name: 'phone', label: 'Phone number', type: 'tel', required: true, placeholder: 'Phone number *' },
        { name: 'email', label: 'Email address', type: 'email', required: false, placeholder: 'Email address' },
        { name: 'requirement', label: 'Requirement type', type: 'select', required: false, placeholder: 'Requirement type', options: ['Bulk order', 'Private label', 'Distribution', 'Investment', 'Other'] },
        { name: 'city', label: 'City / state', type: 'text', required: false, placeholder: 'City / state' },
      ],
      messageField: true,
    },
  },
  leadership: {
    label: 'Leadership',
    icon: 'UserCircle',
    defaultData: {
      label: 'Leadership',
      heading: 'Meet the leadership',
      ctaText: 'Read full story',
      ctaLink: '/page/about-us',
      members: [
        { name: 'Director name', role: 'Co-founder & Director', bio: '20+ yrs FMCG distribution background. Placeholder bio line.' },
        { name: 'Director name', role: 'Co-founder & Director', bio: 'Operations & manufacturing lead. Placeholder bio line.' },
      ],
    },
  },
  'partner-logos': {
    label: 'Partner Logos',
    icon: 'Building',
    defaultData: {
      heading: 'Trusted by brands across India',
      testimonials: [
        { quote: '"Consistent quality, on-time delivery. Best manufacturing partner we\'ve worked with."', author: 'Brand name, City' },
        { quote: '"Private label setup was smooth, packaging was exactly what we needed for retail."', author: 'Distributor name, State' },
        { quote: '"Scale, hygiene standards and response time — all top class. Highly recommended."', author: 'Company name, State' },
      ],
      logoCount: 5,
    },
  },
  'sticky-cta': {
    label: 'Sticky CTA Bar',
    icon: 'ArrowDownToLine',
    defaultData: {
      text: 'Ready to manufacture at scale?',
      buttons: [
        { text: 'Get bulk quote', type: 'primary', action: 'enquiry' },
        { text: 'WhatsApp us', type: 'whatsapp', action: 'whatsapp' },
        { text: '+91 XXXXX XXXXX', type: 'phone', action: 'phone' },
      ],
    },
  },
};

export function createBlock(type: BlockType): PageBlock {
  const defaults = BLOCK_DEFAULTS[type];
  return {
    id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    data: { ...defaults.defaultData },
  };
}
