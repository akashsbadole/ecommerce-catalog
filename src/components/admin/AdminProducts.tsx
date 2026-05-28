'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Upload,
  Star,
  RefreshCw,
  ImageIcon,
  ChevronDown,
  SearchCode,
  Package,
  EyeOff,
  Eye,
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
import { Checkbox } from '@/components/ui/checkbox';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  comparePrice: number | null;
  wholesalePrice: number | null;
  minOrderQty: number;
  sku: string | null;
  images: string;
  categoryId: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  specifications: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  whatsappNumber: string | null;
  category?: Category | null;
  createdAt: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: string;
  comparePrice: string;
  wholesalePrice: string;
  minOrderQty: string;
  sku: string;
  images: string;
  categoryId: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: string;
  specifications: string;
  metaTitle: string;
  metaDescription: string;
  whatsappNumber: string;
}

const emptyForm: ProductFormData = {
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  price: '',
  comparePrice: '',
  wholesalePrice: '',
  minOrderQty: '1',
  sku: '',
  images: '',
  categoryId: '',
  isFeatured: false,
  isActive: true,
  sortOrder: '0',
  specifications: '',
  metaTitle: '',
  metaDescription: '',
  whatsappNumber: '',
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseImages(images: string): string[] {
  if (!images || images.trim() === '' || images.trim() === '[]') return [];
  try {
    const parsed = JSON.parse(images);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fallback: split by comma
  }
  return images.split(',').map(s => s.trim()).filter(Boolean);
}

function getFirstImage(product: Product): string | null {
  const imgs = parseImages(product.images);
  return imgs.length > 0 ? imgs[0] : null;
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Collapsible sections
  const [seoOpen, setSeoOpen] = useState(false);
  const [b2bOpen, setB2bOpen] = useState(false);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams({ all: 'true' });
      if (searchTerm) params.set('search', searchTerm);
      if (categoryFilter && categoryFilter !== 'all') params.set('categoryId', categoryFilter);
      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories?all=true');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setSeoOpen(false);
    setB2bOpen(false);
    setFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    const imgs = parseImages(product.images);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: String(product.price),
      comparePrice: product.comparePrice ? String(product.comparePrice) : '',
      wholesalePrice: product.wholesalePrice ? String(product.wholesalePrice) : '',
      minOrderQty: String(product.minOrderQty || 1),
      sku: product.sku || '',
      images: imgs.join(', '),
      categoryId: product.categoryId || '',
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      sortOrder: String(product.sortOrder),
      specifications: product.specifications || '',
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      whatsappNumber: product.whatsappNumber || '',
    });
    setSeoOpen(!!(product.metaTitle || product.metaDescription));
    setB2bOpen(!!(product.wholesalePrice || product.minOrderQty > 1 || product.whatsappNumber));
    setFormOpen(true);
  };

  const handleNameChange = (name: string) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: editingProduct ? prev.slug : generateSlug(name),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!form.price || isNaN(Number(form.price))) {
      toast.error('Valid price is required');
      return;
    }

    setSaving(true);
    try {
      const imagesArray = form.images
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || generateSlug(form.name),
        description: form.description.trim() || null,
        shortDescription: form.shortDescription.trim() || null,
        price: form.price,
        comparePrice: form.comparePrice || null,
        wholesalePrice: form.wholesalePrice || null,
        minOrderQty: parseInt(form.minOrderQty) || 1,
        sku: form.sku.trim() || null,
        images: imagesArray,
        categoryId: form.categoryId || null,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        sortOrder: parseInt(form.sortOrder) || 0,
        specifications: form.specifications.trim() || null,
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
        whatsappNumber: form.whatsappNumber.trim() || null,
      };

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingProduct ? 'Product updated' : 'Product created');
        setFormOpen(false);
        fetchProducts();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save product');
      }
    } catch {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
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
      const res = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action }),
      });
      if (res.ok) {
        toast.success(`${action === 'publish' ? 'Published' : 'Unpublished'} ${selectedIds.length} product(s)`);
        setSelectedIds([]);
        fetchProducts();
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
      const res = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action: 'delete' }),
      });
      if (res.ok) {
        toast.success(`Deleted ${selectedIds.length} product(s)`);
        setSelectedIds([]);
        setBulkAction(null);
        fetchProducts();
      } else {
        toast.error('Bulk delete failed');
      }
    } catch {
      toast.error('Bulk delete failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product deleted');
        setProducts(prev => prev.filter(p => p.id !== deleteId));
        setDeleteId(null);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete product');
      }
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const currentImages = form.images
          ? form.images.split(',').map(s => s.trim()).filter(Boolean)
          : [];
        currentImages.push(data.url);
        setForm(prev => ({
          ...prev,
          images: currentImages.join(', '),
        }));
        toast.success('Image uploaded');
      } else {
        toast.error('Failed to upload image');
      }
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground mt-1">Manage your product catalogue</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => { setLoading(true); fetchProducts(); }}>
          <RefreshCw className="h-4 w-4" />
        </Button>
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
              onClick={() => handleBulkAction('publish')}
              disabled={bulkLoading}
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('unpublish')}
              disabled={bulkLoading}
            >
              <EyeOff className="mr-1.5 h-3.5 w-3.5" />
              Unpublish
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

      {/* Products Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No products found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm || categoryFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first product to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={products.length > 0 && selectedIds.length === products.length}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden xl:table-cell">Wholesale</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const firstImg = getFirstImage(product);
                  return (
                    <TableRow key={product.id} className={selectedIds.includes(product.id) ? 'bg-muted/50' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(product.id)}
                          onCheckedChange={() => handleSelectOne(product.id)}
                          aria-label={`Select ${product.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        {firstImg ? (
                          <img
                            src={firstImg}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover bg-muted"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {product.category?.name || 'Uncategorized'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">
                          {product.category?.name || 'Uncategorized'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formatPrice(product.price)}
                          </span>
                          {product.comparePrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(product.comparePrice)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {product.wholesalePrice ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-amber-700 dark:text-amber-400">
                              {formatPrice(product.wholesalePrice)}
                            </span>
                            {product.minOrderQty > 1 && (
                              <span className="text-xs text-muted-foreground">
                                MOQ: {product.minOrderQty}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            product.isActive
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                          }
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {product.isFeatured ? (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <Star className="mr-1 h-3 w-3" />
                            Featured
                          </Badge>
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
                            onClick={() => handleOpenEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => setDeleteId(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-140px)] pr-4">
            <div className="grid gap-4 py-4">
              {/* Name & Slug */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="prod-name">
                    Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="prod-name"
                    placeholder="Product name"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-slug">Slug</Label>
                  <Input
                    id="prod-slug"
                    placeholder="product-slug"
                    value={form.slug}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, slug: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="prod-desc">Description</Label>
                <Textarea
                  id="prod-desc"
                  placeholder="Full product description"
                  value={form.description}
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <Label htmlFor="prod-short-desc">Short Description</Label>
                <Textarea
                  id="prod-short-desc"
                  placeholder="Brief product summary"
                  value={form.shortDescription}
                  onChange={(e) =>
                    setForm(prev => ({
                      ...prev,
                      shortDescription: e.target.value,
                    }))
                  }
                  rows={2}
                />
              </div>

              {/* Price */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="prod-price">
                    Price <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="prod-price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, price: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-compare">Compare Price</Label>
                  <Input
                    id="prod-compare"
                    type="number"
                    step="0.01"
                    placeholder="0.00 (optional)"
                    value={form.comparePrice}
                    onChange={(e) =>
                      setForm(prev => ({
                        ...prev,
                        comparePrice: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* B2B Section (Collapsible) */}
              <Collapsible open={b2bOpen} onOpenChange={setB2bOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      B2B / Wholesale Settings
                      {(form.wholesalePrice || parseInt(form.minOrderQty) > 1) && (
                        <span className="text-xs text-emerald-600 font-normal">(configured)</span>
                      )}
                    </span>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-3">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="prod-whatsapp">WhatsApp Number</Label>
                      <Input
                        id="prod-whatsapp"
                        type="tel"
                        placeholder="+1234567890"
                        value={form.whatsappNumber}
                        onChange={(e) =>
                          setForm(prev => ({ ...prev, whatsappNumber: e.target.value }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        WhatsApp number for product inquiries
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prod-wholesale">Wholesale Price</Label>
                      <Input
                        id="prod-wholesale"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={form.wholesalePrice}
                        onChange={(e) =>
                          setForm(prev => ({ ...prev, wholesalePrice: e.target.value }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty to hide wholesale pricing
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prod-moq">Min Order Quantity</Label>
                      <Input
                        id="prod-moq"
                        type="number"
                        min="1"
                        placeholder="1"
                        value={form.minOrderQty}
                        onChange={(e) =>
                          setForm(prev => ({ ...prev, minOrderQty: e.target.value }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum units per order
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* SKU & Category */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="prod-sku">SKU</Label>
                  <Input
                    id="prod-sku"
                    placeholder="SKU-001"
                    value={form.sku}
                    onChange={(e) =>
                      setForm(prev => ({ ...prev, sku: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(val) =>
                      setForm(prev => ({ ...prev, categoryId: val }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label htmlFor="prod-images">Image URLs</Label>
                <Textarea
                  id="prod-images"
                  placeholder="Comma-separated image URLs"
                  value={form.images}
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, images: e.target.value }))
                  }
                  rows={2}
                />
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      asChild
                    >
                      <span>
                        <Upload className="mr-2 h-3.5 w-3.5" />
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </span>
                    </Button>
                  </label>
                  {form.images && (
                    <span className="text-xs text-muted-foreground">
                      {parseImages(form.images).length} image(s)
                    </span>
                  )}
                </div>
              </div>

              {/* Image Previews */}
              {form.images && parseImages(form.images).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {parseImages(form.images).map((url, i) => (
                    <div key={i} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${i + 1}`}
                        className="h-16 w-16 rounded-md object-cover bg-muted"
                      />
                      <button
                        type="button"
                        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white text-xs"
                        onClick={() => {
                          const imgs = parseImages(form.images).filter(
                            (_, idx) => idx !== i
                          );
                          setForm(prev => ({
                            ...prev,
                            images: imgs.join(', '),
                          }));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Sort Order */}
              <div className="space-y-2">
                <Label htmlFor="prod-sort">Sort Order</Label>
                <Input
                  id="prod-sort"
                  type="number"
                  placeholder="0"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm(prev => ({ ...prev, sortOrder: e.target.value }))
                  }
                />
              </div>

              {/* Switches */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isFeatured}
                    onCheckedChange={(checked) =>
                      setForm(prev => ({ ...prev, isFeatured: checked }))
                    }
                  />
                  <Label className="cursor-pointer" onClick={() =>
                    setForm(prev => ({ ...prev, isFeatured: !prev.isFeatured }))
                  }>
                    Featured
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) =>
                      setForm(prev => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label className="cursor-pointer" onClick={() =>
                    setForm(prev => ({ ...prev, isActive: !prev.isActive }))
                  }>
                    Active
                  </Label>
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-2">
                <Label htmlFor="prod-specs">Specifications (JSON)</Label>
                <Textarea
                  id="prod-specs"
                  placeholder='{"Color": "Red", "Size": "L", "Material": "Cotton"}'
                  value={form.specifications}
                  onChange={(e) =>
                    setForm(prev => ({
                      ...prev,
                      specifications: e.target.value,
                    }))
                  }
                  rows={3}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Enter valid JSON with key-value pairs for product specifications
                </p>
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
                    <Label htmlFor="prod-meta-title">Meta Title</Label>
                    <Input
                      id="prod-meta-title"
                      placeholder="Product Name | Store Name"
                      value={form.metaTitle}
                      onChange={(e) =>
                        setForm(prev => ({ ...prev, metaTitle: e.target.value }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to use: Product Name | StyleStore
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod-meta-desc" className="flex items-center justify-between">
                      <span>Meta Description</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {form.metaDescription.length}/160
                      </span>
                    </Label>
                    <Textarea
                      id="prod-meta-desc"
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
                </CollapsibleContent>
              </Collapsible>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkAction === 'delete'} onOpenChange={() => setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} Product(s)</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} selected product(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkLoading}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {bulkLoading ? 'Deleting...' : 'Delete All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
              Any enquiries associated with this product will have their product reference
              removed.
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
