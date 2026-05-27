'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  FolderOpen,
  MessageSquare,
  ImageIcon,
  BarChart3,
  Star,
  Clock,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EnquiryRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  type: string;
  status: string;
  createdAt: string;
  product?: { id: string; name: string } | null;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  read: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  replied: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  closed: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
};

export function AdminDashboardHome({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalCategories: 0,
    newEnquiries: 0,
    totalEnquiries: 0,
    totalBanners: 0,
  });
  const [recentEnquiries, setRecentEnquiries] = useState<EnquiryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [productsRes, categoriesRes, enquiriesRes, bannersRes] = await Promise.all([
          fetch('/api/products?all=true'),
          fetch('/api/categories?all=true'),
          fetch('/api/enquiries'),
          fetch('/api/banners?all=true'),
        ]);

        if (!cancelled && productsRes.ok) {
          const d = await productsRes.json();
          const prods = d.products || [];
          setStats(prev => ({
            ...prev,
            totalProducts: prods.length,
            activeProducts: prods.filter((p: { isActive: boolean }) => p.isActive).length,
          }));
        }
        if (!cancelled && categoriesRes.ok) {
          const d = await categoriesRes.json();
          setStats(prev => ({
            ...prev,
            totalCategories: d.categories?.length || 0,
          }));
        }
        if (!cancelled && enquiriesRes.ok) {
          const d = await enquiriesRes.json();
          const all = d.enquiries || [];
          setStats(prev => ({
            ...prev,
            totalEnquiries: all.length,
            newEnquiries: all.filter((e: { status: string }) => e.status === 'new').length,
          }));
          setRecentEnquiries(all.slice(0, 5));
        }
        if (!cancelled && bannersRes.ok) {
          const d = await bannersRes.json();
          setStats(prev => ({
            ...prev,
            totalBanners: d.banners?.length || 0,
          }));
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Active Products', value: stats.activeProducts, icon: BarChart3, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/40' },
    { label: 'Categories', value: stats.totalCategories, icon: FolderOpen, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/40' },
    { label: 'New Enquiries', value: stats.newEnquiries, icon: MessageSquare, color: 'bg-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Total Enquiries', value: stats.totalEnquiries, icon: Star, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40' },
    { label: 'Banners', value: stats.totalBanners, icon: ImageIcon, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/40' },
  ];

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const quickActions = [
    { id: 'products', label: 'Manage Products', icon: Package },
    { id: 'categories', label: 'Manage Categories', icon: FolderOpen },
    { id: 'enquiries', label: 'View Enquiries', icon: MessageSquare },
    { id: 'banners', label: 'Manage Banners', icon: ImageIcon },
    { id: 'settings', label: 'Site Settings', icon: Star },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Overview of your store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.bg}`}>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Enquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Enquiries</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-600"
              onClick={() => onNavigate?.('enquiries')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentEnquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No enquiries yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEnquiries.map((eq) => (
                    <TableRow key={eq.id}>
                      <TableCell className="font-medium">{eq.name}</TableCell>
                      <TableCell className="hidden sm:table-cell max-w-[180px] truncate">
                        {eq.subject}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusColors[eq.status] || ''}
                        >
                          {eq.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {formatDate(eq.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Navigate to different sections using the sidebar or click a shortcut below.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant="outline"
                    size="sm"
                    className="h-auto flex-col gap-2 py-4"
                    onClick={() => onNavigate?.(action.id)}
                  >
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
