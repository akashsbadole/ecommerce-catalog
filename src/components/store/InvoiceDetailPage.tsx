'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  FileText,
  Download,
  CreditCard,
  CheckCircle,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/pricing';

interface InvoiceItem {
  id: string;
  name: string;
  hsnCode: string | null;
  quantity: number;
  price: number;
  gstRate: number;
  total: number;
}

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  cgst: number;
  sgst: number;
  igst: number;
  notes: string | null;
  createdAt: string;
  dueDate: string;
  billingName: string | null;
  billingEmail: string | null;
  billingAddress: string | null;
  billingCompany: string | null;
  companyName: string | null;
  storeName: string | null;
  storeLogo: string | null;
  items: InvoiceItem[];
}

interface InvoiceDetailPageProps {
  invoiceId: string;
  onNavigate?: (page: string, data?: unknown) => void;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function InvoiceDetailPage({ invoiceId }: InvoiceDetailPageProps) {
  const { auth, settings } = useAppStore();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const currency = settings?.currency || 'USD';

  useEffect(() => {
    if (!auth.token) { setLoading(false); return; }
    setLoading(true);
    fetch(`/api/invoices/${invoiceId}`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'x-user-id': auth.user?.id || '',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => setInvoice(data.invoice))
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false));
  }, [auth.token, invoiceId]);

  const handlePay = async () => {
    if (!auth.token || !invoice) return;
    setPaying(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/pay`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'x-user-id': auth.user?.id || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setInvoice(data.invoice);
        toast.success('Invoice marked as paid');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to mark invoice as paid');
      }
    } catch {
      toast.error('Failed to mark invoice as paid');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Invoice Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The invoice you are looking for does not exist or has been removed.
        </p>
        <Button className="mt-6" onClick={() => useAppStore.getState().navigate('invoices')}>
          View All Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => useAppStore.getState().navigate('invoices')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
            <p className="text-sm text-muted-foreground">
              Issued on{' '}
              {new Date(invoice.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(invoice.status)}>
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </Badge>
      </div>

      {/* Invoice Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {invoice.storeLogo ? (
                <img
                  src={invoice.storeLogo}
                  alt={invoice.storeName || 'Store'}
                  className="h-12 w-12 object-contain"
                />
              ) : (
                <Building2 className="h-12 w-12 text-muted-foreground/30" />
              )}
              <div>
                <h2 className="text-lg font-bold">{invoice.storeName || invoice.companyName || 'Store'}</h2>
                <p className="text-sm text-muted-foreground">Invoice #{invoice.invoiceNumber}</p>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Issued: {new Date(invoice.createdAt).toLocaleDateString()}</p>
              <p>Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bill To */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bill To</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          {invoice.billingName && <p className="font-medium">{invoice.billingName}</p>}
          {invoice.billingCompany && <p>{invoice.billingCompany}</p>}
          {invoice.billingAddress && <p className="text-muted-foreground">{invoice.billingAddress}</p>}
          {invoice.billingEmail && <p className="text-muted-foreground">{invoice.billingEmail}</p>}
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>HSN Code</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">GST</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.hsnCode || '-'}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatPrice(item.price, invoice.currency || currency)}</TableCell>
                  <TableCell className="text-right">{item.gstRate}%</TableCell>
                  <TableCell className="text-right font-medium">{formatPrice(item.total, invoice.currency || currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary & GST Breakup */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(invoice.subtotal, invoice.currency || currency)}</span>
            </div>
            {invoice.shippingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPrice(invoice.shippingCost, invoice.currency || currency)}</span>
              </div>
            )}
            {invoice.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-green-600">-{formatPrice(invoice.discount, invoice.currency || currency)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatPrice(invoice.tax, invoice.currency || currency)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary">{formatPrice(invoice.total, invoice.currency || currency)}</span>
            </div>
            {invoice.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-muted-foreground text-xs">Notes</p>
                <p className="text-sm mt-1">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* GST Breakup */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">GST Breakup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {invoice.cgst > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">CGST</span>
                <span>{formatPrice(invoice.cgst, invoice.currency || currency)}</span>
              </div>
            )}
            {invoice.sgst > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">SGST</span>
                <span>{formatPrice(invoice.sgst, invoice.currency || currency)}</span>
              </div>
            )}
            {invoice.igst > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">IGST</span>
                <span>{formatPrice(invoice.igst, invoice.currency || currency)}</span>
              </div>
            )}
            {invoice.cgst === 0 && invoice.sgst === 0 && invoice.igst === 0 && (
              <p className="text-muted-foreground">No GST applicable</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
        >
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
        {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
          <Button onClick={handlePay} disabled={paying}>
            {paying ? (
              'Processing...'
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay Now
              </>
            )}
          </Button>
        )}
        {invoice.status === 'paid' && (
          <Button variant="outline" disabled className="text-green-600">
            <CheckCircle className="mr-2 h-4 w-4" />
            Paid
          </Button>
        )}
      </div>
    </div>
  );
}
