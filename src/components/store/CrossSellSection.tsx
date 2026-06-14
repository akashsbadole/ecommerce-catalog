'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Package, ShoppingCart, Loader2, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { getFirstImage } from '@/lib/utils';

interface BundleProduct {
  id: string;
  name: string;
  price: number;
  images: string;
}

interface Bundle {
  id: string;
  name: string;
  description: string | null;
  discountPercent: number;
  products: BundleProduct[];
  bundlePrice: number;
}

interface CrossSellSectionProps {
  productId: string;
}

export function CrossSellSection({ productId }: CrossSellSectionProps) {
  const { addToCart, auth } = useAppStore();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingBundleId, setAddingBundleId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/bundles?productId=${productId}`)
      .then((res) => (res.ok ? res.json() : { bundles: [] }))
      .then((data) => {
        if (!cancelled) setBundles(data.bundles || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [productId]);

  const handleAddBundle = async (bundle: Bundle) => {
    setAddingBundleId(bundle.id);
    let added = 0;
    let failed = 0;
    for (const p of bundle.products) {
      const ok = await addToCart(p.id, 1);
      if (ok) added++;
      else failed++;
    }
    if (added > 0) {
      toast.success(`Bundle "${bundle.name}" added to cart${failed > 0 ? ` (${failed} items failed)` : ''}`);
    } else {
      toast.error('Failed to add bundle to cart');
    }
    setAddingBundleId(null);
  };

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground animate-pulse" />
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 w-72 bg-muted rounded-xl animate-pulse shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (bundles.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Package className="h-5 w-5 text-primary" />
          Available Bundles
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {bundles.map((bundle) => {
          const totalOriginal = bundle.products.reduce((sum, p) => sum + p.price, 0);
          const isAdding = addingBundleId === bundle.id;

          return (
            <Card
              key={bundle.id}
              className="min-w-[280px] max-w-[320px] shrink-0 border-dashed hover:border-primary/50 transition-colors"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-sm leading-tight">{bundle.name}</h4>
                    {bundle.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {bundle.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="shrink-0 bg-green-100 text-green-700 border-green-200">
                    <Tag className="mr-1 h-3 w-3" />
                    {bundle.discountPercent}% OFF
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  {bundle.products.map((product) => (
                    <div key={product.id} className="flex items-center gap-2.5">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        {getFirstImage(product.images) ? (
                          <Image
                            src={getFirstImage(product.images)!}
                            alt={product.name}
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
                        <p className="text-xs font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground line-through">
                      {formatCurrency(totalOriginal)}
                    </span>
                    <p className="text-base font-bold text-primary">
                      {formatCurrency(bundle.bundlePrice)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddBundle(bundle)}
                    disabled={isAdding}
                    className="shrink-0"
                  >
                    {isAdding ? (
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                    )}
                    {isAdding ? 'Adding...' : 'Add Bundle'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

