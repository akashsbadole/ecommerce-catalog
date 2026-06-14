'use client';

import { useState, useEffect } from 'react';
import {
  RefreshCw,
  Plus,
  Pause,
  Play,
  XCircle,
  ShoppingCart,
  Calendar,
  Package,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/pricing';

interface Subscription {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  frequency: string;
  nextDeliveryDate: string;
  status: string;
  price: number;
  currency: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string;
  stock: number;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'paused':
      return 'bg-amber-100 text-amber-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function SubscriptionsPage({ onNavigate: _onNavigate }: { onNavigate?: (page: string, data?: unknown) => void } = {}) {
  const { auth, settings, addToCart } = useAppStore();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [frequency, setFrequency] = useState('weekly');
  const [nextDelivery, setNextDelivery] = useState('');
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const currency = settings?.currency || 'USD';

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch('/api/subscriptions', {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.token) { setLoading(false); return; }
    fetchSubscriptions();
  }, [auth.token]);

  const handleSearchProducts = async (query: string) => {
    setProductSearch(query);
    if (query.length < 2) return;
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=10`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch {
      // ignore
    }
  };

  const handleCreateSubscription = async () => {
    if (!selectedProduct || !nextDelivery) return;
    setCreating(true);
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity,
          frequency,
          nextDeliveryDate: nextDelivery,
        }),
      });
      if (res.ok) {
        toast.success('Subscription created successfully');
        setCreateOpen(false);
        resetCreateForm();
        fetchSubscriptions();
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

  const resetCreateForm = () => {
    setSelectedProduct(null);
    setProductSearch('');
    setProducts([]);
    setQuantity(1);
    setFrequency('weekly');
    setNextDelivery('');
  };

  const handleAction = async (subscriptionId: string, action: string) => {
    setActionLoading(subscriptionId);
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === subscriptionId ? { ...s, ...data.subscription } : s))
        );
        toast.success(`Subscription ${action}ed successfully`);
      } else {
        const err = await res.json();
        toast.error(err.error || `Failed to ${action} subscription`);
      }
    } catch {
      toast.error(`Failed to ${action} subscription`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReorder = async (sub: Subscription) => {
    const success = await addToCart(sub.productId, sub.quantity);
    if (success) {
      toast.success(`${sub.productName} added to cart`);
      const { navigate } = useAppStore.getState();
      navigate('cart');
    } else {
      toast.error('Failed to add item to cart');
    }
  };

  if (!auth.token) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <RefreshCw className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">My Subscriptions</h1>
        <p className="mt-2 text-muted-foreground">Please log in to view your subscriptions</p>
        <Button className="mt-6" onClick={() => useAppStore.getState().navigate('home')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Subscriptions</h1>
          <p className="text-sm text-muted-foreground">Manage your recurring deliveries</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Subscription
        </Button>
      </div>

      {/* Empty State */}
      {subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <RefreshCw className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold">No Subscriptions Yet</h2>
          <p className="mt-2 text-muted-foreground max-w-md">
            Set up recurring deliveries for your favourite products.
          </p>
          <Button className="mt-6" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Subscription
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {subscriptions.map((sub) => (
            <Card key={sub.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{sub.productName}</h3>
                      <Badge className={getStatusColor(sub.status)}>
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Qty: {sub.quantity}</span>
                      <span>Frequency: {sub.frequency}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Next: {new Date(sub.nextDeliveryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-1">
                      {formatPrice(sub.price * sub.quantity, sub.currency || currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReorder(sub)}
                    >
                      <ShoppingCart className="mr-1 h-3 w-3" />
                      Reorder Now
                    </Button>
                    {sub.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(sub.id, 'pause')}
                        disabled={actionLoading === sub.id}
                      >
                        <Pause className="mr-1 h-3 w-3" />
                        Pause
                      </Button>
                    )}
                    {sub.status === 'paused' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(sub.id, 'resume')}
                        disabled={actionLoading === sub.id}
                      >
                        <Play className="mr-1 h-3 w-3" />
                        Resume
                      </Button>
                    )}
                    {sub.status !== 'cancelled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                        onClick={() => handleAction(sub.id, 'cancel')}
                        disabled={actionLoading === sub.id}
                      >
                        <XCircle className="mr-1 h-3 w-3" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Subscription Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Subscription</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Product Search */}
            <div className="space-y-2">
              <Label>Product</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => handleSearchProducts(e.target.value)}
                />
              </div>
              {products.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-md border">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-muted ${
                        selectedProduct?.id === p.id ? 'bg-muted font-medium' : ''
                      }`}
                      onClick={() => {
                        setSelectedProduct(p);
                        setProductSearch(p.name);
                        setProducts([]);
                      }}
                    >
                      {p.name} - {formatPrice(p.price, currency)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="sub-qty">Quantity</Label>
              <Input
                id="sub-qty"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label htmlFor="sub-freq">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger id="sub-freq">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Next Delivery Date */}
            <div className="space-y-2">
              <Label htmlFor="sub-date">Next Delivery Date</Label>
              <Input
                id="sub-date"
                type="date"
                value={nextDelivery}
                onChange={(e) => setNextDelivery(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubscription} disabled={creating || !selectedProduct || !nextDelivery}>
              {creating ? 'Creating...' : 'Create Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
