'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';
import { getFirstImage } from '@/lib/utils';
import { formatPrice as libFormatPrice } from '@/lib/pricing';

interface WishlistPageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export function WishlistPage({ onNavigate }: WishlistPageProps) {
  const { wishlist, auth, fetchWishlist, removeFromWishlist, addToCart, settings } = useAppStore();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const currency = settings?.currency || 'USD';

  const formatPrice = (price: number) => {
    return libFormatPrice(price, currency);
  };

  useEffect(() => {
    if (auth.token) {
      fetchWishlist();
    }
  }, [auth.token, fetchWishlist]);

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    const success = await addToCart(productId);
    if (success) {
      toast.success('Added to cart');
    } else {
      toast.error('Failed to add to cart');
    }
    setAddingToCart(null);
  };

  const handleRemove = async (productId: string) => {
    await removeFromWishlist(productId);
    toast.success('Removed from wishlist');
  };

  if (!auth.token) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Your Wishlist</h1>
        <p className="mt-2 text-muted-foreground">
          Please log in to view your wishlist
        </p>
        <Button className="mt-6" onClick={() => onNavigate('home')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  if (wishlist.loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (wishlist.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Your Wishlist is Empty</h1>
        <p className="mt-2 text-muted-foreground max-w-md">
          Save products you love to your wishlist. Review them anytime and
          easily move them to your cart.
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
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('home')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-sm text-muted-foreground">
            {wishlist.itemCount} {wishlist.itemCount === 1 ? 'item' : 'items'} saved
          </p>
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {wishlist.items.map((item) => {
          const image = getFirstImage(item.Product.images);
          const hasDiscount =
            item.Product.comparePrice &&
            item.Product.comparePrice > item.Product.price;
          const discountPercent = hasDiscount
            ? Math.round(
                ((item.Product.comparePrice! - item.Product.price) /
                  item.Product.comparePrice!) *
                  100
              )
            : 0;

          return (
            <Card
              key={item.id}
              className="group overflow-hidden py-0 gap-0 transition-shadow hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                <button onClick={() => onNavigate('product', item.productId)}>
                  {image ? (
                    <Image
                      src={image}
                      alt={item.Product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"

                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                </button>
                {hasDiscount && (
                  <Badge className="absolute top-2 left-2 bg-rose-500 text-white">
                    -{discountPercent}%
                  </Badge>
                )}
                {item.Product.isFeatured && (
                  <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 bg-amber-100 text-amber-800"
                  >
                    Featured
                  </Badge>
                )}
                {/* Remove button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
                  onClick={() => handleRemove(item.productId)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                </Button>
              </div>

              {/* Details */}
              <CardContent className="p-4 space-y-2">
                {item.Product.Category && (
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    {item.Product.Category.name}
                  </span>
                )}
                <button
                  onClick={() => onNavigate('product', item.productId)}
                  className="block text-sm font-semibold line-clamp-1 hover:text-primary transition-colors text-left"
                >
                  {item.Product.name}
                </button>
                {item.Product.shortDescription && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.Product.shortDescription}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(item.Product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(item.Product.comparePrice!)}
                    </span>
                  )}
                </div>
                <Button
                  className="w-full"
                  size="sm"
                  disabled={addingToCart === item.productId || item.Product.stock === 0}
                  onClick={() => handleAddToCart(item.productId)}
                >
                  <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                  {item.Product.stock === 0
                    ? 'Out of Stock'
                    : addingToCart === item.productId
                    ? 'Adding...'
                    : 'Add to Cart'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
