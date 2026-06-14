'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Package, MapPin, AlertTriangle, Plus, Pencil, X, Loader2, ChevronLeft, ChevronRight, Check, Warehouse as WarehouseIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { adminFetch } from '@/lib/admin-fetch';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface InventoryRecord {
  id: string;
  productId: string;
  variantId: string | null;
  warehouseId: string;
  stock: number;
  updatedAt: string;
  Product: {
    id: string;
    name: string;
    sku: string | null;
    images: string;
  };
  Warehouse: {
    id: string;
    name: string;
  };
}

interface Warehouse {
  id: string;
  name: string;
}

interface ProductItem {
  id: string;
  name: string;
  sku: string | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

export function AdminInventory() {
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InventoryRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState<ProductItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [stockValue, setStockValue] = useState('');

  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineStock, setInlineStock] = useState('');

  const fetchRecords = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      let url = `/api/admin/inventory?page=${page}&limit=${PAGE_SIZE}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (warehouseFilter && warehouseFilter !== 'all') url += `&warehouseId=${warehouseFilter}`;
      const res = await adminFetch(url);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.inventory || []);
        setPagination(data.pagination || { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
      }
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, warehouseFilter]);

  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/warehouses?all=true');
      if (res.ok) {
        const data = await res.json();
        setWarehouses(data.warehouses || []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  useEffect(() => {
    fetchRecords(1);
  }, [fetchRecords]);

  const handlePageChange = (newPage: number) => {
    fetchRecords(newPage);
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setSelectedProduct(null);
    setProductSearch('');
    setProductResults([]);
    setSelectedWarehouseId('');
    setVariantId('');
    setStockValue('');
    setFormOpen(true);
  };

  const handleProductSearch = useCallback(async (query: string) => {
    setProductSearch(query);
    if (query.length < 2) {
      setProductResults([]);
      return;
    }
    try {
      const res = await adminFetch(`/api/products?all=true&search=${encodeURIComponent(query)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setProductResults(data.products || []);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSave = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }
    if (!selectedWarehouseId) {
      toast.error('Please select a warehouse');
      return;
    }
    const stockNum = parseInt(stockValue);
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error('Enter a valid stock quantity');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        productId: selectedProduct.id,
        warehouseId: selectedWarehouseId,
        stock: stockNum,
        variantId: variantId.trim() || null,
      };

      const url = editingRecord
        ? `/api/admin/inventory/${editingRecord.id}`
        : '/api/admin/inventory';
      const method = editingRecord ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingRecord ? 'Inventory updated' : 'Inventory created');
        setFormOpen(false);
        fetchRecords(pagination.page);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save inventory record');
      }
    } catch {
      toast.error('Failed to save inventory record');
    } finally {
      setSaving(false);
    }
  };

  const handleInlineSave = async (recordId: string) => {
    const newStock = parseInt(inlineStock);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Enter a valid stock quantity');
      return;
    }
    try {
      const res = await adminFetch(`/api/admin/inventory/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        toast.success('Stock updated');
        setInlineEditId(null);
        fetchRecords(pagination.page);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update stock');
      }
    } catch {
      toast.error('Failed to update stock');
    }
  };

  const startInlineEdit = (record: InventoryRecord) => {
    setInlineEditId(record.id);
    setInlineStock(String(record.stock));
  };

  const getStockBadge = (stock: number) => {
    if (stock <= 0) {
      return (
        <Badge variant="secondary" className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
          Out of stock
        </Badge>
      );
    }
    if (stock <= 5) {
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          <AlertTriangle className="mr-1 h-3 w-3" />
          {stock}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        {stock}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
          <p className="text-muted-foreground">Manage product stock across warehouses</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 w-48"
            />
          </div>
          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="All Warehouses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              {warehouses.map((w) => (
                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => fetchRecords(pagination.page)}>
            <Loader2 className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Inventory
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No inventory records found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm || warehouseFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add inventory to start tracking stock levels'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden sm:table-cell">SKU</TableHead>
                  <TableHead className="hidden sm:table-cell">Warehouse</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium truncate max-w-[200px]">
                          {record.Product.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {record.Product.sku || '—'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {record.Warehouse.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {inlineEditId === record.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            value={inlineStock}
                            onChange={(e) => setInlineStock(e.target.value)}
                            className="h-7 w-20 text-xs"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleInlineSave(record.id);
                              if (e.key === 'Escape') setInlineEditId(null);
                            }}
                          />
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleInlineSave(record.id)}>
                            <Check className="h-3 w-3 text-emerald-600" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setInlineEditId(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <button onClick={() => startInlineEdit(record)} className="hover:opacity-80 transition-opacity">
                          {getStockBadge(record.stock)}
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(record.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingRecord(record);
                            setSelectedProduct({ id: record.Product.id, name: record.Product.name, sku: record.Product.sku });
                            setProductSearch(record.Product.name);
                            setSelectedWarehouseId(record.warehouseId);
                            setVariantId(record.variantId || '');
                            setStockValue(String(record.stock));
                            setFormOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? 'Edit Inventory' : 'Add Inventory'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Product Search */}
            <div className="space-y-2">
              <Label>Product <span className="text-rose-500">*</span></Label>
              {editingRecord ? (
                <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
                  {selectedProduct?.name}
                </div>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between font-normal"
                    >
                      {selectedProduct
                        ? selectedProduct.name
                        : 'Search product...'}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search products..."
                        value={productSearch}
                        onValueChange={handleProductSearch}
                      />
                      <CommandList>
                        <CommandEmpty>No products found.</CommandEmpty>
                        <CommandGroup>
                          {productResults.map((p) => (
                            <CommandItem
                              key={p.id}
                              value={p.id}
                              onSelect={() => {
                                setSelectedProduct(p);
                                setProductSearch(p.name);
                                setProductResults([]);
                              }}
                            >
                              <Package className="mr-2 h-4 w-4" />
                              <div className="flex flex-col">
                                <span>{p.name}</span>
                                {p.sku && (
                                  <span className="text-xs text-muted-foreground">SKU: {p.sku}</span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Warehouse */}
            <div className="space-y-2">
              <Label htmlFor="inv-warehouse">Warehouse <span className="text-rose-500">*</span></Label>
              <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
                <SelectTrigger id="inv-warehouse">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      <div className="flex items-center gap-2">
                        <WarehouseIcon className="h-3.5 w-3.5" />
                        {w.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Variant */}
            <div className="space-y-2">
              <Label htmlFor="inv-variant">Variant ID (optional)</Label>
              <Input
                id="inv-variant"
                placeholder="e.g. variant-id"
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for simple products
              </p>
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <Label htmlFor="inv-stock">
                Stock Quantity <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="inv-stock"
                type="number"
                min="0"
                placeholder="0"
                value={stockValue}
                onChange={(e) => setStockValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingRecord ? 'Update Inventory' : 'Add Inventory'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
