'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Eye,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Pause,
  XCircle,
  Calendar,
  Package,
  Building2,
  User,
  Mail,
  Check,
  ChevronsUpDown,
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
import { cn } from '@/lib/utils';
import { adminFetch } from '@/lib/admin-fetch';

interface Subscription {
  id: string;
  userId: string;
  companyId: string | null;
  productId: string;
  quantity: number;
  frequency: string;
  nextDeliveryDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  User: { id: string; name: string; email: string };
  Company?: { id: string; name: string } | null;
  Product: { id: string; name: string; sku: string | null; price: number };
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const emptyForm = {
  userId: '',
  productId: '',
  quantity: 1,
  frequency: 'monthly',
  nextDeliveryDate: '',
};

export function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });

  const [viewSub, setViewSub] = useState<Subscription | null>(null);

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [editForm, setEditForm] = useState({
    quantity: 1,
    frequency: 'monthly',
    nextDeliveryDate: '',
  });
  const [saving, setSaving] = useState(false);

  // Create state
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  // Cancel/pause/resume
  const [actionSubId, setActionSubId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'cancel' | 'pause' | 'resume' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Dropdown data
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);

  // Searchable dropdowns
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const fetchSubscriptions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      let url = `/api/admin/subscriptions?page=${page}&limit=${PAGE_SIZE}`;
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      const res = await adminFetch(url);
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
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
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  const fetchDropdownData = useCallback(async () => {
    try {
      const [prodRes, userRes] = await Promise.all([
        adminFetch('/api/products?all=true&limit=500'),
        adminFetch('/api/users?limit=500'),
      ]);
      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data.products || []);
      }
      if (userRes.ok) {
        const data = await userRes.json();
        setUsers(data.users || []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions(1);
    fetchDropdownData();
  }, [fetchSubscriptions, fetchDropdownData]);

  const handlePageChange = (newPage: number) => {
    fetchSubscriptions(newPage);
  };

  const handleView = (sub: Subscription) => {
    setViewSub(sub);
  };

  const handleOpenEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setEditForm({
      quantity: sub.quantity,
      frequency: sub.frequency,
      nextDeliveryDate: sub.nextDeliveryDate
        ? new Date(sub.nextDeliveryDate).toISOString().split('T')[0]
        : '',
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSub) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        quantity: editForm.quantity,
        frequency: editForm.frequency,
      };
      if (editForm.nextDeliveryDate) {
        payload.nextDeliveryDate = editForm.nextDeliveryDate;
      }

      const res = await adminFetch(
        `/api/admin/subscriptions/${editingSub.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        toast.success('Subscription updated');
        setEditOpen(false);
        fetchSubscriptions(pagination.page);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update subscription');
      }
    } catch {
      toast.error('Failed to update subscription');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.userId) {
      toast.error('Please select a user');
      return;
    }
    if (!createForm.productId) {
      toast.error('Please select a product');
      return;
    }
    if (!createForm.nextDeliveryDate) {
      toast.error('Please select a next delivery date');
      return;
    }

    setCreating(true);
    try {
      const res = await adminFetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: createForm.userId,
          productId: createForm.productId,
          quantity: createForm.quantity,
          frequency: createForm.frequency,
          nextDeliveryDate: createForm.nextDeliveryDate,
        }),
      });
      if (res.ok) {
        toast.success('Subscription created');
        setCreateOpen(false);
        setCreateForm(emptyForm);
        fetchSubscriptions(1);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to create subscription');
      }
    } catch {
      toast.error('Failed to create subscription');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusAction = async () => {
    if (!actionSubId || !actionType) return;
    setActionLoading(true);
    try {
      const res = await adminFetch(
        `/api/admin/subscriptions/${actionSubId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: actionType === 'resume' ? 'active' : actionType }),
        }
      );
      if (res.ok) {
        const actionLabel =
          actionType === 'cancel'
            ? 'cancelled'
            : actionType === 'pause'
              ? 'paused'
              : 'resumed';
        toast.success(`Subscription ${actionLabel}`);
        setActionSubId(null);
        setActionType(null);
        fetchSubscriptions(pagination.page);
      } else {
        const err = await res.json();
        toast.error(err.error || `Failed to ${actionType} subscription`);
      }
    } catch {
      toast.error(`Failed to ${actionType} subscription`);
    } finally {
      setActionLoading(false);
    }
  };

  const selectedUser = users.find((u) => u.id === createForm.userId);
  const selectedProduct = products.find(
    (p) => p.id === createForm.productId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Subscriptions
          </h2>
          <p className="text-muted-foreground">
            Manage recurring product subscriptions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSubscriptions(pagination.page)}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Subscription
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-2">
          {['all', 'active', 'paused', 'cancelled'].map((tab) => (
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
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Subscriptions Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">
              No subscriptions found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm || statusFilter !== 'all'
                ? 'No subscriptions match your criteria'
                : 'Create your first subscription to start recurring orders'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden sm:table-cell">Company</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead className="hidden sm:table-cell">Frequency</TableHead>
                  <TableHead className="hidden md:table-cell">Next Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {sub.User?.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {sub.User?.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {sub.Company?.name || '—'}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {sub.Product?.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{sub.quantity}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm capitalize">
                      {sub.frequency}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(
                        sub.nextDeliveryDate
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${statusColors[sub.status]} capitalize`}
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleView(sub)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {sub.status === 'active' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setActionSubId(sub.id);
                                setActionType('pause');
                              }}
                            >
                              <Pause className="h-4 w-4 text-amber-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setActionSubId(sub.id);
                                setActionType('cancel');
                              }}
                            >
                              <XCircle className="h-4 w-4 text-rose-600" />
                            </Button>
                          </>
                        )}
                        {sub.status === 'paused' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setActionSubId(sub.id);
                              setActionType('resume');
                            }}
                          >
                            <Play className="h-4 w-4 text-emerald-600" />
                          </Button>
                        )}
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
            Showing{' '}
            {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(
              pagination.page * pagination.limit,
              pagination.total
            )}{' '}
            of {pagination.total} subscriptions
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

      {/* View Subscription Dialog */}
      <Dialog
        open={!!viewSub}
        onOpenChange={(open) => !open && setViewSub(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Subscription Details
            </DialogTitle>
          </DialogHeader>
          {viewSub && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">User</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {viewSub.User?.name}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{viewSub.User?.email}</span>
                  </div>
                </div>
              </div>

              {viewSub.Company && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{viewSub.Company.name}</span>
                </div>
              )}

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {viewSub.Product?.name}
                  </span>
                  {viewSub.Product?.sku && (
                    <span className="text-xs text-muted-foreground font-mono">
                      SKU: {viewSub.Product.sku}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Quantity:</span>{' '}
                    {viewSub.quantity}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Frequency:</span>{' '}
                    <span className="capitalize">{viewSub.frequency}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>{' '}
                    <Badge
                      variant="secondary"
                      className={`${statusColors[viewSub.status]} capitalize text-xs`}
                    >
                      {viewSub.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Next Delivery:</span>{' '}
                  <span className="font-medium">
                    {new Date(
                      viewSub.nextDeliveryDate
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Created {new Date(viewSub.createdAt).toLocaleDateString()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setViewSub(null);
                    handleOpenEdit(viewSub);
                  }}
                >
                  Edit Subscription
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewSub(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subscription Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-qty">Quantity</Label>
              <Input
                id="edit-qty"
                type="number"
                min="1"
                value={editForm.quantity}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    quantity: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-freq">Frequency</Label>
              <Select
                value={editForm.frequency}
                onValueChange={(val) =>
                  setEditForm((prev) => ({ ...prev, frequency: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-next">Next Delivery Date</Label>
              <Input
                id="edit-next"
                type="date"
                value={editForm.nextDeliveryDate}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    nextDeliveryDate: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Subscription Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Subscription</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>
                User <span className="text-rose-500">*</span>
              </Label>
              <Popover
                open={userSearchOpen}
                onOpenChange={setUserSearchOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={userSearchOpen}
                    className="w-full justify-between"
                  >
                    {selectedUser
                      ? `${selectedUser.name} (${selectedUser.email})`
                      : 'Select a user...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search users..."
                      value={userSearch}
                      onValueChange={setUserSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No users found.</CommandEmpty>
                      <CommandGroup>
                        {users
                          .filter(
                            (u) =>
                              !userSearch ||
                              u.name
                                .toLowerCase()
                                .includes(userSearch.toLowerCase()) ||
                              u.email
                                .toLowerCase()
                                .includes(userSearch.toLowerCase())
                          )
                          .slice(0, 50)
                          .map((user) => (
                            <CommandItem
                              key={user.id}
                              value={user.id}
                              onSelect={(currentValue) => {
                                setCreateForm((prev) => ({
                                  ...prev,
                                  userId: currentValue,
                                }));
                                setUserSearchOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  createForm.userId === user.id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{user.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {user.email}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>
                Product <span className="text-rose-500">*</span>
              </Label>
              <Popover
                open={productSearchOpen}
                onOpenChange={setProductSearchOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={productSearchOpen}
                    className="w-full justify-between"
                  >
                    {selectedProduct
                      ? selectedProduct.name
                      : 'Select a product...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search products..."
                      value={productSearch}
                      onValueChange={setProductSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No products found.</CommandEmpty>
                      <CommandGroup>
                        {products
                          .filter(
                            (p) =>
                              !productSearch ||
                              p.name
                                .toLowerCase()
                                .includes(productSearch.toLowerCase()) ||
                              (p.sku &&
                                p.sku
                                  .toLowerCase()
                                  .includes(productSearch.toLowerCase()))
                          )
                          .slice(0, 50)
                          .map((product) => (
                            <CommandItem
                              key={product.id}
                              value={product.id}
                              onSelect={(currentValue) => {
                                setCreateForm((prev) => ({
                                  ...prev,
                                  productId: currentValue,
                                }));
                                setProductSearchOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  createForm.productId === product.id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{product.name}</span>
                                {product.sku && (
                                  <span className="text-xs text-muted-foreground">
                                    SKU: {product.sku}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-qty">Quantity</Label>
              <Input
                id="create-qty"
                type="number"
                min="1"
                value={createForm.quantity}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    quantity: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-freq">Frequency</Label>
              <Select
                value={createForm.frequency}
                onValueChange={(val) =>
                  setCreateForm((prev) => ({ ...prev, frequency: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-next">
                Next Delivery Date <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="create-next"
                type="date"
                value={createForm.nextDeliveryDate}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    nextDeliveryDate: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <AlertDialog
        open={!!actionSubId}
        onOpenChange={() => {
          setActionSubId(null);
          setActionType(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="capitalize">
              {actionType} Subscription
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{' '}
              {actionType === 'resume' ? 'resume' : actionType} this
              subscription?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusAction}
              disabled={actionLoading}
              className={
                actionType === 'cancel'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : actionType === 'pause'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
              }
            >
              {actionLoading
                ? 'Processing...'
                : actionType
                  ? actionType.charAt(0).toUpperCase() +
                    actionType.slice(1)
                  : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


