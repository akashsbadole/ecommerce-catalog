'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  FolderOpen,
  MessageSquare,
  ImageIcon,
  BarChart3,
  Star,
  Search,
  Clock,
  Eye,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminFetch } from '@/lib/admin-fetch';
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
import { DashboardCharts } from '@/components/admin/DashboardCharts';

interface EnquiryRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  type: string;
  status: string;
  createdAt: string;
  Product?: { id: string; name: string } | null;
}

interface DashboardStats {
  productStats: {
    total: number;
    active: number;
    featured: number;
    categories: number;
  };
  enquiryStats: {
    thisWeek: number;
    lastWeek: number;
    total: number;
    newCount: number;
    rfqCount: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    entity: string | null;
    entityId: string | null;
    userName: string | null;
    createdAt: string;
  }>;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  read: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  replied: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  closed: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
};

export function AdminDashboardHome({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEnquiries, setRecentEnquiries] = useState<EnquiryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Fetch dashboard stats from the new unified endpoint
        const statsRes = await adminFetch('/api/dashboard/stats');
        if (statsRes.ok && !cancelled) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch recent enquiries (still need full enquiry data for the table)
        const enquiriesRes = await adminFetch('/api/enquiries');
        if (enquiriesRes.ok && !cancelled) {
          const d = await enquiriesRes.json();
          const all: EnquiryRow[] = d.enquiries || [];
          setRecentEnquiries(all.slice(0, 5));
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

  const statCards = stats
    ? [
        { label: 'Total Products', value: stats.productStats.total, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
        { label: 'Active Products', value: stats.productStats.active, icon: BarChart3, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/40' },
        { label: 'Categories', value: stats.productStats.categories, icon: FolderOpen, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/40' },
        { label: 'New Enquiries', value: stats.enquiryStats.newCount, icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
        { label: 'Total Enquiries', value: stats.enquiryStats.total, icon: Star, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40' },
        { label: 'RFQ Requests', value: stats.enquiryStats.rfqCount, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/40' },
      ]
    : [];

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
    { id: 'settings', label: 'Settings', icon: Star },
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

      {/* Dashboard Charts (Enquiry Trends + Quick Stats) */}
      <DashboardCharts />

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
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={`${action.id}-${index}`}
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
