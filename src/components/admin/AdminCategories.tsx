'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  FolderOpen,
  AlertTriangle,
  ChevronDown,
  SearchCode,
  Power,
  PowerOff,
  FileText,
  Download,
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { adminFetch } from '@/lib/admin-fetch';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  customSchema?: string | null;
  parentId?: string | null;
  ogImage?: string | null;
  blocks?: string | null;
  _count?: { Product: number };
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: string;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  customSchema: string;
  parentId: string;
  ogImage: string;
  blocks: string;
}

const emptyForm: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  image: '',
  sortOrder: '0',
  isActive: true,
  metaTitle: '',
  metaDescription: '',
  customSchema: '',
  parentId: '',
  ogImage: '',
  blocks: '[]',
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // CSV import/export state
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await adminFetch('/api/categories?all=true');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setSeoOpen(false);
    setFormOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || '',
      sortOrder: String(cat.sortOrder),
      isActive: cat.isActive,
      metaTitle: cat.metaTitle || '',
      metaDescription: cat.metaDescription || '',
      customSchema: cat.customSchema || '',
      parentId: cat.parentId || '',
      ogImage: cat.ogImage || '',
      blocks: cat.blocks || '[]',
    });
    setSeoOpen(!!(cat.metaTitle || cat.metaDescription));
    setFormOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generateSlug(name),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || generateSlug(form.name),
        description: form.description.trim() || null,
        image: form.image.trim() || null,
        sortOrder: parseInt(form.sortOrder) || 0,
        isActive: form.isActive,
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
        customSchema: form.customSchema.trim() || null,
        parentId: form.parentId || null,
        ogImage: form.ogImage.trim() || null,
        blocks: form.blocks || '[]',
      };

      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingCategory ? 'Category updated' : 'Category created');
        setFormOpen(false);
        fetchCategories();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save category');
      }
    } catch {
      toast.error('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === categories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categories.map(c => c.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return;
    if (action === 'delete') {
      setBulkAction(action);
      return;
    }
    setBulkLoading(true);
    try {
      const res = await adminFetch('/api/categories/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action }),
      });
      if (res.ok) {
        toast.success(`${action === 'activate' ? 'Activated' : 'Deactivated'} ${selectedIds.length} categor${selectedIds.length === 1 ? 'y' : 'ies'}`);
        setSelectedIds([]);
        fetchCategories();
      } else {
        toast.error('Bulk action failed');
      }
    } catch {
      toast.error('Bulk action failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      const res = await adminFetch('/api/categories/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action: 'delete' }),
      });
      if (res.ok) {
        toast.success(`Deleted ${selectedIds.length} categor${selectedIds.length === 1 ? 'y' : 'ies'}`);
        setSelectedIds([]);
        setBulkAction(null);
        fetchCategories();
      } else {
        toast.error('Bulk delete failed');
      }
    } catch {
      toast.error('Bulk delete failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDeleteClick = (cat: Category) => {
    setDeleteId(cat.id);
    setDeleteCategory(cat);
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminFetch('/api/categories/import', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Imported ${data.imported} category(ies)`);
        if (data.errors && data.errors.length > 0) {
          toast.warning(`${data.errors.length} error(s) during import`);
        }
        fetchCategories();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Import failed');
      }
    } catch {
      toast.error('Import failed');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleCSVExport = async () => {
    setExporting(true);
    try {
      const res = await adminFetch('/api/categories/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `categories-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Categories exported');
      } else {
        toast.error('Export failed');
      }
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await adminFetch(`/api/categories/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Category deleted');
        setCategories(prev => prev.filter(c => c.id !== deleteId));
        setDeleteId(null);
        setDeleteCategory(null);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete category');
      }
    } catch {
      toast.error('Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground mt-1">Organize your products into categories</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="cursor-pointer">
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} disabled={importing} />
            <Button variant="outline" size="sm" disabled={importing} asChild>
              <span>
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                {importing ? 'Importing...' : 'Import CSV'}
              </span>
            </Button>
          </label>
          <Button variant="outline" size="sm" disabled={exporting} onClick={handleCSVExport}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
          <span className="text-sm font-medium">
            {selectedIds.length} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              size="sm"
              variant="outline"
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              onClick={() => handleBulkAction('activate')}
              disabled={bulkLoading}
            >
              <Power className="mr-1.5 h-3.5 w-3.5" />
              Activate
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              onClick={() => handleBulkAction('deactivate')}
              disabled={bulkLoading}
            >
              <PowerOff className="mr-1.5 h-3.5 w-3.5" />
              Deactivate
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={() => handleBulkAction('delete')}
              disabled={bulkLoading}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No categories yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first category to organize products
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={categories.length > 0 && selectedIds.length === categories.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Slug</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden lg:table-cell">Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id} className={selectedIds.includes(cat.id) ? 'bg-muted/50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(cat.id)}
                        onCheckedChange={() => handleSelectOne(cat.id)}
                        aria-label={`Select ${cat.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="h-8 w-8 rounded-md object-cover bg-muted hidden sm:block"
                          />
                        ) : (
                          <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {cat.slug}
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate text-muted-foreground">
                      {cat.description || '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline">{cat._count?.Product || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          cat.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }
                      >
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(cat)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => handleDeleteClick(cat)}
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
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[calc(90vh-140px)] overflow-y-auto">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cat-name">
                  Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="cat-name"
                  placeholder="Category name"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-slug">Slug</Label>
                <Input
                  id="cat-slug"
                  placeholder="category-slug"
                  value={form.slug}
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, slug: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                placeholder="Category description"
                value={form.description}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, description: e.target.value }))
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-image">Image URL</Label>
              <Input
                id="cat-image"
                placeholder="https://example.com/image.jpg"
                value={form.image}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, image: e.target.value }))
                }
              />
              {form.image && (
                <img
                  src={form.image}
                  alt="Preview"
                  className="h-16 w-16 rounded-md object-cover bg-muted"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-ogimage">Open Graph Image URL</Label>
              <Input
                id="cat-ogimage"
                placeholder="https://example.com/og-image.jpg"
                value={form.ogImage}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, ogImage: e.target.value }))
                }
              />
              {form.ogImage && (
                <img
                  src={form.ogImage}
                  alt="OG Preview"
                  className="h-16 w-16 rounded-md object-cover bg-muted"
                />
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cat-sort">Sort Order</Label>
                <Input
                  id="cat-sort"
                  type="number"
                  placeholder="0"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, sortOrder: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-parent">Parent Category</Label>
                <Select
                  value={form.parentId}
                  onValueChange={(val) => setForm(prev => ({ ...prev, parentId: val }))}
                >
                  <SelectTrigger id="cat-parent">
                    <SelectValue placeholder="No Parent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Parent</SelectItem>
                    {categories
                      .filter(c => c.id !== editingCategory?.id)
                      .map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
                  <Label htmlFor="cat-meta-title">Meta Title</Label>
                  <Input
                    id="cat-meta-title"
                    placeholder="Category Name | Store Name"
                    value={form.metaTitle}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, metaTitle: e.target.value }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to use: Category Name | My Store
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-meta-desc" className="flex items-center justify-between">
                    <span>Meta Description</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {form.metaDescription.length}/160
                    </span>
                  </Label>
                  <Textarea
                    id="cat-meta-desc"
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
                  <Label htmlFor="cat-custom-schema">Custom JSON-LD Schema</Label>
                  <Textarea
                    id="cat-custom-schema"
                    placeholder='{"@context": "https://schema.org", "@type": "CollectionPage", ...}'
                    value={form.customSchema}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, customSchema: e.target.value }))
                    }
                    rows={3}
                    className="font-mono text-xs"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* CMS Blocks Section (Collapsible) */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CMS Blocks
                    {form.blocks !== '[]' && (
                      <span className="text-xs text-emerald-600 font-normal">(configured)</span>
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-3">
                <div className="space-y-2">
                  <Label htmlFor="cat-blocks">Blocks JSON</Label>
                  <Textarea
                    id="cat-blocks"
                    placeholder='[{"type": "richtext", "content": "<p>Hello</p>"}, {"type": "image", "src": "..."}]'
                    value={form.blocks}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, blocks: e.target.value }))
                    }
                    rows={6}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Define custom PageBlockRenderer blocks as a JSON array. See the PageBlockRenderer component for supported block types.
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving
                ? 'Saving...'
                : editingCategory
                  ? 'Update Category'
                  : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteCategory?.name}&rdquo;?
              This action cannot be undone.
              {deleteCategory && (deleteCategory._count?.Product || 0) > 0 && (
                <span className="block mt-2 font-medium text-rose-600">
                  Warning: This category has {deleteCategory._count?.Product} product(s)
                  associated with it.
                </span>
              )}
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

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkAction === 'delete'} onOpenChange={() => setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Bulk Delete Categories
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} selected categor{selectedIds.length === 1 ? 'y' : 'ies'}?
              This action cannot be undone. Products in these categories will have their category removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkLoading}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {bulkLoading ? 'Deleting...' : `Delete ${selectedIds.length} Categor${selectedIds.length === 1 ? 'y' : 'ies'}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
