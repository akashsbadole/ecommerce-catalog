'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  AlertTriangle,
  RefreshCw,
  Send,
  Package,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminFetch } from '@/lib/admin-fetch';

interface LowStockProduct {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  alertEnabled: boolean;
  lastAlertAt: string | null;
  images: string;
  Category?: { name: string } | null;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

export function AdminLowStockAlerts() {
  const [products, setProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [globalThreshold, setGlobalThreshold] = useState('10');

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [sendingAlertId, setSendingAlertId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await adminFetch('/api/products/low-stock');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        if (data.threshold !== undefined) {
          setGlobalThreshold(String(data.threshold));
        }
      }
    } catch {
      toast.error('Failed to load low stock products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleThresholdChange = async (productId: string, threshold: number) => {
    setUpdatingId(productId);
    try {
      const res = await adminFetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lowStockThreshold: threshold }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, lowStockThreshold: threshold } : p
          )
        );
        toast.success('Threshold updated');
      } else {
        toast.error('Failed to update threshold');
      }
    } catch {
      toast.error('Failed to update threshold');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleAlert = async (productId: string, enabled: boolean) => {
    setUpdatingId(productId);
    try {
      const res = await adminFetch(`/api/products/${productId}/low-stock-alert`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertEnabled: enabled }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, alertEnabled: enabled } : p
          )
        );
        toast.success(enabled ? 'Alert enabled' : 'Alert disabled');
      } else {
        toast.error('Failed to update alert setting');
      }
    } catch {
      toast.error('Failed to update alert setting');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSendAlert = async (productId: string) => {
    setSendingAlertId(productId);
    try {
      const res = await adminFetch(`/api/products/${productId}/low-stock-alert`, {
        method: 'POST',
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? { ...p, lastAlertAt: new Date().toISOString() }
              : p
          )
        );
        toast.success('Alert sent');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to send alert');
      }
    } catch {
      toast.error('Failed to send alert');
    } finally {
      setSendingAlertId(null);
    }
  };

  const handleSetGlobalThreshold = async () => {
    const threshold = parseInt(globalThreshold);
    if (isNaN(threshold) || threshold < 0) {
      toast.error('Enter a valid threshold');
      return;
    }
    try {
      const res = await adminFetch('/api/products/low-stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold }),
      });
      if (res.ok) {
        toast.success('Global threshold updated');
        fetchProducts();
      } else {
        toast.error('Failed to update threshold');
      }
    } catch {
      toast.error('Failed to update threshold');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Low Stock Alerts</h2>
          <p className="text-muted-foreground mt-1">Monitor products running low on inventory</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchProducts()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Global Threshold */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <Label className="text-sm font-medium">Global Low Stock Threshold:</Label>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              value={globalThreshold}
              onChange={(e) => setGlobalThreshold(e.target.value)}
              className="h-8 w-24"
            />
            <Button size="sm" variant="outline" onClick={handleSetGlobalThreshold}>
              Update
            </Button>
          </div>
          <p className="text-xs text-muted-foreground ml-auto">
            Products below this threshold are flagged as low stock
          </p>
        </div>
      </Card>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No low stock products</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm ? 'No products match your search' : 'All products are well-stocked'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden sm:table-cell">SKU</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Alerts</TableHead>
                  <TableHead className="hidden md:table-cell">Last Alert</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const isCritical = product.stock <= Math.floor(product.lowStockThreshold * 0.5);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-md ${
                            isCritical ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                          }`}>
                            <AlertTriangle className={`h-4 w-4 ${
                              isCritical ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            {product.Category && (
                              <p className="text-xs text-muted-foreground">{product.Category.name}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                          {product.sku || '—'}
                        </code>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {product.Category?.name || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            isCritical
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }
                        >
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            value={product.lowStockThreshold}
                            onChange={(e) =>
                              handleThresholdChange(product.id, parseInt(e.target.value) || 0)
                            }
                            disabled={updatingId === product.id}
                            className="h-8 w-20 text-xs"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={product.alertEnabled}
                            onCheckedChange={(checked) => handleToggleAlert(product.id, checked)}
                            disabled={updatingId === product.id}
                          />
                          <span className="text-xs text-muted-foreground">
                            {product.alertEnabled ? 'On' : 'Off'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {product.lastAlertAt
                          ? new Date(product.lastAlertAt).toLocaleDateString('en-IN')
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={sendingAlertId === product.id}
                          onClick={() => handleSendAlert(product.id)}
                        >
                          {sendingAlertId === product.id ? (
                            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="mr-1 h-3.5 w-3.5" />
                          )}
                          Send Alert
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
