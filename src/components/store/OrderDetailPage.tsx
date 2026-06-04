'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ShoppingCart,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  shippingName: string | null;
  shippingEmail: string | null;
  shippingPhone: string | null;
  shippingAddress: string | null;
  billingName: string | null;
  billingEmail: string | null;
  billingAddress: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    productId: string;
    name: string;
    sku: string | null;
    price: number;
    quantity: number;
    total: number;
    images: string;
  }[];
}

interface OrderDetailPageProps {
  orderId: string;
  onNavigate: (page: string, data?: unknown) => void;
}

function getFirstImage(images: string): string | null {
  try {
    const arr = JSON.parse(images);
    return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
  } catch {
    return null;
  }
}

function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-amber-500" />;
    case 'confirmed':
    case 'processing':
      return <Package className="h-4 w-4 text-blue-500" />;
    case 'shipped':
      return <Truck className="h-4 w-4 text-purple-500" />;
    case 'delivered':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-800';
    case 'confirmed':
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function OrderDetailPage({ orderId, onNavigate }: OrderDetailPageProps) {
  const { auth, settings, addToCart } = useAppStore();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);

  const currency = settings?.currency || 'USD';

  useEffect(() => {
    if (!auth.token) return;
    setLoading(true);
    fetch(`/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
      .then((res) => res.json())
      .then((data) => setOrder(data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [auth.token, orderId]);

  const handleCancel = async () => {
    if (!auth.token || !order) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        toast.success('Order cancelled successfully');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to cancel order');
      }
    } catch {
      toast.error('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = async () => {
    if (!order || !auth.token) return;
    setReordering(true);
    let added = 0;
    let failed = 0;
    try {
      for (const item of order.items) {
        const success = await addToCart(item.productId, item.quantity);
        if (success) added++;
        else failed++;
      }
      if (added > 0) {
        toast.success(`${added} item(s) added to cart${failed > 0 ? ` (${failed} failed)` : ''}`);
        onNavigate('cart');
      } else {
        toast.error('Failed to add items to cart');
      }
    } catch {
      toast.error('Failed to re-order');
    } finally {
      setReordering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-3xl mx-auto">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Order Not Found</h1>
        <Button className="mt-6" onClick={() => onNavigate('orders')}>
          View All Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('orders')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(order.status)}>
          {getStatusIcon(order.status)}
          <span className="ml-1 capitalize">{order.status}</span>
        </Badge>
      </div>

      {/* Order Status Timeline */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map(
              (status, idx) => {
                const isActive =
                  ['pending', 'confirmed', 'processing', 'shipped', 'delivered'].indexOf(
                    order.status
                  ) >= idx;
                return (
                  <div key={status} className="flex flex-col items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-xs capitalize ${
                        isActive ? 'font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item) => {
            const image = getFirstImage(item.images);
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {image ? (
                    <Image
                      src={image}
                      alt={item.name}
                      fill
                      className="object-cover"

                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.name}</p>
                  {item.sku && (
                    <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity} x {formatPrice(item.price, currency)}
                  </p>
                </div>
                <span className="font-bold text-sm">{formatPrice(item.total, currency)}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost, currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatPrice(order.tax, currency)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.total, currency)}</span>
            </div>
            {order.paymentMethod && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Status</span>
              <Badge
                variant="outline"
                className={
                  order.paymentStatus === 'paid'
                    ? 'text-green-600 border-green-300'
                    : ''
                }
              >
                {order.paymentStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipping Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {order.shippingName && (
              <p>
                <span className="text-muted-foreground">Name: </span>
                {order.shippingName}
              </p>
            )}
            {order.shippingEmail && (
              <p>
                <span className="text-muted-foreground">Email: </span>
                {order.shippingEmail}
              </p>
            )}
            {order.shippingPhone && (
              <p>
                <span className="text-muted-foreground">Phone: </span>
                {order.shippingPhone}
              </p>
            )}
            {order.shippingAddress && (
              <p>
                <span className="text-muted-foreground">Address: </span>
                {order.shippingAddress}
              </p>
            )}
            {order.notes && (
              <div className="mt-2">
                <span className="text-muted-foreground">Notes: </span>
                <p className="mt-1 text-muted-foreground italic">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {order.status !== 'cancelled' && (
          <Button
            variant="outline"
            onClick={handleReorder}
            disabled={reordering}
          >
            {reordering ? (
              'Adding to cart...'
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Re-order
              </>
            )}
          </Button>
        )}
        {order.status === 'pending' && (
          <Button
            variant="outline"
            className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        )}
      </div>
    </div>
  );
}
