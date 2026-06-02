'use client';

import { useEffect, useState, useMemo } from 'react';
import { Calendar, User, ImageIcon, Search, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  tags: string | null;
  User?: { id: string; name: string; email: string } | null;
}

interface BlogPageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

function parseTags(tagsStr: string | null): string[] {
  if (!tagsStr) return [];
  try {
    const parsed = JSON.parse(tagsStr);
    if (Array.isArray(parsed)) return parsed.filter((t: unknown) => typeof t === 'string');
  } catch {
    // If it's not valid JSON, try splitting by comma as a fallback
    return tagsStr.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

export function BlogPage({ onNavigate }: BlogPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params = new URLSearchParams({ published: 'true' });
        const res = await fetch(`/api/blog?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          const fetchedPosts = data.blogPosts || [];
          setPosts(fetchedPosts);

          // Extract all unique tags
          const tagSet = new Set<string>();
          fetchedPosts.forEach((post: BlogPost) => {
            parseTags(post.tags).forEach((tag) => tagSet.add(tag));
          });
          setAllTags(Array.from(tagSet).sort());
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    let result = posts;

    // Filter by selected tag
    if (selectedTag) {
      result = result.filter((post) => {
        const postTags = parseTags(post.tags);
        return postTags.includes(selectedTag);
      });
    }

    // Filter by search query (title)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((post) =>
        post.title.toLowerCase().includes(query)
      );
    }

    return result;
  }, [posts, selectedTag, searchQuery]);

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

  // Count posts per tag
  const getTagCount = (tag: string) => {
    return posts.filter((post) => parseTags(post.tags).includes(tag)).length;
  };

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
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Blog</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Read our latest articles, news, and updates.
        </p>
      </div>

      {/* Search Input */}
      {posts.length > 0 && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Search blog posts by title"
            />
          </div>
        </div>
      )}

      {/* Tag Filter Bar */}
      {allTags.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-muted-foreground mr-1" />
            <Badge
              variant={selectedTag === null ? 'default' : 'outline'}
              className={`cursor-pointer select-none transition-colors ${
                selectedTag === null
                  ? 'bg-primary hover:bg-primary/80 text-white'
                  : 'hover:bg-primary/5 hover:text-primary/80 hover:border-primary/30'
              }`}
              onClick={() => setSelectedTag(null)}
            >
              All ({posts.length})
            </Badge>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                className={`cursor-pointer select-none transition-colors ${
                  selectedTag === tag
                    ? 'bg-primary hover:bg-primary/80 text-white'
                    : 'hover:bg-primary/5 hover:text-primary/80 hover:border-primary/30'
                }`}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag} ({getTagCount(tag)})
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Blog Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          {searchQuery || selectedTag ? (
            <>
              <p className="text-muted-foreground">
                No blog posts found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag(null);
                }}
                className="text-primary hover:text-primary/80 text-sm mt-2 underline"
              >
                Clear filters
              </button>
            </>
          ) : (
            <p className="text-muted-foreground">No blog posts published yet. Check back soon!</p>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
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
                  {/* Tags */}
                  {post.tags && (
                    <div className="flex flex-wrap gap-1.5">
                      {parseTags(post.tags).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

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
                    {post.User && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.User.name}
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
