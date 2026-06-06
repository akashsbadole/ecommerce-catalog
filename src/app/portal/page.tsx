'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  Building2,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  User as UserIcon,
  ShieldCheck,
  Send,
  ArrowRightLeft,
  XCircle,
  FileEdit,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/pricing';

interface QuoteItem {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  quantity: number;
  total: number;
}

interface Quote {
  id: string;
  quoteNumber: string;
  status: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  validUntil: string | null;
  notes: string | null;
  createdAt: string;
  items: QuoteItem[];
}

const quoteStatusColors: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  converted: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

export default function BuyerPortalPage() {
  const { auth, navigate, settings } = useAppStore();
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.user) {
      navigate('home');
      return;
    }

    async function fetchPortalData() {
      try {
        const [enquiriesRes, quotesRes] = await Promise.all([
          fetch(`/api/enquiries?userId=${auth.user?.id}`, {
            headers: { 'Authorization': `Bearer ${auth.token}` }
          }),
          fetch(`/api/quotes?limit=10`, {
            headers: { 'Authorization': `Bearer ${auth.token}` }
          }),
        ]);
        if (enquiriesRes.ok) {
          const data = await enquiriesRes.json();
          setEnquiries(data.enquiries || []);
        }
        if (quotesRes.ok) {
          const data = await quotesRes.json();
          setQuotes(data.quotes || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPortalData();
  }, [auth.user, auth.token, navigate]);

  if (!auth.user) return null;

  const activeQuotes = quotes.filter(q => ['draft', 'sent'].includes(q.status));
  const recentQuotes = quotes.slice(0, 5);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buyer Portal</h1>
          <p className="text-muted-foreground">Welcome back, {auth.user.name}. Manage your business account, quotes, and enquiries.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('catalogue')}>
            <Package className="mr-2 h-4 w-4" />
            Browse Products
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => navigate('catalogue')}>
            <FileText className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{auth.user.isVerified ? 'Verified' : 'Pending'}</span>
              <Badge variant={auth.user.isVerified ? 'default' : 'secondary'} className={auth.user.isVerified ? 'bg-emerald-500' : ''}>
                {auth.user.isVerified ? 'B2B Partner' : 'Standard'}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Pricing Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold capitalize">{auth.user.tier || 'Standard'}</span>
              {auth.user.tier && auth.user.tier !== 'standard' && (
                <Badge className="bg-amber-500 text-white">Active Discount</Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileEdit className="h-4 w-4 text-blue-500" />
              Active Quotes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeQuotes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-500" />
              Enquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enquiries.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent Quotes */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileEdit className="h-5 w-5" />
              Recent Quotes
            </CardTitle>
            <CardDescription>Your quote requests and their status.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : recentQuotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileEdit className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>No quotes yet.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('catalogue')}>
                  Browse Products
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentQuotes.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-medium font-mono">{quote.quoteNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {quote.items.length} item(s) &middot; {formatPrice(quote.total, quote.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className={`${quoteStatusColors[quote.status]} capitalize`}>
                      {quote.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Enquiries */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Recent Enquiries
            </CardTitle>
            <CardDescription>Track the status of your recent requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : enquiries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-20" />
                <p>No enquiries found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {enquiries.slice(0, 5).map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{e.subject}</p>
                      <p className="text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={e.status === 'new' ? 'secondary' : 'default'} className="capitalize">
                      {e.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Update your company details for faster quoting.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{auth.user.companyName || 'No Company Name'}</p>
                  <p className="text-xs text-muted-foreground">Tax ID: {auth.user.taxId || 'Not provided'}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span>{auth.user.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Verified Status</span>
                  <span className={auth.user.isVerified ? 'text-emerald-600' : 'text-amber-600'}>
                    {auth.user.isVerified ? 'Verified Partner' : 'Verification Required'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={() => navigate('account')}>
                <UserIcon className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
