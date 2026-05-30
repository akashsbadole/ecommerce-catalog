const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const HOMEPAGE_BLOCKS = [
  {
    id: 'block-hero',
    type: 'hero',
    data: {
      title: "India's trusted FMCG contract manufacturer",
      subtitle: "Khakhra · Makhana · Bhakhri · Extruder products — manufactured at scale for brands, distributors & private labels",
      buttonText: 'Enquire for bulk / private label',
      buttonLink: '/contact',
      height: 'large',
      alignment: 'center',
    },
  },
  {
    id: 'block-trust',
    type: 'trust-bar',
    data: {
      stats: [
        { value: 15, suffix: '+', label: 'Years in manufacturing' },
        { value: 5000, suffix: '+', label: 'MT annual capacity' },
        { value: 80, suffix: '+', label: 'SKUs across categories' },
        { value: 12, suffix: '+', label: 'States served' },
        { value: 100, suffix: '%', label: 'Own manufacturing' },
      ],
    },
  },
  {
    id: 'block-audience',
    type: 'audience-cards',
    data: {
      label: 'Who we serve',
      heading: 'We manufacture for',
      description: 'From first batch to full-scale production — across business types',
      cards: [
        { title: 'B2B brands', description: 'Bulk supply of finished goods under your brand', cta: 'Enquire now' },
        { title: 'Private label', description: 'Custom packaging, your branding, our recipe', cta: 'Get details' },
        { title: 'Distributors', description: 'Trade pricing, consistent supply, multi-SKU range', cta: 'Partner with us' },
        { title: 'Institutional buyers', description: 'Canteens, airlines, hospitality, govt procurement', cta: 'Send requirement' },
      ],
    },
  },
  {
    id: 'block-capabilities',
    type: 'capabilities',
    data: {
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
  {
    id: 'block-products',
    type: 'products',
    data: {
      title: 'Featured Products',
      maxProducts: 6,
    },
  },
  {
    id: 'block-categories',
    type: 'product-categories',
    data: {
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
  {
    id: 'block-factory',
    type: 'factory-reel',
    data: {
      label: 'Factory & facility reel',
      heading: 'See our facility in action',
      description: 'Factory floor · machinery · warehouse · loading trucks · staff · hygiene systems',
      ctaText: 'Watch full factory tour',
      ctaLink: '/page/manufacturing',
    },
  },
  {
    id: 'block-certifications',
    type: 'certifications',
    data: {
      label: 'Certifications & compliance',
      heading: 'Certified. Compliant. Trusted.',
      items: ['FSSAI', 'ISO', 'BIS', 'HACCP', 'GMP'],
      ctaText: 'View all certifications',
      ctaLink: '/page/manufacturing',
    },
  },
  {
    id: 'block-lead-capture',
    type: 'lead-capture',
    data: {
      label: 'Looking for a manufacturing partner?',
      heading: "Let's talk manufacturing",
      description: "Tell us your requirement — we'll get back within 24 hours",
      submitText: "Submit enquiry — we'll call you back",
      disclaimer: 'Data goes directly to CRM · sales team alerted instantly · no spam',
      messageField: true,
      fields: [
        { name: 'name', label: 'Your name', type: 'text', required: true, placeholder: 'Your name *' },
        { name: 'company', label: 'Company name', type: 'text', required: true, placeholder: 'Company name *' },
        { name: 'phone', label: 'Phone number', type: 'tel', required: true, placeholder: 'Phone number *' },
        { name: 'email', label: 'Email address', type: 'email', required: false, placeholder: 'Email address' },
        { name: 'requirement', label: 'Requirement type', type: 'select', required: false, placeholder: 'Requirement type', options: ['Bulk order', 'Private label', 'Distribution', 'Investment', 'Other'] },
        { name: 'city', label: 'City / state', type: 'text', required: false, placeholder: 'City / state' },
      ],
    },
  },
  {
    id: 'block-leadership',
    type: 'leadership',
    data: {
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
  {
    id: 'block-testimonials',
    type: 'partner-logos',
    data: {
      heading: 'Trusted by brands across India',
      testimonials: [
        { quote: '"Consistent quality, on-time delivery. Best manufacturing partner we\'ve worked with."', author: 'Brand name, City' },
        { quote: '"Private label setup was smooth, packaging was exactly what we needed for retail."', author: 'Distributor name, State' },
        { quote: '"Scale, hygiene standards and response time — all top class. Highly recommended."', author: 'Company name, State' },
      ],
      logoCount: 5,
    },
  },
  {
    id: 'block-sticky-cta',
    type: 'sticky-cta',
    data: {
      text: 'Ready to manufacture at scale?',
      buttons: [
        { text: 'Get bulk quote', type: 'primary', action: 'enquiry' },
        { text: 'WhatsApp us', type: 'whatsapp', action: 'whatsapp' },
        { text: '+91 XXXXX XXXXX', type: 'phone', action: 'phone' },
      ],
    },
  },
];

async function seedHomepage() {
  console.log('Seeding homepage content page...');

  const existing = await prisma.contentPage.findUnique({
    where: { slug: 'home' },
  });

  if (existing) {
    console.log('ContentPage with slug "home" already exists. Updating blocks...');
    await prisma.contentPage.update({
      where: { slug: 'home' },
      data: {
        blocks: JSON.stringify(HOMEPAGE_BLOCKS),
        title: 'Home',
        content: '',
        isActive: true,
      },
    });
    console.log('Updated existing homepage blocks.');
  } else {
    await prisma.contentPage.create({
      data: {
        title: 'Home',
        slug: 'home',
        content: '',
        blocks: JSON.stringify(HOMEPAGE_BLOCKS),
        isActive: true,
        sortOrder: 0,
        metaTitle: 'Purva Bites - Premium Roasted Makhana, Dry Fruits & Healthy Snacks',
        metaDescription:
          'Purva Bites is a premier manufacturer and dealer of high-quality roasted makhana, premium dry fruits, flavored khakhra, flavored bhakhri and healthy snacks.',
      },
    });
    console.log('Created homepage content page with default blocks.');
  }

  console.log('Done!');
}

seedHomepage()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
