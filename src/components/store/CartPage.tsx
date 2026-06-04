'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingCart,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';

interface CartPageProps {
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

export function CartPage({ onNavigate }: CartPageProps) {
  const { cart, auth, fetchCart, updateCartItem, removeFromCart, clearCart, settings } = useAppStore();
  const [updating, setUpdating] = useState<string | null>(null);

  const currency = settings?.currency || 'USD';
  const currencySymbol = settings?.currency_symbol || '$';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  useEffect(() => {
    if (auth.token) {
      fetchCart();
    }
  }, [auth.token, fetchCart]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    setUpdating(itemId);
    await updateCartItem(itemId, newQuantity);
    setUpdating(null);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
    toast.success('Item removed from cart');
  };

  const handleClearCart = async () => {
    await clearCart();
    toast.success('Cart cleared');
  };

  if (!auth.token) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <p className="mt-2 text-muted-foreground">
          Please log in to view your cart
        </p>
        <Button className="mt-6" onClick={() => onNavigate('home')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  if (cart.loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
        <p className="mt-2 text-muted-foreground max-w-md">
          Looks like you haven&apos;t added any products to your cart yet.
          Browse our catalogue to find something you love.
        </p>
        <Button className="mt-6" onClick={() => onNavigate('catalogue')}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Browse Catalogue
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate('home')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Shopping Cart</h1>
            <p className="text-sm text-muted-foreground">
              {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
          onClick={handleClearCart}
        >
          <Trash2 className="mr-1 h-3 w-3" />
          Clear Cart
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {cart.items.map((item) => {
            const image = getFirstImage(item.Product.images);
            const hasDiscount =
              item.Product.comparePrice &&
              item.Product.comparePrice > item.Product.price;

            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4 flex gap-4">
                  {/* Image */}
                  <button
                    onClick={() => onNavigate('product', item.productId)}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted"
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt={item.Product.name}
                        fill
                        className="object-cover"

                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </button>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => onNavigate('product', item.productId)}
                      className="text-sm font-semibold hover:text-primary transition-colors line-clamp-1 text-left"
                    >
                      {item.Product.name}
                    </button>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-primary">
                        {formatPrice(item.Product.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(item.Product.comparePrice!)}
                        </span>
                      )}
                    </div>
                    {item.Product.stock <= item.Product.minOrderQty && item.Product.stock > 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        Only {item.Product.stock} left in stock
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-rose-500"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <div className="flex items-center border rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={updating === item.id || item.quantity <= 1}
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {updating === item.id ? '...' : item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={
                          updating === item.id ||
                          item.quantity >= item.Product.stock
                        }
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="text-sm font-bold">
                      {formatPrice(item.Product.price * item.quantity)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
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
              <Button
                className="w-full mt-6"
                size="lg"
                onClick={() => onNavigate('checkout')}
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => onNavigate('catalogue')}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
