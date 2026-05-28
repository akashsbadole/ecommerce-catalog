'use client';

import { useEffect, useState } from 'react';
import { Calendar, User, ArrowRight, ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  author?: { id: string; name: string; email: string } | null;
}

interface BlogPageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export function BlogPage({ onNavigate }: BlogPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params = new URLSearchParams({ published: 'true' });
        const res = await fetch(`/api/blog?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data.blogPosts || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Set SEO meta tags
  useEffect(() => {
    document.title = 'Blog';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Read our latest articles, news, and updates.');
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-80 mt-2" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Blog</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Read our latest articles, news, and updates.
        </p>
      </div>

      {/* Blog Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No blog posts published yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div key={post.id} onClick={() => onNavigate('blog-post', post.id)} className="group cursor-pointer">
              <Card className="overflow-hidden h-full transition-shadow hover:shadow-lg">
                {/* Cover Image */}
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <CardContent className="p-5 flex flex-col gap-3">
                  {/* Title */}
                  <h2 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-2">
                    {post.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    {post.author && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author.name}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
