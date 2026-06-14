'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Send,
  User,
  Mail,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface AbandonedCart {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string };
  itemCount: number;
  total: number;
  items: CartItem[];
  lastUpdated: string;
  hoursAgo: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SummaryInfo {
  totalAbandoned: number;
  totalValue: number;
}

const PAGE_SIZE = 20;

const timeRanges = [
  { value: '24', label: '24 hours' },
  { value: '48', label: '48 hours' },
  { value: '72', label: '72 hours' },
];

export function AdminCartAbandonment() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoursFilter, setHoursFilter] = useState('24');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [summary, setSummary] = useState<SummaryInfo>({
    totalAbandoned: 0,
    totalValue: 0,
  });

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sending state
  const [sending, setSending] = useState(false);

  const fetchCarts = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await adminFetch(
        `/api/admin/cart-abandonment?hours=${hoursFilter}&page=${page}&limit=${PAGE_SIZE}`
      );
      if (res.ok) {
        const data = await res.json();
        setCarts(data.carts || []);
        setPagination(
          data.pagination || {
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 0,
          }
        );
        setSummary(
          data.summary || { totalAbandoned: 0, totalValue: 0 }
        );
      }
    } catch {
      toast.error('Failed to load abandoned carts');
    } finally {
      setLoading(false);
    }
  }, [hoursFilter]);

  useEffect(() => {
    fetchCarts(1);
  }, [fetchCarts]);

  const handlePageChange = (newPage: number) => {
    fetchCarts(newPage);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === carts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(carts.map((c) => c.id));
    }
  };

  const handleSendRecovery = async (cartIds: string[]) => {
    if (cartIds.length === 0) {
      toast.error('No carts selected');
      return;
    }
    setSending(true);
    try {
      const res = await adminFetch('/api/admin/cart-abandonment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartIds }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(
          `Recovery email sent to ${data.sent} customer(s)`
        );
        setSelectedIds([]);
        fetchCarts(pagination.page);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to send recovery emails');
      }
    } catch {
      toast.error('Failed to send recovery emails');
    } finally {
      setSending(false);
    }
  };

  const getHourColor = (hours: number) => {
    if (hours >= 72) return 'text-red-600 font-medium';
    if (hours >= 48) return 'text-amber-600 font-medium';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Cart Abandonment
          </h2>
          <p className="text-muted-foreground">
            Track and recover abandoned shopping carts
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchCarts(pagination.page)}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <ShoppingCart className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Abandoned Carts
            </p>
            <p className="text-2xl font-bold">
              {summary.totalAbandoned}
            </p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
            <DollarSign className="h-5 w-5 text-red-700 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Total Value at Risk
            </p>
            <p className="text-2xl font-bold">
              {formatPrice(summary.totalValue)}
            </p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <AlertTriangle className="h-5 w-5 text-blue-700 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Avg. Cart Value
            </p>
            <p className="text-2xl font-bold">
              {summary.totalAbandoned > 0
                ? formatPrice(
                    summary.totalValue / summary.totalAbandoned
                  )
                : formatPrice(0)}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm whitespace-nowrap">
            Time Range:
          </Label>
          <Select
            value={hoursFilter}
            onValueChange={(val) => {
              setHoursFilter(val);
              setSelectedIds([]);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  Last {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <Card className="p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-sm font-medium">
            {selectedIds.length} cart(s) selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleSendRecovery(selectedIds)}
              disabled={sending}
            >
              {sending ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="mr-1 h-3.5 w-3.5" />
              )}
              Send Recovery Email ({selectedIds.length})
            </Button>
          </div>
        </Card>
      )}

      {/* Abandoned Carts Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : carts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">
              No abandoned carts found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {`No carts have been abandoned in the last ${
                timeRanges.find((r) => r.value === hoursFilter)
                  ?.label || '24 hours'
              }`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        selectedIds.length === carts.length &&
                        carts.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Items Summary
                  </TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Last Updated
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carts.map((cart) => (
                  <TableRow key={cart.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(cart.id)}
                        onCheckedChange={() => toggleSelect(cart.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {cart.user?.name || 'Guest'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {cart.user?.email || '—'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {cart.itemCount} item(s)
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                          {cart.items.map((i) => i.name).join(', ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(cart.total)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span
                          className={`text-sm ${getHourColor(
                            cart.hoursAgo
                          )}`}
                        >
                          {cart.hoursAgo}h ago
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleSendRecovery([cart.id])
                        }
                        disabled={sending}
                      >
                        <Send className="h-4 w-4" />
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
            of {pagination.total} carts
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
    </div>
  );
}
