'use client';

import { useEffect, useState, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { PageBlockRenderer } from '@/components/store/PageBlockRenderer';
import type { PageBlock } from '@/lib/page-blocks';
import { normalizePageBlocks } from '@/lib/page-blocks';

interface ContentPageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  blocks: string;
  heroImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
}

interface ContentPageViewProps {
  slug: string;
  onNavigate?: (page: string, data?: unknown) => void;
}

export function ContentPageView({ slug, onNavigate }: ContentPageViewProps) {
  const [page, setPage] = useState<ContentPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/content-pages?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const pages = data.contentPages || [];
          if (pages.length > 0) {
            setPage(pages[0]);
          } else {
            setError('Page not found');
          }
        } else {
          setError('Failed to load page');
        }
      } catch {
        setError('Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  // Set SEO meta tags
  useEffect(() => {
    if (!page) return;

    // Set document title
    if (page.metaTitle) {
      document.title = page.metaTitle;
    } else {
      document.title = page.title;
    }

    // Set meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', page.metaDescription || page.content.substring(0, 160) || '');

    // Set OG tags
    const setOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setOgTag('og:title', page.metaTitle || page.title);
    setOgTag('og:description', page.metaDescription || page.content.substring(0, 200) || '');
    if (page.ogImage) {
      setOgTag('og:image', page.ogImage);
    }
    if (page.heroImage && !page.ogImage) {
      setOgTag('og:image', page.heroImage);
    }

    return () => {
      // Cleanup is optional since the next page will overwrite these
    };
  }, [page]);

  // Parse blocks
  const parsedBlocks: PageBlock[] = page ? normalizePageBlocks(page.blocks || '[]') : [];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {page?.heroImage && (
          <Skeleton className="h-64 w-full rounded-lg" />
        )}
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="space-y-4 mt-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground/50 mx-auto" />
        <h2 className="mt-4 text-xl font-semibold">Page Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
      </div>
    );
  }

  // Render blocks if available
  if (parsedBlocks.length > 0) {
    return (
      <article className="w-full">
        {parsedBlocks.map((block) => (
          <PageBlockRenderer key={block.id} block={block} onNavigate={onNavigate} />
        ))}
      </article>
    );
  }

  // Sanitize HTML content to prevent XSS
  const sanitizedContent = useMemo(() => {
    if (!page) return '';
    return DOMPurify.sanitize(page.content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div', 'span', 'pre', 'code', 'figure', 'figcaption', 'sup', 'sub'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'style', 'target', 'rel', 'colspan', 'rowspan'],
    });
  }, [page?.content]);

  // Fallback to HTML content
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      {page.heroImage && (
        <div className="mb-8">
          <img
            src={page.heroImage}
            alt={page.title}
            className="w-full h-64 sm:h-80 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Title */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{page.title}</h1>
      </header>

      {/* Content */}
      <div
        className="prose prose-neutral dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:tracking-tight
          prose-p:text-foreground/80 prose-a:text-primary
          prose-img:rounded-lg"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </article>
  );
}
