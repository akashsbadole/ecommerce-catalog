'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageBlockRenderer } from './PageBlockRenderer';
import type { PageBlock } from '@/lib/page-blocks';

interface CmsPageProps {
  slug: string;
  onNavigate: (page: string, data?: unknown) => void;
  fallbackBlocks?: PageBlock[];
}

export function CmsPage({ slug, onNavigate, fallbackBlocks }: CmsPageProps) {
  const [blocks, setBlocks] = useState<PageBlock[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/content-pages?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const pages = data.contentPages || [];
          if (pages.length > 0) {
            const page = pages[0];
            let parsed: PageBlock[] = [];
            try {
              if (page.blocks) {
                let raw = page.blocks;
                if (typeof raw === 'string' && raw.startsWith('"') && raw.endsWith('"')) {
                  raw = JSON.parse(raw);
                }
                parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
              }
            } catch (e) {
              console.error('Error parsing blocks:', e);
            }

            if (Array.isArray(parsed) && parsed.length > 0) {
              setBlocks(parsed);
              setLoading(false);
              return;
            } else if (page.content) {
              // Handle legacy content-only pages
              setBlocks([{ id: 'legacy-content', type: 'text', data: { content: page.content } }]);
              setLoading(false);
              return;
            }
            // If page exists but has no blocks/content, we still want to stop loading
            // unless we really want to seed it.
          }
        }
        // Page not found — try to seed it
        const seedRes = await fetch('/api/content-pages/seed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        });
        if (seedRes.ok) {
          const seedData = await seedRes.json();
          const created = seedData.results?.find((r: { slug: string; status: string }) => r.slug === slug && r.status === 'created');
          if (created) {
            // Re-fetch the created page
            const refetch = await fetch(`/api/content-pages?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
            if (refetch.ok) {
              const refetchData = await refetch.json();
              const pages = refetchData.contentPages || [];
              if (pages.length > 0 && pages[0].blocks) {
                let parsed = pages[0].blocks;
                if (typeof parsed === 'string' && parsed.startsWith('"') && parsed.endsWith('"')) {
                  try { parsed = JSON.parse(parsed); } catch { /* ignore */ }
                }
                setBlocks(typeof parsed === 'string' ? JSON.parse(parsed) : parsed);
              }
            }
          }
        }
      } catch {
        // Use fallback blocks if provided
        if (fallbackBlocks) {
          setBlocks(fallbackBlocks);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug, fallbackBlocks]);

  // Set SEO meta tags
  useEffect(() => {
    if (!blocks) return;
    const titleEl = document.querySelector('meta[property="og:title"]');
    if (titleEl) {
      const title = titleEl.getAttribute('content') || '';
      document.title = title || document.title;
    }
  }, [blocks]);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!blocks || blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">This page has no content yet.</p>
        <p className="mt-2 text-sm text-muted-foreground/70">
          Add blocks in the admin panel to customize this page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <PageBlockRenderer blocks={blocks} onNavigate={onNavigate} />
    </div>
  );
}
