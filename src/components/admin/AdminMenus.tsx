'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  GripVertical,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { adminFetch } from '@/lib/admin-fetch';

interface MenuItem {
  id: string;
  label: string;
  slug: string;
  parentId: string | null;
  parent?: { id: string; label: string } | null;
  externalUrl: string | null;
  page: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  children?: MenuItem[];
}

interface MenuFormData {
  label: string;
  slug: string;
  parentId: string;
  externalUrl: string;
  page: string;
  order: string;
  isActive: boolean;
}

const emptyForm: MenuFormData = {
  label: '',
  slug: '',
  parentId: '__none__',
  externalUrl: '',
  page: '__none__',
  order: '0',
  isActive: true,
};

const pageOptions = [
  { value: 'home', label: 'Home' },
  { value: 'catalogue', label: 'Catalogue' },
  { value: 'contact', label: 'Contact' },
  { value: 'blog', label: 'Blog' },
  { value: 'portal', label: 'Portal' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminMenus() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/menus');
      if (!res.ok) throw new Error('Failed to load menus');
      const data = await res.json();
      setMenus(data.menus || []);
    } catch {
      toast.error('Failed to load menus');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleNameChange = (label: string) => {
    if (!editingMenu) {
      setForm((prev) => ({ ...prev, label, slug: slugify(label) }));
    } else {
      setForm((prev) => ({ ...prev, label }));
    }
  };

  const openCreate = () => {
    setEditingMenu(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (menu: MenuItem) => {
    setEditingMenu(menu);
    setForm({
      label: menu.label,
      slug: menu.slug,
      parentId: menu.parentId || '__none__',
      externalUrl: menu.externalUrl || '',
      page: menu.page || '__none__',
      order: String(menu.order),
      isActive: menu.isActive,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.label.trim()) {
      toast.error('Label is required');
      return;
    }
    if (!form.slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        label: form.label,
        slug: form.slug,
        parentId: form.parentId === '__none__' ? null : form.parentId,
        externalUrl: form.externalUrl || null,
        page: form.page === '__none__' ? null : form.page,
        order: parseInt(form.order) || 0,
        isActive: form.isActive,
      };

      if (editingMenu) {
        const res = await adminFetch(`/api/menus/${editingMenu.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to update menu');
        }
        toast.success('Menu updated');
      } else {
        const res = await adminFetch('/api/menus', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to create menu');
        }
        toast.success('Menu created');
      }
      setFormOpen(false);
      fetchMenus();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save menu';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await adminFetch(`/api/menus/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete menu');
      toast.success('Menu deleted');
      setDeleteConfirm(null);
      fetchMenus();
    } catch {
      toast.error('Failed to delete menu');
    }
  };

  const flattenMenus = (items: MenuItem[], depth = 0): (MenuItem & { depth: number })[] => {
    const result: (MenuItem & { depth: number })[] = [];
    for (const item of items) {
      result.push({ ...item, depth });
      if (item.children?.length) {
        result.push(...flattenMenus(item.children, depth + 1));
      }
    }
    return result;
  };

  const getParentOptions = (items: MenuItem[], excludeId?: string): { id: string; label: string }[] => {
    const result: { id: string; label: string }[] = [];
    const walk = (list: MenuItem[], depth = 0) => {
      for (const item of list) {
        if (item.id !== excludeId) {
          result.push({ id: item.id, label: `${'  '.repeat(depth)}${item.label}` });
          if (item.children?.length) walk(item.children, depth + 1);
        }
      }
    };
    walk(items);
    return result;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Menus</h2>
          <p className="text-muted-foreground">Manage your navigation menus</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchMenus} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Menu
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : menus.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <GripVertical className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No menus yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create your first navigation menu item</p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Menu
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Label</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flattenMenus(menus).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <span style={{ marginLeft: `${item.depth * 16}px` }} className="font-medium">
                      {item.depth > 0 && <span className="text-muted-foreground mr-1">└</span>}
                      {item.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.slug}</TableCell>
                  <TableCell>
                    {item.externalUrl ? (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                        <ExternalLink className="h-3 w-3" /> External
                      </span>
                    ) : item.page ? (
                      <Badge variant="outline">{item.page}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>{item.order}</TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? 'default' : 'secondary'}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(item.id)}>
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMenu ? 'Edit Menu' : 'Add Menu'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="menu-label">
                  Label <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="menu-label"
                  placeholder="Menu label"
                  value={form.label}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="menu-slug">
                  Slug <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="menu-slug"
                  placeholder="menu-slug"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="menu-parent">Parent Menu</Label>
                <Select
                  value={form.parentId}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, parentId: val }))}
                >
                  <SelectTrigger id="menu-parent">
                    <SelectValue placeholder="No parent (top level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No parent (top level)</SelectItem>
                    {getParentOptions(menus, editingMenu?.id).map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="menu-order">Order</Label>
                <Input
                  id="menu-order"
                  type="number"
                  placeholder="0"
                  value={form.order}
                  onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="menu-page">Internal Page</Label>
                <Select
                  value={form.page}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, page: val }))}
                >
                  <SelectTrigger id="menu-page">
                    <SelectValue placeholder="None (use URL below)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {pageOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="menu-url">External URL</Label>
                <Input
                  id="menu-url"
                  placeholder="https://example.com"
                  value={form.externalUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, externalUrl: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="menu-active"
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="menu-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingMenu ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this menu item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
