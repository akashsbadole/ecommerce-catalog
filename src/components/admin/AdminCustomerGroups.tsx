'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Users,
  X,
  Mail,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminFetch } from '@/lib/admin-fetch';

interface CustomerGroup {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    UserGroup: number;
  };
  UserGroup: Array<{
    User: { id: string; name: string; email: string };
  }>;
}

interface GroupMember {
  id: string;
  userId: string;
  User: { id: string; name: string; email: string };
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  isActive: boolean;
}

interface GroupProduct {
  id: string;
  productId: string;
  isVisible: boolean;
  Product: Product;
}

interface CustomerGroupFormData {
  name: string;
  description: string;
  isActive: boolean;
}

const emptyForm: CustomerGroupFormData = {
  name: '',
  description: '',
  isActive: true,
};

export function AdminCustomerGroups() {
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);
  const [form, setForm] = useState<CustomerGroupFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Members management
  const [membersOpen, setMembersOpen] = useState(false);
  const [membersGroup, setMembersGroup] = useState<CustomerGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  // Product visibility management
  const [productsOpen, setProductsOpen] = useState(false);
  const [productsGroup, setProductsGroup] = useState<CustomerGroup | null>(null);
  const [groupProducts, setGroupProducts] = useState<GroupProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [togglingProduct, setTogglingProduct] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await adminFetch('/api/customer-groups');
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch {
      toast.error('Failed to load customer groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingGroup(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const handleOpenEdit = (group: CustomerGroup) => {
    setEditingGroup(group);
    setForm({
      name: group.name,
      description: group.description || '',
      isActive: group.isActive,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        isActive: form.isActive,
      };

      const url = editingGroup
        ? `/api/customer-groups/${editingGroup.id}`
        : '/api/customer-groups';
      const method = editingGroup ? 'PUT' : 'POST';

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingGroup ? 'Group updated' : 'Group created');
        setFormOpen(false);
        fetchGroups();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save group');
      }
    } catch {
      toast.error('Failed to save group');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await adminFetch(`/api/customer-groups/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Group deleted');
        setGroups((prev) => prev.filter((g) => g.id !== deleteId));
        setDeleteId(null);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete group');
      }
    } catch {
      toast.error('Failed to delete group');
    } finally {
      setDeleting(false);
    }
  };

  // Members management
  const handleOpenMembers = async (group: CustomerGroup) => {
    setMembersGroup(group);
    setMembersOpen(true);
    setLoadingMembers(true);
    setAddEmail('');
    try {
      const res = await adminFetch(`/api/customer-groups/${group.id}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch {
      toast.error('Failed to load members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleAddMember = async () => {
    if (!membersGroup || !addEmail.trim()) return;
    setAddingMember(true);
    try {
      const res = await adminFetch(`/api/customer-groups/${membersGroup.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addEmail.trim() }),
      });
      if (res.ok) {
        toast.success('Member added');
        setAddEmail('');
        handleOpenMembers(membersGroup);
        fetchGroups();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to add member');
      }
    } catch {
      toast.error('Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!membersGroup) return;
    try {
      const res = await adminFetch(`/api/customer-groups/${membersGroup.id}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Member removed');
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
        fetchGroups();
      } else {
        toast.error('Failed to remove member');
      }
    } catch {
      toast.error('Failed to remove member');
    }
  };

  // Product visibility management
  const handleOpenProducts = async (group: CustomerGroup) => {
    setProductsGroup(group);
    setProductsOpen(true);
    setLoadingProducts(true);
    setProductSearch('');
    try {
      const [groupRes, allRes] = await Promise.all([
        adminFetch(`/api/customer-groups/${group.id}/products`),
        adminFetch('/api/products?all=true'),
      ]);
      if (groupRes.ok) {
        const data = await groupRes.json();
        setGroupProducts(data.products || []);
      }
      if (allRes.ok) {
        const data = await allRes.json();
        setAllProducts(data.products || []);
      }
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleToggleProduct = async (productId: string, isVisible: boolean) => {
    if (!productsGroup) return;
    setTogglingProduct(productId);
    try {
      const res = await adminFetch(`/api/customer-groups/${productsGroup.id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, isVisible }),
      });
      if (res.ok) {
        setGroupProducts((prev) => {
          const existing = prev.find((gp) => gp.productId === productId);
          if (existing) {
            return prev.map((gp) =>
              gp.productId === productId ? { ...gp, isVisible } : gp
            );
          }
          const product = allProducts.find((p) => p.id === productId);
          if (product) {
            return [...prev, { id: `temp-${productId}`, productId, isVisible, Product: product }];
          }
          return prev;
        });
        toast.success(isVisible ? 'Product made visible' : 'Product hidden');
      } else {
        toast.error('Failed to update product visibility');
      }
    } catch {
      toast.error('Failed to update product visibility');
    } finally {
      setTogglingProduct(null);
    }
  };

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customer Groups</h2>
          <p className="text-muted-foreground mt-1">Manage customer segments and product visibility</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No customer groups found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm ? 'No groups match your search' : 'Create your first group to segment customers'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Description</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <p className="font-medium">{group.name}</p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {group.description || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {group._count?.UserGroup ?? 0} member(s)
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          group.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }
                      >
                        {group.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {new Date(group.createdAt).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Manage Members"
                          onClick={() => handleOpenMembers(group)}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Product Visibility"
                          onClick={() => handleOpenProducts(group)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => setDeleteId(group.id)}
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
              {editingGroup ? 'Edit Group' : 'Create Group'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">
                Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="group-name"
                placeholder="Group name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-desc">Description</Label>
              <Textarea
                id="group-desc"
                placeholder="Group description..."
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
              />
              <Label
                className="cursor-pointer"
                onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
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
              {saving ? 'Saving...' : editingGroup ? 'Update Group' : 'Create Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Members Dialog */}
      <Dialog open={membersOpen} onOpenChange={(open) => { setMembersOpen(open); if (!open) setMembers([]); }}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Members — {membersGroup?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add member by email..."
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                disabled={addingMember}
              />
              <Button onClick={handleAddMember} disabled={addingMember || !addEmail.trim()}>
                <Mail className="mr-2 h-4 w-4" />
                {addingMember ? 'Adding...' : 'Add'}
              </Button>
            </div>

            {loadingMembers ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No members yet</p>
            ) : (
              <ScrollArea className="max-h-64">
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {member.User.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.User.name}</p>
                          <p className="text-xs text-muted-foreground">{member.User.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-rose-600 hover:text-rose-700"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMembersOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Visibility Dialog */}
      <Dialog open={productsOpen} onOpenChange={(open) => { setProductsOpen(open); if (!open) { setGroupProducts([]); setAllProducts([]); } }}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Product Visibility — {productsGroup?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {loadingProducts ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <ScrollArea className="max-h-96">
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="w-32 text-center">Visible</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => {
                        const groupProduct = groupProducts.find((gp) => gp.productId === product.id);
                        const isVisible = groupProduct?.isVisible ?? false;
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium">{product.name}</p>
                                {product.sku && (
                                  <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant={isVisible ? 'default' : 'outline'}
                                size="sm"
                                disabled={togglingProduct === product.id}
                                onClick={() => handleToggleProduct(product.id, !isVisible)}
                                className={isVisible ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                              >
                                {togglingProduct === product.id ? (
                                  '...'
                                ) : isVisible ? (
                                  <><Check className="mr-1 h-3 w-3" /> Visible</>
                                ) : (
                                  'Hidden'
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {filteredProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No products found</p>
                )}
              </ScrollArea>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this group? Members will be removed but their accounts will remain active.
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
