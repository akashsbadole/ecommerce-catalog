'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Package,
  X,
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
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { adminFetch } from '@/lib/admin-fetch';

interface BundleProduct {
  productId: string;
  quantity: number;
  Product: {
    id: string;
    name: string;
    sku: string | null;
    price: number;
    images: string;
  };
}

interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  discount: number;
  isActive: boolean;
  createdAt: string;
  BundleProduct: BundleProduct[];
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  images: string;
}

interface BundleFormData {
  name: string;
  slug: string;
  description: string;
  discount: string;
  isActive: boolean;
}

interface BundleProductItem {
  productId: string;
  quantity: number;
  Product: Product;
}

const emptyForm: BundleFormData = {
  name: '',
  slug: '',
  description: '',
  discount: '',
  isActive: true,
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

export function AdminBundles() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [form, setForm] = useState<BundleFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [bundleProducts, setBundleProducts] = useState<BundleProductItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState<Product[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBundles = useCallback(async () => {
    try {
      const res = await adminFetch('/api/bundles');
      if (res.ok) {
        const data = await res.json();
        setBundles(data.bundles || []);
      }
    } catch {
      toast.error('Failed to load bundles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  const filteredBundles = bundles.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingBundle(null);
    setForm(emptyForm);
    setBundleProducts([]);
    setFormOpen(true);
  };

  const handleOpenEdit = (bundle: Bundle) => {
    setEditingBundle(bundle);
    setForm({
      name: bundle.name,
      slug: bundle.slug,
      description: bundle.description || '',
      discount: bundle.discount ? String(bundle.discount) : '',
      isActive: bundle.isActive,
    });
    setBundleProducts(
      bundle.BundleProduct.map((bp) => ({
        productId: bp.productId,
        quantity: bp.quantity,
        Product: bp.Product,
      }))
    );
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Bundle name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || generateSlug(form.name),
        description: form.description.trim() || null,
        discount: form.discount ? Number(form.discount) : null,
        isActive: form.isActive,
        products: bundleProducts.map((bp) => ({
          productId: bp.productId,
          quantity: bp.quantity,
        })),
      };

      const url = editingBundle
        ? `/api/bundles/${editingBundle.id}`
        : '/api/bundles';
      const method = editingBundle ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingBundle ? 'Bundle updated' : 'Bundle created');
        setFormOpen(false);
        fetchBundles();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save bundle');
      }
    } catch {
      toast.error('Failed to save bundle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await adminFetch(`/api/bundles/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Bundle deleted');
        setBundles((prev) => prev.filter((b) => b.id !== deleteId));
        setDeleteId(null);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete bundle');
      }
    } catch {
      toast.error('Failed to delete bundle');
    } finally {
      setDeleting(false);
    }
  };

  const handleProductSearch = useCallback(async (query: string) => {
    setProductSearch(query);
    if (!query || query.length < 2) {
      setProductResults([]);
      return;
    }
    setSearchingProducts(true);
    try {
      const res = await adminFetch(`/api/products?all=true&search=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        const existingIds = bundleProducts.map((bp) => bp.productId);
        setProductResults(
          (data.products || []).filter((p: Product) => !existingIds.includes(p.id))
        );
      }
    } catch {
      // ignore
    } finally {
      setSearchingProducts(false);
    }
  }, [bundleProducts]);

  const handleAddProduct = (product: Product) => {
    setBundleProducts((prev) => [
      ...prev,
      { productId: product.id, quantity: 1, Product: product },
    ]);
    setProductResults((prev) => prev.filter((p) => p.id !== product.id));
    setProductSearch('');
  };

  const handleRemoveProduct = (productId: string) => {
    setBundleProducts((prev) => prev.filter((bp) => bp.productId !== productId));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setBundleProducts((prev) =>
      prev.map((bp) =>
        bp.productId === productId ? { ...bp, quantity: Math.max(1, quantity) } : bp
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Product Bundles</h2>
          <p className="text-muted-foreground mt-1">Create cross-sell bundles with discounts</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Create Bundle
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search bundles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : filteredBundles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No bundles found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm ? 'No bundles match your search' : 'Create your first bundle to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Slug</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBundles.map((bundle) => (
                  <TableRow key={bundle.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{bundle.name}</p>
                        {bundle.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {bundle.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                        /{bundle.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      {bundle.discount ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {bundle.discount}% off
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {bundle.BundleProduct.length} product(s)
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          bundle.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }
                      >
                        {bundle.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(bundle.createdAt).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(bundle)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => setDeleteId(bundle.id)}
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
              {editingBundle ? 'Edit Bundle' : 'Create Bundle'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-140px)] pr-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bundle-name">
                    Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="bundle-name"
                    placeholder="Bundle name"
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        name,
                        slug: editingBundle ? prev.slug : generateSlug(name),
                      }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bundle-slug">Slug</Label>
                  <Input
                    id="bundle-slug"
                    placeholder="bundle-slug"
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bundle-desc">Description</Label>
                <Textarea
                  id="bundle-desc"
                  placeholder="Bundle description..."
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bundle-discount">Discount %</Label>
                  <Input
                    id="bundle-discount"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="e.g. 10"
                    value={form.discount}
                    onChange={(e) => setForm((prev) => ({ ...prev, discount: e.target.value }))}
                  />
                </div>
                <div className="flex items-end pb-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
                    />
                    <Label
                      className="cursor-pointer"
                      onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                    >
                      Active
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-sm font-medium">Products in Bundle</Label>
                {bundleProducts.length > 0 && (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="w-24 text-center">Qty</TableHead>
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bundleProducts.map((bp) => (
                          <TableRow key={bp.productId}>
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium">{bp.Product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(bp.Product.price)}
                                  {bp.Product.sku && <span className="ml-2 font-mono">({bp.Product.sku})</span>}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Input
                                type="number"
                                min="1"
                                value={bp.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(bp.productId, parseInt(e.target.value) || 1)
                                }
                                className="h-8 w-16 text-center mx-auto"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-rose-600 hover:text-rose-700"
                                onClick={() => handleRemoveProduct(bp.productId)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products to add..."
                    value={productSearch}
                    onChange={(e) => handleProductSearch(e.target.value)}
                    className="pl-9"
                  />
                  {searchingProducts && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                    </div>
                  )}
                  {productResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border bg-popover shadow-md max-h-48 overflow-y-auto">
                      {productResults.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted"
                          onClick={() => handleAddProduct(product)}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(product.price)}
                              {product.sku && <span className="ml-2 font-mono">({product.sku})</span>}
                            </span>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingBundle ? 'Update Bundle' : 'Create Bundle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bundle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bundle? This action cannot be undone.
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
