'use client';

import { useState, useEffect, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageBlockRenderer } from './PageBlockRenderer';
import { RecentlyViewedProducts } from './RecentlyViewedProducts';
import type { PageBlock } from '@/lib/page-blocks';

interface HomePageProps {
  onNavigate: (page: string, data?: unknown) => void;
  settings?: Record<string, string> | null;
}

export function HomePage({ onNavigate, settings }: HomePageProps) {
  const [blocks, setBlocks] = useState<PageBlock[] | null>(null);
  const [cmsLoading, setCmsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch CMS homepage content
  useEffect(() => {
    const fetchHomepage = async () => {
      try {
        const res = await fetch('/api/content-pages?slug=homepage');
        if (res.ok) {
          const data = await res.json();
          const pages = data.contentPages || [];
          if (pages.length > 0) {
            const page = pages[0];
            // Homepage exists in DB — use its blocks (even if empty)
            if (page.blocks) {
              let raw = page.blocks;
              if (typeof raw === 'string' && raw.startsWith('"') && raw.endsWith('"')) {
                raw = JSON.parse(raw);
              }
              const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
              if (Array.isArray(parsed) && parsed.length > 0) {
                setBlocks(parsed);
                return;
              }
            }
            // Homepage exists but has no blocks yet — show empty state
            setCmsLoading(false);
            return;
          }
        }
        // No homepage found — create with default blocks
        const seedRes = await fetch('/api/content-pages/seed', { method: 'POST' });
        if (seedRes.ok) {
          const seedData = await seedRes.json();
          if (seedData.contentPage?.blocks) {
            let raw = seedData.contentPage.blocks;
            if (typeof raw === 'string' && raw.startsWith('"') && raw.endsWith('"')) {
              try { raw = JSON.parse(raw); } catch { /* ignore */ }
            }
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (Array.isArray(parsed) && parsed.length > 0) {
              setBlocks(parsed);
            }
          }
        }
      } catch {
        // Fall back to empty state
      } finally {
        setCmsLoading(false);
      }
    };
    fetchHomepage();
  }, []);

  // SEO
  useEffect(() => {
    const siteName = settings?.site_name || 'My Store';
    document.title = `${siteName} - Premium Products & B2B Wholesale Supplier`;
    let metaEl = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaEl) {
      metaEl = document.createElement('meta');
      metaEl.setAttribute('name', 'description');
      document.head.appendChild(metaEl);
    }
    metaEl.setAttribute('content', `${siteName} is a premier manufacturer and dealer of high-quality products, premium dry fruits, and healthy snacks.`);

    const websiteJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: typeof window !== 'undefined' ? window.location.origin : '',
      description: 'Premium Products & B2B Wholesale Supplier',
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
      name: siteName,
      description: 'Premium Products & B2B Wholesale Supplier',
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
      const el1 = document.getElementById('homepage-website-jsonld');
      const el2 = document.getElementById('homepage-org-jsonld');
      if (el1) el1.remove();
      if (el2) el2.remove();
    };
  }, []);

  // Loading state
  if (cmsLoading) {
    return (
      <div className="flex flex-col gap-8">
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  // Error state
  if (error || !blocks || blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">Unable to load homepage content.</p>
        <p className="mt-2 text-sm text-muted-foreground/70">
          Please ensure the homepage content page exists in the admin panel.
        </p>
      </div>
    );
  }

  // Render CMS blocks
  return (
    <div className="flex flex-col">
      <PageBlockRenderer blocks={blocks} onNavigate={onNavigate} />
      <div className="container mx-auto px-4 py-12">
        <RecentlyViewedProducts onNavigate={onNavigate} />
      </div>
    </div>
  );
}
