'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  CreditCard,
  Truck,
  CheckCircle,
  ShoppingBag,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';

interface CheckoutPageProps {
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

export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const { cart, auth, fetchCart, settings } = useAppStore();
  const [placing, setPlacing] = useState(false);

  const currency = settings?.currency || 'USD';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };
  const [step, setStep] = useState<'shipping' | 'review' | 'success'>('shipping');
  const [orderNumber, setOrderNumber] = useState('');

  // Shipping form
  const [shippingName, setShippingName] = useState('');
  const [shippingEmail, setShippingEmail] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (auth.token) {
      fetchCart();
    }
  }, [auth.token, fetchCart]);

  useEffect(() => {
    if (auth.user) {
      setShippingName(auth.user.name || '');
      setShippingEmail(auth.user.email || '');
    }
  }, [auth.user]);

  const handlePlaceOrder = async () => {
    if (!auth.token || cart.items.length === 0) return;

    if (!shippingName || !shippingEmail || !shippingAddress) {
      toast.error('Please fill in all required shipping fields');
      return;
    }

    setPlacing(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          shippingName,
          shippingEmail,
          shippingPhone,
          shippingAddress,
          paymentMethod: 'manual',
          notes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrderNumber(data.order.orderNumber);
        setStep('success');
        fetchCart(); // Refresh cart (should be empty now)
        toast.success('Order placed successfully!');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to place order');
      }
    } catch {
      toast.error('Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (!auth.token) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="mt-2 text-muted-foreground">
          Please log in to proceed with checkout
        </p>
        <Button className="mt-6" onClick={() => onNavigate('home')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  if (cart.items.length === 0 && step !== 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Cart is Empty</h1>
        <p className="mt-2 text-muted-foreground">
          Add some products to your cart before checking out.
        </p>
        <Button className="mt-6" onClick={() => onNavigate('catalogue')}>
          Browse Catalogue
        </Button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold">Order Placed Successfully!</h1>
        <p className="mt-2 text-muted-foreground max-w-md">
          Your order <span className="font-semibold">{orderNumber}</span> has
          been placed. Our team will review it and get back to you shortly.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => onNavigate('orders')}>
            View My Orders
          </Button>
          <Button variant="outline" onClick={() => onNavigate('catalogue')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('cart')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Checkout</h1>
          <p className="text-sm text-muted-foreground">
            {step === 'shipping' ? 'Shipping Information' : 'Review Your Order'}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 'shipping'
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            1
          </div>
          <span className={step === 'shipping' ? 'font-medium' : 'text-muted-foreground'}>
            Shipping
          </span>
        </div>
        <div className="w-12 h-px bg-border" />
        <div className="flex items-center gap-2">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 'review'
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            2
          </div>
          <span className={step === 'review' ? 'font-medium' : 'text-muted-foreground'}>
            Review
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 'shipping' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingEmail}
                      onChange={(e) => setShippingEmail(e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Shipping Address *</Label>
                  <Textarea
                    id="address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Street address, city, state, ZIP code, country"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions for your order"
                    rows={2}
                  />
                </div>
                <Button onClick={() => setStep('review')}>
                  Continue to Review
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'review' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Review Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Shipping Summary */}
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold text-sm mb-2">Shipping To</h3>
                  <p className="text-sm">{shippingName}</p>
                  <p className="text-sm text-muted-foreground">{shippingEmail}</p>
                  {shippingPhone && (
                    <p className="text-sm text-muted-foreground">{shippingPhone}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {shippingAddress}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => setStep('shipping')}
                  >
                    Edit
                  </Button>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Order Items</h3>
                  {cart.items.map((item) => {
                    const image = getFirstImage(item.Product.images);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                          {image ? (
                            <Image
                              src={image}
                              alt={item.Product.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {item.Product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-bold">
                          {formatPrice(item.Product.price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep('shipping')}>
                    Back
                  </Button>
                  <Button onClick={handlePlaceOrder} disabled={placing}>
                    {placing ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-2">
                      {item.Product.name} x{item.quantity}
                    </span>
                    <span className="font-medium shrink-0">
                      {formatPrice(item.Product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(cart.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg text-primary">
                    {formatPrice(cart.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
