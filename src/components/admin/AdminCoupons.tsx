'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  Percent,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { adminFetch } from '@/lib/admin-fetch';

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface CouponFormData {
  code: string;
  type: string;
  value: number;
  minOrder: number;
  maxUses: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

const emptyForm: CouponFormData = {
  code: '',
  type: 'percentage',
  value: 0,
  minOrder: 0,
  maxUses: '',
  startsAt: '',
  expiresAt: '',
  isActive: true,
};

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk action state
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await adminFetch('/api/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCoupons.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCoupons.map((c) => c.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      const res = await adminFetch('/api/coupons/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action: 'delete' }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        setSelectedIds([]);
        fetchCoupons();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Bulk delete failed');
      }
    } catch {
      toast.error('Bulk delete failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.minOrder,
      maxUses: coupon.maxUses !== null ? String(coupon.maxUses) : '',
      startsAt: coupon.startsAt
        ? new Date(coupon.startsAt).toISOString().split('T')[0]
        : '',
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().split('T')[0]
        : '',
      isActive: coupon.isActive,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    if (form.value <= 0) {
      toast.error('Value must be greater than 0');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: form.value,
        minOrder: form.minOrder,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        startsAt: form.startsAt || null,
        expiresAt: form.expiresAt || null,
        isActive: form.isActive,
      };

      const url = editingCoupon
        ? `/api/coupons/${editingCoupon.id}`
        : '/api/coupons';
      const method = editingCoupon ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingCoupon ? 'Coupon updated' : 'Coupon created');
        setFormOpen(false);
        fetchCoupons();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save coupon');
      }
    } catch {
      toast.error('Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await adminFetch(`/api/coupons/${deleteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Coupon deleted');
        setCoupons((prev) => prev.filter((c) => c.id !== deleteId));
        setDeleteId(null);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete coupon');
      }
    } catch {
      toast.error('Failed to delete coupon');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString();
  };

  const formatValue = (coupon: Coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}%`;
    }
    return `$${coupon.value.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Coupons</h2>
          <p className="text-muted-foreground mt-1">
            Manage discount coupons for your store
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search coupons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-48"
          />
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <Card className="p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-sm font-medium">
            {selectedIds.length} coupon(s) selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={bulkLoading}
              className="text-rose-600 hover:text-rose-700"
              onClick={handleBulkDelete}
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Delete Selected
            </Button>
          </div>
        </Card>
      )}

      {/* Coupons Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Tag className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No coupons found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery
                ? 'No coupons match your search'
                : 'Create your first coupon to offer discounts'}
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
                        selectedIds.length === filteredCoupons.length &&
                        filteredCoupons.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Value</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Min Order
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Usage
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Valid Period
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(coupon.id)}
                        onCheckedChange={() => toggleSelect(coupon.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                        {coupon.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {coupon.type === 'percentage' ? (
                          <Percent className="h-3 w-3" />
                        ) : (
                          <DollarSign className="h-3 w-3" />
                        )}
                        {coupon.type === 'percentage' ? 'Percentage' : 'Flat'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="font-medium">{formatValue(coupon)}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {coupon.minOrder > 0
                        ? `$${coupon.minOrder.toFixed(2)}`
                        : '—'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {coupon.maxUses !== null
                        ? `${coupon.usedCount} / ${coupon.maxUses}`
                        : `${coupon.usedCount} / ∞`}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {formatDate(coupon.startsAt)} — {formatDate(coupon.expiresAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          coupon.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(coupon)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => setDeleteId(coupon.id)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="coupon-code">
                Coupon Code <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="coupon-code"
                placeholder="e.g. SUMMER20"
                value={form.code}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                The code customers will enter. Auto-converted to uppercase.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="coupon-type">Discount Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(val) =>
                    setForm((prev) => ({ ...prev, type: val }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="flat">Flat Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupon-value">
                  Value <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="coupon-value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.value || ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      value: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder={
                    form.type === 'percentage' ? 'e.g. 10' : 'e.g. 5.00'
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {form.type === 'percentage'
                    ? 'Percentage off the order'
                    : 'Fixed dollar amount off'}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="coupon-min-order">Minimum Order Amount</Label>
                <Input
                  id="coupon-min-order"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minOrder || ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      minOrder: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupon-max-uses">Max Uses (optional)</Label>
                <Input
                  id="coupon-max-uses"
                  type="number"
                  min="1"
                  value={form.maxUses}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, maxUses: e.target.value }))
                  }
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="coupon-starts">Start Date</Label>
                <Input
                  id="coupon-starts"
                  type="date"
                  value={form.startsAt}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, startsAt: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupon-expires">End Date</Label>
                <Input
                  id="coupon-expires"
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, expiresAt: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label
                className="cursor-pointer"
                onClick={() =>
                  setForm((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
              >
                Active
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving
                ? 'Saving...'
                : editingCoupon
                  ? 'Update Coupon'
                  : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this coupon? This action cannot be
              undone. Customers will no longer be able to use this code.
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
