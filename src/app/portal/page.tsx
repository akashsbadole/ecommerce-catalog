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
  ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function BuyerPortalPage() {
  const { auth, navigate, settings } = useAppStore();
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.user) {
      navigate('home');
      return;
    }

    async function fetchPortalData() {
      try {
        const res = await fetch(`/api/enquiries?userId=${auth.user?.id}`, {
          headers: { 'Authorization': `Bearer ${auth.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEnquiries(data.enquiries || []);
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

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buyer Portal</h1>
          <p className="text-muted-foreground">Welcome back, {auth.user.name}. Manage your business account and enquiries.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('catalogue')}>
            <Package className="mr-2 h-4 w-4" />
            Browse Products
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <FileText className="mr-2 h-4 w-4" />
            New RFQ
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
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
              <Clock className="h-4 w-4 text-emerald-500" />
              Active Enquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enquiries.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent Enquiries */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Enquiries & Quotes</CardTitle>
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
              <div className="space-y-4">
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

        {/* Profile Info */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Update your company details for faster quoting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <Button variant="outline" className="w-full mt-4">
              <UserIcon className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
