'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  FileText,
  ChevronDown,
  SearchCode,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';

const WysiwygEditor = dynamic(
  () => import('@/components/admin/WysiwygEditor'),
  { ssr: false, loading: () => <div className="min-h-[300px] rounded-md border border-input bg-muted/30 animate-pulse" /> }
);
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { adminFetch } from '@/lib/admin-fetch';

interface Author {
  id: string;
  name: string;
  email: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  authorId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  tags: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  author?: Author | null;
}

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  tags: string;
  isPublished: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const emptyForm: BlogFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  authorId: '',
  metaTitle: '',
  metaDescription: '',
  ogImage: '',
  tags: '',
  isPublished: false,
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

export function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 1 });

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<BlogFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk action state
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchPosts = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ all: 'true', page: String(page), limit: '12' });
      if (searchTerm) params.set('search', searchTerm);
      const res = await adminFetch(`/api/blog?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.blogPosts || []);
        setPagination(data.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
      }
    } catch {
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const fetchAuthors = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        // Collect all users — we only have the current user from this endpoint
        if (data.user) {
          setAuthors([{ id: data.user.id, name: data.user.name, email: data.user.email }]);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const handleSearch = () => {
    setSelectedIds([]);
    fetchPosts(1);
  };

  const handlePageChange = (newPage: number) => {
    setSelectedIds([]);
    fetchPosts(newPage);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === posts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(posts.map(p => p.id));
    }
  };

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      const res = await adminFetch('/api/blog/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        setSelectedIds([]);
        fetchPosts(pagination.page);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Bulk action failed');
      }
    } catch {
      toast.error('Bulk action failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingPost(null);
    setForm(emptyForm);
    setSeoOpen(false);
    setFormOpen(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    const tags = parseTags(post.tags);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      coverImage: post.coverImage || '',
      authorId: post.authorId || '',
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      ogImage: post.ogImage || '',
      tags: tags.join(', '),
      isPublished: post.isPublished,
    });
    setSeoOpen(!!(post.metaTitle || post.metaDescription));
    setFormOpen(true);
  };

  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: editingPost ? prev.slug : generateSlug(title),
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Post title is required');
      return;
    }

    setSaving(true);
    try {
      const tags = form.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || generateSlug(form.title),
        excerpt: form.excerpt.trim() || null,
        content: form.content.trim() || '',
        coverImage: form.coverImage.trim() || null,
        authorId: form.authorId || null,
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
        ogImage: form.ogImage.trim() || null,
        tags: tags.length > 0 ? tags : null,
        isPublished: form.isPublished,
      };

      const url = editingPost
        ? `/api/blog/${editingPost.id}`
        : '/api/blog';
      const method = editingPost ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingPost ? 'Post updated' : 'Post created');
        setFormOpen(false);
        fetchPosts(pagination.page);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save post');
      }
    } catch {
      toast.error('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await adminFetch(`/api/blog/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Post deleted');
        setPosts(prev => prev.filter(p => p.id !== deleteId));
        setDeleteId(null);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete post');
      }
    } catch {
      toast.error('Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Blog Posts</h2>
          <p className="text-muted-foreground mt-1">Manage your blog posts and articles</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Post
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={() => { setLoading(true); fetchPosts(pagination.page); }}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <Card className="p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-sm font-medium">
            {selectedIds.length} post(s) selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={bulkLoading}
              onClick={() => handleBulkAction('publish')}
            >
              <Eye className="mr-1 h-3.5 w-3.5" />
              Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkLoading}
              onClick={() => handleBulkAction('unpublish')}
            >
              <EyeOff className="mr-1 h-3.5 w-3.5" />
              Unpublish
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkLoading}
              className="text-rose-600 hover:text-rose-700"
              onClick={() => handleBulkAction('delete')}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </Card>
      )}

      {/* Posts Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No posts found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm
                ? 'Try adjusting your search'
                : 'Create your first blog post to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.length === posts.length && posts.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Published</TableHead>
                  <TableHead className="hidden lg:table-cell">Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(post.id)}
                        onCheckedChange={() => toggleSelect(post.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{post.title}</p>
                        <p className="text-xs text-muted-foreground">
                          /{post.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {post.author?.name || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          post.isPublished
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }
                      >
                        {post.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {parseTags(post.tags).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {parseTags(post.tags).slice(0, 2).map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {parseTags(post.tags).length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{parseTags(post.tags).length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(post)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => setDeleteId(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? 'Edit Post' : 'Add Post'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-140px)] pr-4">
            <div className="grid gap-4 py-4">
              {/* Title & Slug */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="post-title">
                    Title <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="post-title"
                    placeholder="Post title"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="post-slug">Slug</Label>
                  <Input
                    id="post-slug"
                    placeholder="post-slug"
                    value={form.slug}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, slug: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="post-excerpt">Excerpt</Label>
                <Textarea
                  id="post-excerpt"
                  placeholder="Brief summary of the post..."
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, excerpt: e.target.value }))
                  }
                  rows={2}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label>Content</Label>
                <WysiwygEditor
                  value={form.content}
                  onChange={(val) => setForm(prev => ({ ...prev, content: val }))}
                  placeholder="Write blog post content here..."
                  minHeight="400px"
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label htmlFor="post-cover">Cover Image URL</Label>
                <Input
                  id="post-cover"
                  placeholder="https://example.com/cover.jpg"
                  value={form.coverImage}
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, coverImage: e.target.value }))
                  }
                />
                {form.coverImage && (
                  <img
                    src={form.coverImage}
                    alt="Cover preview"
                    className="h-32 w-full rounded-md object-cover bg-muted"
                  />
                )}
              </div>

              {/* Tags & Author */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="post-tags">Tags</Label>
                  <Input
                    id="post-tags"
                    placeholder="tag1, tag2, tag3"
                    value={form.tags}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, tags: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated tags</p>
                </div>
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Select
                    value={form.authorId}
                    onValueChange={(val) =>
                      setForm(prev => ({ ...prev, authorId: val }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select author" />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.map((author) => (
                        <SelectItem key={author.id} value={author.id}>
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isPublished}
                  onCheckedChange={(checked) =>
                    setForm(prev => ({ ...prev, isPublished: checked }))
                  }
                />
                <Label
                  className="cursor-pointer"
                  onClick={() => setForm(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                >
                  Published
                </Label>
                {editingPost?.publishedAt && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (Published on {new Date(editingPost.publishedAt).toLocaleDateString()})
                  </span>
                )}
              </div>

              <Separator />

              {/* SEO Section (Collapsible) */}
              <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <SearchCode className="h-4 w-4" />
                      SEO Settings
                      {(form.metaTitle || form.metaDescription) && (
                        <span className="text-xs text-emerald-600 font-normal">(configured)</span>
                      )}
                    </span>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-3">
                  <div className="space-y-2">
                    <Label htmlFor="post-meta-title">Meta Title</Label>
                    <Input
                      id="post-meta-title"
                      placeholder="Post Title | Site Name"
                      value={form.metaTitle}
                      onChange={(e) =>
                        setForm(prev => ({ ...prev, metaTitle: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="post-meta-desc" className="flex items-center justify-between">
                      <span>Meta Description</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {form.metaDescription.length}/160
                      </span>
                    </Label>
                    <Textarea
                      id="post-meta-desc"
                      placeholder="A brief description for search engines..."
                      value={form.metaDescription}
                      onChange={(e) => {
                        if (e.target.value.length <= 160) {
                          setForm(prev => ({ ...prev, metaDescription: e.target.value }));
                        }
                      }}
                      rows={3}
                      className={form.metaDescription.length >= 150 ? 'border-amber-400' : ''}
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: 150-160 characters for optimal SEO
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="post-og-image">OG Image URL</Label>
                    <Input
                      id="post-og-image"
                      placeholder="https://example.com/og-image.jpg"
                      value={form.ogImage}
                      onChange={(e) =>
                        setForm(prev => ({ ...prev, ogImage: e.target.value }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Image shown when this post is shared on social media (recommended 1200×630px)
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
