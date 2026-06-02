import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createBlock } from '@/lib/page-blocks';

const PAGE_BLOCKS: Record<string, { title: string; metaTitle?: string; metaDescription?: string; blocks: ReturnType<typeof createBlock>[] }> = {
  homepage: {
    title: 'Homepage',
    metaTitle: 'Purva Bites - Premium Roasted Makhana, Dry Fruits & Healthy Snacks',
    metaDescription: 'Purva Bites is a premier manufacturer and dealer of high-quality roasted makhana, premium dry fruits, flavored khakhra, flavored bhakhri and healthy snacks.',
    blocks: [
      createBlock('hero'),
      createBlock('trust-bar'),
      createBlock('audience-cards'),
      createBlock('capabilities'),
      createBlock('product-categories'),
      createBlock('factory-reel'),
      createBlock('certifications'),
      createBlock('lead-capture'),
      createBlock('leadership'),
      createBlock('partner-logos'),
      createBlock('sticky-cta'),
    ],
  },
  'about-us': {
    title: 'About Us',
    metaTitle: 'About Us - Purva Bites',
    metaDescription: 'Learn about Purva Bites - our story, leadership, and commitment to quality manufacturing.',
    blocks: [
      createBlock('hero'),
      createBlock('about'),
      createBlock('trust-bar'),
      createBlock('leadership'),
      createBlock('capabilities'),
      createBlock('certifications'),
      createBlock('partner-logos'),
      createBlock('cta'),
      createBlock('sticky-cta'),
    ],
  },
  manufacturing: {
    title: 'Manufacturing',
    metaTitle: 'Manufacturing - Purva Bites',
    metaDescription: 'Discover our state-of-the-art manufacturing facility, production lines, and quality processes.',
    blocks: [
      createBlock('hero'),
      createBlock('capabilities'),
      createBlock('factory-reel'),
      createBlock('certifications'),
      createBlock('trust-bar'),
      createBlock('product-categories'),
      createBlock('cta'),
      createBlock('sticky-cta'),
    ],
  },
  contact: {
    title: 'Contact Us',
    metaTitle: 'Contact Us - Purva Bites',
    metaDescription: 'Get in touch with Purva Bites for bulk orders, private label, distribution, and enquiries.',
    blocks: [
      createBlock('hero'),
      createBlock('lead-capture'),
      createBlock('features'),
      createBlock('trust-bar'),
      createBlock('faq'),
      createBlock('sticky-cta'),
    ],
  },
  products: {
    title: 'Products',
    metaTitle: 'Products - Purva Bites',
    metaDescription: 'Explore our range of premium roasted makhana, dry fruits, khakhra, bhakhri, and extruder products.',
    blocks: [
      createBlock('hero'),
      createBlock('product-categories'),
      createBlock('trust-bar'),
      createBlock('cta'),
    ],
  },
  catalogue: {
    title: 'Catalogue',
    metaTitle: 'Product Catalogue - Purva Bites',
    metaDescription: 'Browse our complete product catalogue with pricing, bulk orders, and wholesale options.',
    blocks: [
      createBlock('hero'),
      createBlock('product-categories'),
      createBlock('trust-bar'),
      createBlock('sticky-cta'),
    ],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const slug = body.slug as string | undefined;

    // Seed specific page or all pages
    const slugsToSeed = slug ? [slug] : Object.keys(PAGE_BLOCKS);
    const results: Array<{ slug: string; status: string }> = [];

    for (const pageSlug of slugsToSeed) {
      const config = PAGE_BLOCKS[pageSlug];
      if (!config) {
        results.push({ slug: pageSlug, status: 'unknown page type' });
        continue;
      }

      const existing = await db.contentPage.findUnique({ where: { slug: pageSlug } });

      if (existing) {
        results.push({ slug: pageSlug, status: 'already exists' });
        continue;
      }

      await db.contentPage.create({
        data: {
          title: config.title,
          slug: pageSlug,
          content: '',
          blocks: JSON.stringify(config.blocks),
          isActive: true,
          sortOrder: 0,
          metaTitle: config.metaTitle || null,
          metaDescription: config.metaDescription || null,
        },
      });

      results.push({ slug: pageSlug, status: 'created' });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Seed pages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
