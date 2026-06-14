'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Eye,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { formatPrice } from '@/lib/pricing';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  dueDate: string;
  billingName: string | null;
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

export function InvoicesPage({ onNavigate: _onNavigate }: { onNavigate?: (page: string, data?: unknown) => void } = {}) {
  const { auth, settings } = useAppStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const currency = settings?.currency || 'USD';

  useEffect(() => {
    if (!auth.token) { setLoading(false); return; }
    setLoading(true);
    fetch(`/api/invoices?page=${page}&limit=10`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'x-user-id': auth.user?.id || '',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setInvoices(data.invoices || []);
        setTotalPages(data.pagination?.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [auth.token, page]);

  if (!auth.token) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="mt-2 text-muted-foreground">Please log in to view your invoices</p>
        <Button className="mt-6" onClick={() => useAppStore.getState().navigate('home')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">No Invoices</h1>
        <p className="mt-2 text-muted-foreground max-w-md">
          You don&apos;t have any invoices yet. Invoices will appear here once orders are processed.
        </p>
        <Button className="mt-6" onClick={() => useAppStore.getState().navigate('catalogue')}>
          Browse Catalogue
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-sm text-muted-foreground">View and manage your invoices</p>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => useAppStore.getState().navigate('invoice-detail', inv.id)}>
                <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(inv.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(inv.dueDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(inv.status)}>
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatPrice(inv.total, inv.currency || currency)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      useAppStore.getState().navigate('invoice-detail', inv.id);
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden grid gap-3">
        {invoices.map((inv) => (
          <Card
            key={inv.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => useAppStore.getState().navigate('invoice-detail', inv.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{inv.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getStatusColor(inv.status)}>
                  {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm font-bold">{formatPrice(inv.total, inv.currency || currency)}</p>
                <Button variant="ghost" size="sm" className="h-8">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
