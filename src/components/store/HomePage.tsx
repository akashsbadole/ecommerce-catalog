'use client';

import { useEffect, useState } from 'react';
import { PageBlockRenderer } from '@/components/store/PageBlockRenderer';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import type { PageBlock } from '@/lib/page-blocks';

interface HomePageProps {
  onNavigate: (page: string, data?: unknown) => void;
  settings?: Record<string, string> | null;
}

const DEFAULT_HOMEPAGE_BLOCKS: PageBlock[] = [
  {
    id: 'block-default-hero',
    type: 'hero',
    data: {
      title: 'India\'s trusted FMCG contract manufacturer',
      subtitle: 'Khakhra · Makhana · Bhakhri · Extruder products — manufactured at scale for brands, distributors & private labels',
      buttonText: 'Enquire for bulk / private label',
      buttonLink: '/contact',
      height: 'large',
      alignment: 'center',
    },
  },
  {
    id: 'block-default-trust',
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
    id: 'block-default-audience',
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
    id: 'block-default-capabilities',
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
    id: 'block-default-products',
    type: 'products',
    data: {
      title: 'Featured Products',
      maxProducts: 6,
    },
  },
  {
    id: 'block-default-categories',
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
    id: 'block-default-factory',
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
    id: 'block-default-certifications',
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
    id: 'block-default-lead-capture',
    type: 'lead-capture',
    data: {
      label: 'Looking for a manufacturing partner?',
      heading: 'Let\'s talk manufacturing',
      description: 'Tell us your requirement — we\'ll get back within 24 hours',
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
  {
    id: 'block-default-leadership',
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
    id: 'block-default-testimonials',
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
    id: 'block-default-sticky-cta',
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

export function HomePage({ onNavigate }: HomePageProps) {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const fetchHomePage = async () => {
      try {
        const res = await fetch('/api/content-pages?slug=home');
        if (res.ok) {
          const data = await res.json();
          const pages = data.contentPages || [];
          if (pages.length > 0) {
            const raw = pages[0].blocks || '[]';
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setBlocks(parsed);
              setUsingFallback(false);
              return;
            }
          }
        }
      } catch {
        // Fall back to default
      }
      setBlocks(DEFAULT_HOMEPAGE_BLOCKS);
      setUsingFallback(true);
      setLoading(false);
    };

    const init = async () => {
      setLoading(true);
      await fetchHomePage();
      setLoading(false);
    };

    init();
  }, []);

  // SEO
  useEffect(() => {
    document.title = 'Purva Bites - Premium Roasted Makhana, Dry Fruits & Healthy Snacks';
    let metaEl = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaEl) {
      metaEl = document.createElement('meta');
      metaEl.setAttribute('name', 'description');
      document.head.appendChild(metaEl);
    }
    metaEl.setAttribute('content', 'Purva Bites is a premier manufacturer and dealer of high-quality roasted makhana, premium dry fruits, flavored khakhra, flavored bhakhri and healthy snacks.');

    const websiteJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Purva Bites',
      url: typeof window !== 'undefined' ? window.location.origin : '',
      description: 'Premium FMCG Contract Manufacturer',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: typeof window !== 'undefined' ? `${window.location.origin}/catalogue?search={search_term_string}` : '',
        },
        'query-input': 'required name=search_term_string',
      },
    };

    const orgJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Purva Bites',
      description: 'FMCG Contract Manufacturer & Private Label Partner',
      url: typeof window !== 'undefined' ? window.location.origin : '',
      logo: typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        availableLanguage: ['English', 'Hindi'],
      },
    };

    const injectScript = (id: string, data: Record<string, unknown>) => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      script.id = id;
      document.head.appendChild(script);
    };

    injectScript('homepage-website-jsonld', websiteJsonLd);
    injectScript('homepage-org-jsonld', orgJsonLd);

    return () => {
      document.getElementById('homepage-website-jsonld')?.remove();
      document.getElementById('homepage-org-jsonld')?.remove();
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground/50 mx-auto" />
        <h2 className="mt-4 text-xl font-semibold">Unable to load homepage</h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <article className="w-full">
      {blocks.map((block) => (
        <PageBlockRenderer key={block.id} block={block} onNavigate={onNavigate} />
      ))}
    </article>
  );
}
