'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Eye,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  Send,
  CheckCircle2,
  Plus,
  ShoppingBag,
  User,
  Mail,
  Building2,
  Calendar,
  DollarSign,
  Receipt,
  Hash,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { formatPrice } from '@/lib/pricing';

interface InvoiceItem {
  id: string;
  name: string;
  sku: string | null;
  hsnCode: string | null;
  price: number;
  quantity: number;
  total: number;
  gstRate: number;
  gstAmount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string | null;
  status: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  taxRate: number;
  total: number;
  currency: string;
  gstNumber: string | null;
  gstType: string | null;
  notes: string | null;
  billingName: string | null;
  billingEmail: string | null;
  billingAddress: string | null;
  companyName: string | null;
  companyAddress: string | null;
  companyTaxId: string | null;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  User: { id: string; name: string; email: string } | null;
  Company: { id: string; name: string } | null;
  Order: { id: string; orderNumber: string } | null;
  items: InvoiceItem[];
}

interface OrderInfo {
  id: string;
  orderNumber: string;
  total: number;
  currency: string;
  User: { name: string; email: string };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

const statusColors: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statusTabs = ['all', 'draft', 'sent', 'paid', 'cancelled'];

export function AdminInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });

  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [sending, setSending] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  // Create from order
  const [createOpen, setCreateOpen] = useState(false);
  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchInvoices = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      let url = `/api/admin/invoices?page=${page}&limit=${PAGE_SIZE}`;
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      const res = await adminFetch(url);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
        setPagination(
          data.pagination || {
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 0,
          }
        );
      }
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await adminFetch(
        '/api/admin/orders?limit=100&status=delivered'
      );
      if (res.ok) {
        const data = await res.json();
        setOrders(
          (data.orders || []).map((o: Record<string, unknown>) => ({
            id: o.id as string,
            orderNumber: o.orderNumber as string,
            total: o.total as number,
            currency: o.currency as string,
            User: (o.User as { name: string; email: string }) || {
              name: 'Unknown',
              email: '',
            },
          }))
        );
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchInvoices(1);
  }, [fetchInvoices]);

  const handlePageChange = (newPage: number) => {
    fetchInvoices(newPage);
  };

  const handleView = (invoice: Invoice) => {
    setViewInvoice(invoice);
  };

  const handleSend = async () => {
    if (!viewInvoice) return;
    setSending(true);
    try {
      const res = await adminFetch(
        `/api/admin/invoices/${viewInvoice.id}/send`,
        { method: 'POST' }
      );
      if (res.ok) {
        toast.success('Invoice sent successfully');
        setViewInvoice((prev) =>
          prev ? { ...prev, status: 'sent' } : prev
        );
        fetchInvoices(pagination.page);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to send invoice');
      }
    } catch {
      toast.error('Failed to send invoice');
    } finally {
      setSending(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!viewInvoice) return;
    setMarkingPaid(true);
    try {
      const res = await adminFetch(
        `/api/admin/invoices/${viewInvoice.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'paid' }),
        }
      );
      if (res.ok) {
        toast.success('Invoice marked as paid');
        setViewInvoice((prev) =>
          prev ? { ...prev, status: 'paid', paidAt: new Date().toISOString() } : prev
        );
        fetchInvoices(pagination.page);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to mark invoice as paid');
      }
    } catch {
      toast.error('Failed to mark invoice as paid');
    } finally {
      setMarkingPaid(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!viewInvoice) return;
    try {
      const res = await adminFetch(
        `/api/admin/invoices/${viewInvoice.id}/pdf`
      );
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${viewInvoice.invoiceNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('PDF downloaded');
      } else {
        toast.error('Failed to download PDF');
      }
    } catch {
      toast.error('Failed to download PDF');
    }
  };

  const handleCreateFromOrder = async () => {
    if (!selectedOrderId) {
      toast.error('Please select an order');
      return;
    }
    setCreating(true);
    try {
      const res = await adminFetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrderId }),
      });
      if (res.ok) {
        toast.success('Invoice created from order');
        setCreateOpen(false);
        setSelectedOrderId('');
        fetchInvoices(1);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to create invoice');
      }
    } catch {
      toast.error('Failed to create invoice');
    } finally {
      setCreating(false);
    }
  };

  const calcGstTotal = (items: InvoiceItem[]) => {
    return items.reduce((sum, item) => sum + item.gstAmount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">
            Manage sales invoices and billing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchInvoices(pagination.page)}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => {
              fetchOrders();
              setCreateOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create from Order
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              statusFilter === tab
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by invoice number or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Invoices Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No invoices found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm || statusFilter !== 'all'
                ? 'No invoices match your criteria'
                : 'Create an invoice from a completed order'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {invoice.billingName ||
                            invoice.User?.name ||
                            invoice.Company?.name ||
                            '—'}
                        </span>
                        {invoice.billingEmail && (
                          <span className="text-xs text-muted-foreground">
                            {invoice.billingEmail}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${statusColors[invoice.status]} capitalize`}
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(invoice.total, invoice.currency)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
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
            Showing{' '}
            {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(
              pagination.page * pagination.limit,
              pagination.total
            )}{' '}
            of {pagination.total} invoices
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

      {/* View Invoice Dialog - Professional Layout */}
      <Dialog
        open={!!viewInvoice}
        onOpenChange={(open) => !open && setViewInvoice(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Invoice {viewInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>

          {viewInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">INVOICE</h3>
                  <p className="text-sm text-muted-foreground">
                    #{viewInvoice.invoiceNumber}
                  </p>
                  {viewInvoice.gstNumber && (
                    <p className="text-xs text-muted-foreground">
                      GST: {viewInvoice.gstNumber}
                    </p>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <Badge
                    variant="secondary"
                    className={`${statusColors[viewInvoice.status]} capitalize`}
                  >
                    {viewInvoice.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Date:{' '}
                    {new Date(
                      viewInvoice.createdAt
                    ).toLocaleDateString()}
                  </p>
                  {viewInvoice.dueDate && (
                    <p className="text-xs text-muted-foreground">
                      Due:{' '}
                      {new Date(
                        viewInvoice.dueDate
                      ).toLocaleDateString()}
                    </p>
                  )}
                  {viewInvoice.paidAt && (
                    <p className="text-xs text-emerald-600 font-medium">
                      Paid:{' '}
                      {new Date(
                        viewInvoice.paidAt
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Billing Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Bill To
                  </Label>
                  <p className="text-sm font-medium">
                    {viewInvoice.billingName ||
                      viewInvoice.User?.name ||
                      '—'}
                  </p>
                  {viewInvoice.billingEmail && (
                    <p className="text-sm text-muted-foreground">
                      {viewInvoice.billingEmail}
                    </p>
                  )}
                  {viewInvoice.billingAddress && (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {viewInvoice.billingAddress}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  {viewInvoice.companyName && (
                    <>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                        Company
                      </Label>
                      <p className="text-sm font-medium">
                        {viewInvoice.companyName}
                      </p>
                      {viewInvoice.companyAddress && (
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {viewInvoice.companyAddress}
                        </p>
                      )}
                      {viewInvoice.companyTaxId && (
                        <p className="text-sm text-muted-foreground">
                          Tax ID: {viewInvoice.companyTaxId}
                        </p>
                      )}
                    </>
                  )}
                  {viewInvoice.Order && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Order: {viewInvoice.Order.orderNumber}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Invoice Items */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Items</Label>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="hidden sm:table-cell">HSN/SKU</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">GST</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewInvoice.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-xs font-mono text-muted-foreground">
                            {item.hsnCode || item.sku || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-right">
                            {formatPrice(
                              item.price,
                              viewInvoice.currency
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-right">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-sm text-right text-muted-foreground">
                            {item.gstRate > 0
                              ? `${item.gstRate}%`
                              : '-'}
                          </TableCell>
                          <TableCell className="text-sm text-right font-medium">
                            {formatPrice(
                              item.total,
                              viewInvoice.currency
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      {formatPrice(
                        viewInvoice.subtotal,
                        viewInvoice.currency
                      )}
                    </span>
                  </div>
                  {viewInvoice.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Discount
                      </span>
                      <span className="text-rose-600">
                        -{formatPrice(viewInvoice.discount, viewInvoice.currency)}
                      </span>
                    </div>
                  )}
                  {viewInvoice.shippingCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Shipping
                      </span>
                      <span>
                        {formatPrice(
                          viewInvoice.shippingCost,
                          viewInvoice.currency
                        )}
                      </span>
                    </div>
                  )}
                  {viewInvoice.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Tax{' '}
                        {viewInvoice.taxRate > 0
                          ? `(${viewInvoice.taxRate}%)`
                          : ''}
                      </span>
                      <span>
                        {formatPrice(
                          viewInvoice.tax,
                          viewInvoice.currency
                        )}
                      </span>
                    </div>
                  )}
                  {calcGstTotal(viewInvoice.items) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        GST Total
                      </span>
                      <span>
                        {formatPrice(
                          calcGstTotal(viewInvoice.items),
                          viewInvoice.currency
                        )}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span>
                      {formatPrice(
                        viewInvoice.total,
                        viewInvoice.currency
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {viewInvoice.notes && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Notes
                  </Label>
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {viewInvoice.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setViewInvoice(null)}>
              Close
            </Button>
            {viewInvoice?.status === 'draft' && (
              <Button
                variant="default"
                onClick={handleSend}
                disabled={sending}
              >
                {sending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Send className="mr-2 h-4 w-4" />
                Send Invoice
              </Button>
            )}
            {viewInvoice?.status !== 'paid' && (
              <Button
                variant="default"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleMarkPaid}
                disabled={markingPaid}
              >
                {markingPaid && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Paid
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create from Order Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Invoice from Order</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invoice-order">
                Select Order <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={selectedOrderId}
                onValueChange={setSelectedOrderId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a delivered order" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.orderNumber} — {order.User?.name} (
                      {formatPrice(order.total, order.currency)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {orders.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No delivered orders available
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFromOrder}
              disabled={creating || !selectedOrderId}
            >
              {creating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
