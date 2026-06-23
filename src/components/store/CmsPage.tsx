'use client';

import { useState, useEffect } from 'react';
import { PageBlockRenderer } from './PageBlockRenderer';
import type { PageBlock } from '@/lib/page-blocks';
import { normalizePageBlocks } from '@/lib/page-blocks';
import { useSeo } from '@/lib/use-seo';
import { StoreLoading } from './StoreLoading';

interface PageData {
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
}

interface CmsPageProps {
  slug: string;
  onNavigate: (page: string, data?: unknown) => void;
  fallbackBlocks?: PageBlock[];
}

export function CmsPage({ slug, onNavigate, fallbackBlocks }: CmsPageProps) {
  const [blocks, setBlocks] = useState<PageBlock[] | null>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setBlocks(null);
    setPageData(null);

    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/content-pages?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          if (cancelled) return;
          const pages = data.contentPages || [];
          if (pages.length > 0) {
            const page = pages[0];
            setPageData({
              title: page.title || '',
              metaTitle: page.metaTitle || null,
              metaDescription: page.metaDescription || null,
              ogImage: page.ogImage || null,
            });
            let parsed: PageBlock[] = [];
            try {
              parsed = normalizePageBlocks(page.blocks);
            } catch (e) {
              console.error('Error parsing blocks:', e);
            }

            if (parsed.length > 0) {
              setBlocks(parsed);
              setLoading(false);
              return;
            } else if (page.content) {
              setBlocks([{ id: 'legacy-content', type: 'text', data: { content: page.content } }]);
              setLoading(false);
              return;
            }
          }
        }

      } catch {
        if (!cancelled && fallbackBlocks) {
          setBlocks(fallbackBlocks);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchPage();

    return () => {
      cancelled = true;
    };
  }, [slug, fallbackBlocks]);

  useSeo(`cms-${slug}`, {
    title: pageData?.metaTitle || pageData?.title,
    description: pageData?.metaDescription,
    ogImage: pageData?.ogImage,
  });

  if (loading) {
    return <StoreLoading />;
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
