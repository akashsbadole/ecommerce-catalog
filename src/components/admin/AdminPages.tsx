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
  Blocks,
  Save,
  ArrowLeft,
} from 'lucide-react';

const PageBuilder = dynamic(
  () => import('@/components/admin/PageBuilder').then(m => ({ default: m.PageBuilder })),
  { ssr: false, loading: () => <div className="min-h-[400px] rounded-md border border-input bg-muted/30 animate-pulse" /> }
);

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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { adminFetch } from '@/lib/admin-fetch';
import type { PageBlock } from '@/lib/page-blocks';

interface ContentPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  blocks: string;
  heroImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

interface PageFormData {
  title: string;
  slug: string;
  content: string;
  blocks: PageBlock[];
  heroImage: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  isActive: boolean;
  sortOrder: string;
}

const emptyForm: PageFormData = {
  title: '',
  slug: '',
  content: '',
  blocks: [],
  heroImage: '',
  metaTitle: '',
  metaDescription: '',
  ogImage: '',
  isActive: true,
  sortOrder: '0',
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminPages() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null);
  const [form, setForm] = useState<PageFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Builder mode
  const [builderMode, setBuilderMode] = useState(false);
  const [builderPageId, setBuilderPageId] = useState<string | null>(null);
  const [builderPageTitle, setBuilderPageTitle] = useState('');
  const [builderBlocks, setBuilderBlocks] = useState<PageBlock[]>([]);
  const [builderSaving, setBuilderSaving] = useState(false);

  const fetchPages = useCallback(async () => {
    try {
      const params = new URLSearchParams({ all: 'true' });
      if (searchTerm) params.set('search', searchTerm);
      const res = await adminFetch(`/api/content-pages?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPages(data.contentPages || []);
      }
    } catch {
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    setLoading(true);
    fetchPages();
  }, [fetchPages]);

  const handleOpenAdd = () => {
    setEditingPage(null);
    setForm(emptyForm);
    setSeoOpen(false);
    setFormOpen(true);
  };

  const handleOpenEdit = (page: ContentPage) => {
    setEditingPage(page);
    let parsedBlocks: PageBlock[] = [];
    try {
      let raw = page.blocks || '[]';
      if (typeof raw === 'string' && raw.startsWith('"') && raw.endsWith('"')) {
        try {
          raw = JSON.parse(raw);
        } catch { /* ignore */ }
      }
      parsedBlocks = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(parsedBlocks)) parsedBlocks = [];
    } catch {
      parsedBlocks = [];
    }
    setForm({
      title: page.title,
      slug: page.slug,
      content: page.content || '',
      blocks: parsedBlocks,
      heroImage: page.heroImage || '',
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      ogImage: page.ogImage || '',
      isActive: page.isActive,
      sortOrder: String(page.sortOrder),
    });
    setSeoOpen(!!(page.metaTitle || page.metaDescription));
    setFormOpen(true);
  };

  const handleOpenBuilder = (page: ContentPage) => {
    setBuilderPageId(page.id);
    setBuilderPageTitle(page.title);
    try {
      let raw = page.blocks || '[]';
      // Handle double-stringified JSON or weird escaping
      if (typeof raw === 'string' && raw.startsWith('"') && raw.endsWith('"')) {
        try {
          raw = JSON.parse(raw);
        } catch { /* ignore */ }
      }
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      setBuilderBlocks(Array.isArray(parsed) ? parsed : []);
  } catch (err) {
    console.error('Error parsing blocks in builder:', err);
      setBuilderBlocks([]);
    }
    setBuilderMode(true);
  };

  const handleExitBuilder = () => {
    setBuilderMode(false);
    setBuilderPageId(null);
    setBuilderBlocks([]);
  };

  const handleBuilderSave = async () => {
    if (!builderPageId) return;
    setBuilderSaving(true);
    try {
      const res = await adminFetch(`/api/content-pages/${builderPageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: builderBlocks }),
      });
      if (res.ok) {
        toast.success('Page blocks saved');
        fetchPages();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save blocks');
      }
    } catch {
      toast.error('Failed to save blocks');
    } finally {
      setBuilderSaving(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: editingPage ? prev.slug : generateSlug(title),
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Page title is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || generateSlug(form.title),
        content: form.content.trim() || '',
        blocks: form.blocks,
        heroImage: form.heroImage.trim() || null,
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
        ogImage: form.ogImage.trim() || null,
        isActive: form.isActive,
        sortOrder: parseInt(form.sortOrder) || 0,
      };

      const url = editingPage
        ? `/api/content-pages/${editingPage.id}`
        : '/api/content-pages';
      const method = editingPage ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingPage ? 'Page updated' : 'Page created');
        setFormOpen(false);
        fetchPages();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save page');
      }
    } catch {
      toast.error('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await adminFetch(`/api/content-pages/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Page deleted');
        setPages(prev => prev.filter(p => p.id !== deleteId));
        setDeleteId(null);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete page');
      }
    } catch {
      toast.error('Failed to delete page');
    } finally {
      setDeleting(false);
    }
  };

  // Builder mode view
  if (builderMode) {
    return (
      <div className="space-y-6">
        {/* Builder Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={handleExitBuilder}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Page Builder</h2>
              <p className="text-muted-foreground mt-1">
                Editing: <span className="font-medium text-foreground">{builderPageTitle}</span>
              </p>
            </div>
          </div>
          <Button onClick={handleBuilderSave} disabled={builderSaving}>
            <Save className="mr-2 h-4 w-4" />
            {builderSaving ? 'Saving...' : 'Save Blocks'}
          </Button>
        </div>

        {/* Builder Component */}
        <PageBuilder
          blocks={builderBlocks}
          onChange={setBuilderBlocks}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Content Pages</h2>
          <p className="text-muted-foreground mt-1">Manage pages like About, Terms, FAQ, etc.</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Page
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={() => { setLoading(true); fetchPages(); }}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Pages Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No pages found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm
                ? 'Try adjusting your search'
                : 'Create your first content page to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Slug</TableHead>
                  <TableHead className="hidden lg:table-cell">Sort</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{page.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      /{page.slug}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {page.sortOrder}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          page.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }
                      >
                        {page.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenBuilder(page)}
                          title="Open Page Builder"
                        >
                          <Blocks className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(page)}
                          title="Edit Page"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => setDeleteId(page.id)}
                          title="Delete Page"
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
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? 'Edit Page' : 'Add Page'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-140px)] pr-4">
            <div className="grid gap-4 py-4">
              {/* Title & Slug */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="page-title">
                    Title <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="page-title"
                    placeholder="Page title"
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="page-slug">Slug</Label>
                  <Input
                    id="page-slug"
                    placeholder="page-slug"
                    value={form.slug}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, slug: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Hero Image */}
              <div className="space-y-2">
                <Label htmlFor="page-hero">Hero Image URL</Label>
                <Input
                  id="page-hero"
                  placeholder="https://example.com/hero.jpg"
                  value={form.heroImage}
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, heroImage: e.target.value }))
                  }
                />
                {form.heroImage && (
                  <img
                    src={form.heroImage}
                    alt="Hero preview"
                    className="h-32 w-full rounded-md object-cover bg-muted"
                  />
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label>Content</Label>
                <WysiwygEditor
                  value={form.content}
                  onChange={(val) => setForm(prev => ({ ...prev, content: val }))}
                  placeholder="Write page content here..."
                />
              </div>

              {/* Sort Order */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="page-sort">Sort Order</Label>
                  <Input
                    id="page-sort"
                    type="number"
                    placeholder="0"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, sortOrder: e.target.value }))
                    }
                  />
                </div>
                <div className="flex items-center gap-2 pt-7">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) =>
                      setForm(prev => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label
                    className="cursor-pointer"
                    onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                  >
                    Active
                  </Label>
                </div>
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
                    <Label htmlFor="page-meta-title">Meta Title</Label>
                    <Input
                      id="page-meta-title"
                      placeholder="Page Title | Site Name"
                      value={form.metaTitle}
                      onChange={(e) =>
                        setForm(prev => ({ ...prev, metaTitle: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="page-meta-desc" className="flex items-center justify-between">
                      <span>Meta Description</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {form.metaDescription.length}/160
                      </span>
                    </Label>
                    <Textarea
                      id="page-meta-desc"
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
                    <Label htmlFor="page-og-image">OG Image URL</Label>
                    <Input
                      id="page-og-image"
                      placeholder="https://example.com/og-image.jpg"
                      value={form.ogImage}
                      onChange={(e) =>
                        setForm(prev => ({ ...prev, ogImage: e.target.value }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Image shown when this page is shared on social media (recommended 1200×630px)
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
              {saving ? 'Saving...' : editingPage ? 'Update Page' : 'Create Page'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this page? This action cannot be undone.
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
