'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Eye,
  RefreshCw,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminFetch } from '@/lib/admin-fetch';
import { formatPrice } from '@/lib/pricing';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  price: number;
  quantity: number;
  total: number;
  images: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  shippingName: string | null;
  shippingEmail: string | null;
  shippingPhone: string | null;
  shippingAddress: string | null;
  notes: string | null;
  createdAt: string;
  User: { id: string; name: string; email: string };
  items: OrderItem[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusTabs = ['all', 'pending_approval', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusColors: Record<string, string> = {
  pending_approval: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  pending: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statusIcons: Record<string, typeof Package> = {
  pending_approval: AlertTriangle,
  pending: Clock,
  confirmed: CheckCircle2,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

const PAGE_SIZE = 20;

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });

  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOrders = useCallback(async (page = 1) => {
    try {
      let url = `/api/admin/orders?page=${page}&limit=${PAGE_SIZE}`;
      if (activeFilter !== 'all') {
        url += `&status=${activeFilter}`;
      }
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      const res = await adminFetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setPagination(data.pagination || { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
      }
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchTerm]);

  useEffect(() => {
    setLoading(true);
    fetchOrders(1);
  }, [fetchOrders]);

  const handlePageChange = (newPage: number) => {
    setLoading(true);
    fetchOrders(newPage);
  };

  const handleViewOrder = (order: Order) => {
    setViewOrder(order);
    setStatusUpdate(order.status);
  };

  const handleSaveOrder = async () => {
    if (!viewOrder) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      if (statusUpdate !== viewOrder.status) body.status = statusUpdate;

      if (Object.keys(body).length === 0) {
        setSaving(false);
        return;
      }

      const res = await adminFetch(`/api/admin/orders/${viewOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setViewOrder(data.order);
        setStatusUpdate(data.order.status);
        setOrders(prev =>
          prev.map(o => (o.id === data.order.id ? data.order : o))
        );
        toast.success('Order updated successfully');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update order');
      }
    } catch {
      toast.error('Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const pendingApprovalCount = orders.filter(o => o.status === 'pending_approval').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">
            Manage customer orders
            {pendingApprovalCount > 0 && (
              <Badge className="ml-2 bg-amber-500 text-white">{pendingApprovalCount} pending approval</Badge>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchOrders(pagination.page)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === tab
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <span className="capitalize">{tab.replace('_', ' ')}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by order number, customer name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingBag className="mx-auto h-12 w-12 mb-4 opacity-20" />
          <p>No orders found</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const StatusIcon = statusIcons[order.status] || Package;
                return (
                  <TableRow key={order.id} className={order.status === 'pending_approval' ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}>
                    <TableCell className="font-mono text-sm font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{order.User?.name}</span>
                        <span className="text-xs text-muted-foreground">{order.User?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{order.items.length} item(s)</span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(order.total, order.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${statusColors[order.status]} capitalize`}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} orders
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

      {/* View Order Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              {viewOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>

          {viewOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Customer</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{viewOrder.User?.name}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{viewOrder.User?.email}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Items</Label>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm font-medium">{item.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground font-mono">
                            {item.sku || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-right">
                            {formatPrice(item.price, viewOrder.currency)}
                          </TableCell>
                          <TableCell className="text-sm text-right">{item.quantity}</TableCell>
                          <TableCell className="text-sm text-right font-medium">
                            {formatPrice(item.total, viewOrder.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              {/* Status + Pricing */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-order-status">Status</Label>
                    <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                      <SelectTrigger id="admin-order-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                          <SelectItem key={s} value={s}>
                            <span className="capitalize">{s}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {viewOrder.notes && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Customer Notes</Label>
                      <p className="text-sm bg-muted p-3 rounded-md">{viewOrder.notes}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(viewOrder.subtotal, viewOrder.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{viewOrder.shippingCost === 0 ? 'Free' : formatPrice(viewOrder.shippingCost, viewOrder.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatPrice(viewOrder.tax, viewOrder.currency)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-bold">
                    <span>Total</span>
                    <span>{formatPrice(viewOrder.total, viewOrder.currency)}</span>
                  </div>
                  {viewOrder.paymentMethod && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment</span>
                      <span className="capitalize">{viewOrder.paymentMethod}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {viewOrder.shippingAddress && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Shipping Address</Label>
                  <p className="text-sm bg-muted p-3 rounded-md">{viewOrder.shippingAddress}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOrder(null)}>
              Close
            </Button>
            <Button onClick={handleSaveOrder} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
