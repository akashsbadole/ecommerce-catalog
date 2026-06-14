'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Eye,
  RefreshCw,
  Package,
  CheckCircle,
  XCircle,
  Truck,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminFetch } from '@/lib/admin-fetch';

interface ReturnItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  reason: string | null;
}

interface Return {
  id: string;
  returnNumber: string;
  orderId: string;
  status: string;
  reason: string | null;
  adminNotes: string | null;
  refundAmount: number | null;
  createdAt: string;
  updatedAt: string;
  User: { id: string; name: string; email: string };
  Order: { orderNumber: string };
  ReturnItem: ReturnItem[];
}

const statusTabs = ['all', 'requested', 'approved', 'picked_up', 'received', 'refunded', 'rejected'];

const statusColors: Record<string, string> = {
  requested: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  picked_up: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  received: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  refunded: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statusIcons: Record<string, typeof Package> = {
  requested: Package,
  approved: CheckCircle,
  picked_up: Truck,
  received: Package,
  refunded: CheckCircle,
  rejected: XCircle,
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

export function AdminReturns() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [viewReturn, setViewReturn] = useState<Return | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchReturns = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'all') params.set('status', activeFilter);
      if (searchTerm) params.set('search', searchTerm);
      const res = await adminFetch(`/api/returns?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReturns(data.returns || []);
      }
    } catch {
      toast.error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchTerm]);

  useEffect(() => {
    setLoading(true);
    fetchReturns();
  }, [fetchReturns]);

  const handleViewReturn = (ret: Return) => {
    setViewReturn(ret);
    setStatusUpdate(ret.status);
    setAdminNotes(ret.adminNotes || '');
    setRefundAmount(ret.refundAmount ? String(ret.refundAmount) : '');
  };

  const handleSaveReturn = async () => {
    if (!viewReturn) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      if (statusUpdate !== viewReturn.status) body.status = statusUpdate;
      if (adminNotes !== (viewReturn.adminNotes || '')) body.adminNotes = adminNotes;
      if (refundAmount) body.refundAmount = Number(refundAmount);

      if (Object.keys(body).length === 0) {
        setSaving(false);
        return;
      }

      const res = await adminFetch(`/api/returns/${viewReturn.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setViewReturn(data.return);
        setStatusUpdate(data.return.status);
        setAdminNotes(data.return.adminNotes || '');
        setRefundAmount(data.return.refundAmount ? String(data.return.refundAmount) : '');
        setReturns((prev) =>
          prev.map((r) => (r.id === data.return.id ? data.return : r))
        );
        toast.success('Return updated successfully');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update return');
      }
    } catch {
      toast.error('Failed to update return');
    } finally {
      setSaving(false);
    }
  };

  const calculateTotal = (items: ReturnItem[]) =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Returns &amp; RMA</h2>
          <p className="text-muted-foreground">Manage customer return requests</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchReturns()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeFilter} onValueChange={setActiveFilter}>
        <TabsList className="flex flex-wrap h-auto gap-1 p-1">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="capitalize text-xs">
              {tab.replace('_', ' ')}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by return#, order#, customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : returns.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="mx-auto h-12 w-12 mb-4 opacity-20" />
          <p>No returns found</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Return #</TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Reason</TableHead>
                <TableHead className="hidden md:table-cell">Amount</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.map((ret) => {
                const StatusIcon = statusIcons[ret.status] || Package;
                return (
                  <TableRow key={ret.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {ret.returnNumber}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {ret.Order?.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{ret.User?.name}</span>
                        <span className="text-xs text-muted-foreground">{ret.User?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${statusColors[ret.status]} capitalize`}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {ret.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {ret.reason || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-medium">
                      {ret.refundAmount != null ? formatCurrency(ret.refundAmount) : formatCurrency(calculateTotal(ret.ReturnItem))}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(ret.createdAt).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewReturn(ret)}
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

      {/* View Return Dialog */}
      <Dialog open={!!viewReturn} onOpenChange={(open) => !open && setViewReturn(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Return {viewReturn?.returnNumber}
            </DialogTitle>
          </DialogHeader>

          {viewReturn && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Customer</Label>
                  <p className="text-sm font-medium">{viewReturn.User?.name}</p>
                  <p className="text-xs text-muted-foreground">{viewReturn.User?.email}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Order</Label>
                  <p className="text-sm font-mono">{viewReturn.Order?.orderNumber}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-sm font-medium">Return Items</Label>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewReturn.ReturnItem.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              {item.reason && (
                                <p className="text-xs text-muted-foreground">Reason: {item.reason}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-right">{item.quantity}</TableCell>
                          <TableCell className="text-sm text-right">{formatCurrency(item.price)}</TableCell>
                          <TableCell className="text-sm text-right font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end">
                  <div className="text-sm font-medium">
                    Total: {formatCurrency(calculateTotal(viewReturn.ReturnItem))}
                  </div>
                </div>
              </div>

              <Separator />

              {viewReturn.reason && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Customer Reason</Label>
                  <p className="text-sm bg-muted p-3 rounded-md">{viewReturn.reason}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="return-status">Status</Label>
                  <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                    <SelectTrigger id="return-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['requested', 'approved', 'picked_up', 'received', 'refunded', 'rejected'].map((s) => (
                        <SelectItem key={s} value={s}>
                          <span className="capitalize">{s.replace('_', ' ')}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="return-refund">Refund Amount (INR)</Label>
                  <Input
                    id="return-refund"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={String(calculateTotal(viewReturn.ReturnItem))}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="return-notes">Admin Notes</Label>
                <Textarea
                  id="return-notes"
                  placeholder="Internal notes about this return..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewReturn(null)}>
              Close
            </Button>
            <Button onClick={handleSaveReturn} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
