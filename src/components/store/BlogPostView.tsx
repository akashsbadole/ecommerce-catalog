'use client';

import { useEffect, useState } from 'react';
import { Calendar, User, ArrowLeft, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  tags: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  author?: { id: string; name: string; email: string } | null;
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

    // Set document title
    if (post.metaTitle) {
      document.title = post.metaTitle;
    } else {
      document.title = `${post.title} | Blog`;
    }

    // Set meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', post.metaDescription || post.excerpt || post.content.substring(0, 160));

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

    setOgTag('og:type', 'article');
    setOgTag('og:title', post.metaTitle || post.title);
    setOgTag('og:description', post.metaDescription || post.excerpt || '');
    if (post.ogImage) {
      setOgTag('og:image', post.ogImage);
    } else if (post.coverImage) {
      setOgTag('og:image', post.coverImage);
    }

    // Set article:published_time
    if (post.publishedAt) {
      setOgTag('article:published_time', new Date(post.publishedAt).toISOString());
    }
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
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
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

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
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
            className="w-full rounded-lg"
          />
        </div>
      )}

      {/* Title */}
      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          {post.title}
        </h1>

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
          {post.publishedAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
          {post.author && (
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author.name}
            </span>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* Excerpt */}
      {post.excerpt && (
        <p className="text-lg text-muted-foreground font-medium leading-relaxed mb-8 border-l-4 border-primary/20 pl-4">
          {post.excerpt}
        </p>
      )}

      {/* Content */}
      <div
        className="prose prose-neutral dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:tracking-tight
          prose-p:text-foreground/80 prose-a:text-primary
          prose-img:rounded-lg prose-blockquote:border-primary/20
          [&>p]:mb-4 [&>h2]:mt-8 [&>h3]:mt-6"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
