'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  CreditCard,
  Truck,
  CheckCircle,
  ShoppingBag,
  Package,
  Wallet,
  Banknote,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAppStore } from '@/lib/store';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: { error: { description: string } }) => void) => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

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
  const razorpayEnabled = settings?.payment_razorpay_enabled === 'true';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };
  const [step, setStep] = useState<'shipping' | 'review' | 'success'>('shipping');
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'manual' | 'razorpay'>('manual');
  const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null);

  // Shipping form
  const [shippingName, setShippingName] = useState('');
  const [shippingEmail, setShippingEmail] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const shippingInitialized = useRef(false);

  useEffect(() => {
    if (auth.token) {
      fetchCart();
    }
  }, [auth.token, fetchCart]);

  useEffect(() => {
    if (auth.user && !shippingInitialized.current) {
      shippingInitialized.current = true;
      setShippingName(auth.user.name || '');
      setShippingEmail(auth.user.email || '');
    }
  }, [auth.user]);

  // Load Razorpay script
  useEffect(() => {
    if (razorpayEnabled && !document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [razorpayEnabled]);

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) return;

    if (!shippingName || !shippingEmail || !shippingAddress) {
      toast.error('Please fill in all required shipping fields');
      return;
    }

    // Guest checkout flow
    if (!auth.token) {
      setPlacing(true);
      try {
        const guestItems = cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.Product.price,
        }));

        const res = await fetch('/api/orders/guest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: guestItems,
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
          // Clear guest cart
          try { localStorage.removeItem('guest_cart'); } catch { /* ignore */ }
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
      return;
    }

    // Authenticated checkout flow
    if (paymentMethod === 'razorpay' && razorpayEnabled) {
      // Razorpay flow: create order first, then open Razorpay
      setPlacing(true);
      try {
        const res = await fetch('/api/payment/razorpay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            amount: cart.total,
            currency,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || 'Failed to create payment');
          setPlacing(false);
          return;
        }

        const orderData = await res.json();
        setRazorpayKeyId(orderData.keyId);

        // Open Razorpay checkout
        const options: RazorpayOptions = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: settings?.site_title || 'Store',
          description: `Order - ${cart.items.length} items`,
          order_id: orderData.orderId,
          handler: async (response: RazorpayResponse) => {
            // Payment successful, now place the order
            try {
              const orderRes = await fetch('/api/orders', {
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
                  paymentMethod: 'razorpay',
                  paymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  notes,
                }),
              });

              if (orderRes.ok) {
                const data = await orderRes.json();
                setOrderNumber(data.order.orderNumber);
                setStep('success');
                fetchCart();
                toast.success('Payment successful! Order placed.');
              } else {
                toast.error('Order placement failed after payment');
              }
            } catch {
              toast.error('Order placement failed after payment');
            }
            setPlacing(false);
          },
          prefill: {
            name: shippingName,
            email: shippingEmail,
            contact: shippingPhone || undefined,
          },
          theme: {
            color: '#3b82f6',
          },
          modal: {
            ondismiss: () => {
              setPlacing(false);
              toast.info('Payment cancelled');
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', (response: { error: { description: string } }) => {
          toast.error(`Payment failed: ${response.error.description}`);
          setPlacing(false);
        });
        razorpay.open();
      } catch {
        toast.error('Failed to initialize payment');
        setPlacing(false);
      }
    } else {
      // Manual payment flow (existing)
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
          fetchCart();
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
    }
  };

  if (!auth.token && cart.items.length === 0 && step !== 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="mt-2 text-muted-foreground">
          Your cart is empty. Add some products before checking out.
        </p>
        <Button className="mt-6" onClick={() => onNavigate('catalogue')}>
          Browse Catalogue
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

                {/* Payment Method */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Payment Method</h3>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as 'manual' | 'razorpay')}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2 rounded-lg border p-3">
                      <RadioGroupItem value="manual" id="pay-manual" />
                      <Label htmlFor="pay-manual" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Banknote className="h-4 w-4" />
                        <div>
                          <p className="font-medium text-sm">Manual Payment</p>
                          <p className="text-xs text-muted-foreground">Pay later via bank transfer or other method</p>
                        </div>
                      </Label>
                    </div>
                    {razorpayEnabled && (
                      <div className="flex items-center space-x-2 rounded-lg border p-3">
                        <RadioGroupItem value="razorpay" id="pay-razorpay" />
                        <Label htmlFor="pay-razorpay" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Wallet className="h-4 w-4" />
                          <div>
                            <p className="font-medium text-sm">Razorpay</p>
                            <p className="text-xs text-muted-foreground">Pay online via cards, UPI, or net banking</p>
                          </div>
                        </Label>
                      </div>
                    )}
                  </RadioGroup>
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
                    {placing
                      ? 'Processing...'
                      : paymentMethod === 'razorpay'
                        ? 'Pay & Place Order'
                        : 'Place Order'}
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
