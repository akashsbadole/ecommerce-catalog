'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Clock, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { getFirstImage } from '@/lib/utils';
import { formatPrice } from '@/lib/pricing';

interface ViewedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string;
  viewedAt: number;
}

const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 10;

export function getRecentlyViewed(): ViewedProduct[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function trackProductView(product: { id: string; name: string; slug: string; price: number; images: string }) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentlyViewed();
    const filtered = existing.filter((p) => p.id !== product.id);
    const updated = [
      { ...product, viewedAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch { /* ignore */ }
}

interface RecentlyViewedProductsProps {
  onNavigate: (page: string, data?: unknown) => void;
  currentProductId?: string;
}

export function RecentlyViewedProducts({ onNavigate, currentProductId }: RecentlyViewedProductsProps) {
  const [products, setProducts] = useState<ViewedProduct[]>([]);
  const { addToCart, auth } = useAppStore();

  useEffect(() => {
    const items = getRecentlyViewed().filter(
      (p) => !currentProductId || p.id !== currentProductId
    );
    setProducts(items);
  }, [currentProductId]);

  if (products.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Recently Viewed</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => {
          const image = getFirstImage(product.images);
          return (
            <div
              key={product.id}
              className="group rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onNavigate('product', product.id)}
            >
              <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                {image ? (
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-2">{product.name}</p>
                <p className="text-sm font-bold mt-1">{formatPrice(product.price)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
