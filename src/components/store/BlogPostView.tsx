'use client';

import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { PageBlockRenderer } from './PageBlockRenderer';
import { normalizePageBlocks } from '@/lib/page-blocks';
import { generateArticleSchema } from '@/lib/seo/schema-generator';

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  blocks: string;
  coverImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  tags: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  User?: { id: string; name: string; email: string } | null;
}

interface BlogPostViewProps {
  postId: string;
  onNavigate: (page: string, data?: unknown) => void;
}

export function BlogPostView({ postId, onNavigate }: BlogPostViewProps) {
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/blog/${postId}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data.blogPost);
        } else if (res.status === 404) {
          setError('Post not found');
        } else {
          setError('Failed to load post');
        }
      } catch {
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // Set SEO meta tags
  useEffect(() => {
    if (!post) return;

    if (post.metaTitle) {
      document.title = post.metaTitle;
    } else {
      document.title = `${post.title} | Blog`;
    }

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', post.metaDescription || post.excerpt || post.content.substring(0, 160));

    const setOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setOgTag('og:type', 'article');
    setOgTag('og:title', post.metaTitle || post.title);
    setOgTag('og:description', post.metaDescription || post.excerpt || '');
    if (post.ogImage) {
      setOgTag('og:image', post.ogImage);
    } else if (post.coverImage) {
      setOgTag('og:image', post.coverImage);
    }

    if (post.publishedAt) {
      setOgTag('article:published_time', new Date(post.publishedAt).toISOString());
    }

    // JSON-LD
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const brandName = process.env.NEXT_PUBLIC_SITE_NAME || 'My Store';
    const jsonLd = generateArticleSchema(post, siteUrl, brandName);
    const scriptId = 'blog-jsonld';
    const existingScript = document.getElementById(scriptId);
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = scriptId;
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [post]);

  function parseTags(tags: string | null): string[] {
    if (!tags) return [];
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback
    }
    return [];
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-4 mt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Post not found or no longer available.</p>
        <Button variant="outline" className="mt-4" onClick={() => onNavigate('blog')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
      </div>
    );
  }

  const tags = parseTags(post.tags);
  const blocks = normalizePageBlocks(post.blocks || '[]');

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Link */}
      <button
        onClick={() => onNavigate('blog')}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </button>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="mb-8">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-[400px] object-cover rounded-xl shadow-lg"
          />
        </div>
      )}

      {/* Header Info */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
          {post.title}
        </h1>

        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
          {post.publishedAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
          {post.User && (
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" />
              {post.User.name}
            </span>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="bg-primary/5 text-primary/80 border-primary/20">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* Excerpt */}
      {post.excerpt && (
        <div className="max-w-2xl mx-auto mb-12">
          <p className="text-xl text-muted-foreground font-medium italic leading-relaxed text-center border-y py-6 border-primary/10">
            &ldquo;{post.excerpt}&rdquo;
          </p>
        </div>
      )}

      {/* Blocks Rendering */}
      {blocks.length > 0 ? (
        <div className="space-y-0">
          <PageBlockRenderer blocks={blocks} onNavigate={onNavigate} />
        </div>
      ) : post.content ? (
        /* Legacy Content Fallback */
        <div
          className="prose prose-neutral dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-p:text-foreground/80 prose-a:text-primary
            prose-img:rounded-lg prose-blockquote:border-primary/20
            [&>p]:mb-4 [&>h2]:mt-8 [&>h3]:mt-6"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div', 'span', 'pre', 'code', 'figure', 'figcaption', 'sup', 'sub'],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'style', 'target', 'rel', 'colspan', 'rowspan'],
          }) }}
        />
      ) : null}
    </article>
  );
}
