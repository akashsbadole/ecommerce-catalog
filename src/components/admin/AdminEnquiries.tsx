'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Eye,
  Trash2,
  RefreshCw,
  MessageSquare,
  Mail,
  Phone,
  Package,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  type: string;
  status: string;
  productId: string | null;
  createdAt: string;
  updatedAt: string;
  product?: { id: string; name: string } | null;
}

const statusTabs = ['all', 'new', 'read', 'replied', 'closed'];

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  read: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  replied: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  closed: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
};

const typeColors: Record<string, string> = {
  product: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  contact: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
};

export function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [viewEnquiry, setViewEnquiry] = useState<Enquiry | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEnquiries = useCallback(async () => {
    try {
      let url = '/api/enquiries';
      if (activeFilter !== 'all') {
        url += `?status=${activeFilter}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        let items = data.enquiries || [];
        if (searchTerm) {
          const lower = searchTerm.toLowerCase();
          items = items.filter(
            (e: Enquiry) =>
              e.name.toLowerCase().includes(lower) ||
              e.email.toLowerCase().includes(lower) ||
              e.subject.toLowerCase().includes(lower)
          );
        }
        setEnquiries(items);
      }
    } catch {
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchTerm]);

  useEffect(() => {
    setLoading(true);
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleViewEnquiry = (enquiry: Enquiry) => {
    setViewEnquiry(enquiry);
    setStatusUpdate(enquiry.status);
    // Auto mark as read
    if (enquiry.status === 'new') {
      updateStatus(enquiry.id, 'read');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setEnquiries(prev =>
          prev.map(e => (e.id === id ? { ...e, status } : e))
        );
        if (viewEnquiry && viewEnquiry.id === id) {
          setViewEnquiry(prev => (prev ? { ...prev, status } : null));
        }
      }
    } catch {
      // ignore
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusUpdate(newStatus);
    if (viewEnquiry) {
      updateStatus(viewEnquiry.id, newStatus);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/enquiries/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Enquiry deleted');
        setEnquiries(prev => prev.filter(e => e.id !== deleteId));
        setDeleteId(null);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete enquiry');
      }
    } catch {
      toast.error('Failed to delete enquiry');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatShortDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enquiries</h2>
          <p className="text-muted-foreground mt-1">View and manage customer enquiries</p>
        </div>
        <Button variant="outline" onClick={() => { setLoading(true); fetchEnquiries(); }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
        {statusTabs.map((tab) => (
          <Button
            key={tab}
            variant={activeFilter === tab ? 'default' : 'ghost'}
            size="sm"
            className="capitalize whitespace-nowrap"
            onClick={() => setActiveFilter(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Enquiries Table */}
      <Card>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : enquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No enquiries found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeFilter !== 'all' || searchTerm
                ? 'Try adjusting your filters'
                : 'Enquiries from customers will appear here'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Subject</TableHead>
                  <TableHead className="hidden lg:table-cell">Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enquiries.map((enq) => (
                  <TableRow key={enq.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{enq.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {enq.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {enq.email}
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                      {enq.subject}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge
                        variant="secondary"
                        className={typeColors[enq.type] || ''}
                      >
                        {enq.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[enq.status] || ''}
                      >
                        {enq.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {formatShortDate(enq.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewEnquiry(enq)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => setDeleteId(enq.id)}
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

      {/* View Enquiry Dialog */}
      <Dialog open={!!viewEnquiry} onOpenChange={() => setViewEnquiry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewEnquiry?.subject}</DialogTitle>
          </DialogHeader>
          {viewEnquiry && (
            <div className="space-y-4">
              {/* Status Selector */}
              <div className="flex items-center gap-3">
                <Label>Status</Label>
                <Select value={statusUpdate} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{viewEnquiry.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {viewEnquiry.email}
                </div>
                {viewEnquiry.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {viewEnquiry.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDate(viewEnquiry.createdAt)}
                </div>
              </div>

              {/* Type & Product */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className={typeColors[viewEnquiry.type] || ''}
                >
                  {viewEnquiry.type}
                </Badge>
                {viewEnquiry.product && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {viewEnquiry.product.name}
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Message */}
              <div>
                <Label className="mb-2 block">Message</Label>
                <div className="rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">
                  {viewEnquiry.message}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewEnquiry(null)}>
              Close
            </Button>
            <Button
              variant="outline"
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={() => {
                if (viewEnquiry) {
                  setDeleteId(viewEnquiry.id);
                  setViewEnquiry(null);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Enquiry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this enquiry? This action cannot be undone.
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
