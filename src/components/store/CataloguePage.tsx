'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Search, ShoppingCart, X, SlidersHorizontal, Hash, Package, Eye, GitCompareArrows } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EnquiryModal } from './EnquiryModal';
import { QuickViewModal } from './QuickViewModal';
import { useAppStore } from '@/lib/store';
import { calculateTieredPrice, formatPrice as libFormatPrice } from '@/lib/pricing';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: number;
  comparePrice: number | null;
  wholesalePrice: number | null;
  minOrderQty: number;
  images: string;
  Category: { id: string; name: string } | null;
  isFeatured: boolean;
}

interface CataloguePageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export function CataloguePage({ onNavigate }: CataloguePageProps) {
  const { auth, settings, addToCompare, isInCompare, removeFromCompare } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [enquiryProduct, setEnquiryProduct] = useState<Product | null>(null);
  const [enquiryMode, setEnquiryMode] = useState<'enquire' | 'rfq'>('enquire');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState('featured');

  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Derived values
  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount]
  );
  const hasMore = visibleCount < products.length;

  // Reset visible count when search/filter changes
  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, selectedCategory, sortBy]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory) params.set('categoryId', selectedCategory);
      if (sortBy && sortBy !== 'featured') params.set('sort', sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // SEO: set document title and meta description on mount
  useEffect(() => {
    const siteName = settings?.site_name || 'StyleStore';
    document.title = `Product Catalogue | ${siteName}`;
    let metaEl = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaEl) {
      metaEl = document.createElement('meta');
      metaEl.setAttribute('name', 'description');
      document.head.appendChild(metaEl);
    }
    metaEl.setAttribute('content', `Browse our complete catalogue of premium products. Wholesale and bulk pricing available for B2B orders.`);
  }, [settings]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setLoadingMore(true);
          // Small delay to feel like loading
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 12, products.length));
            setLoadingMore(false);
          }, 300);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, products.length]);

  const getFirstImage = (images: string) => {
    try {
      const arr = JSON.parse(images);
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    } catch {
      return null;
    }
  };

  const userTier = auth.user?.tier;

  const formatPrice = (price: number) => {
    return libFormatPrice(price, settings?.currency || 'USD');
  };

  const getEffectivePrice = (basePrice: number) => {
    const isTieredEnabled = settings?.b2b_enable_tiered_pricing === 'true';
    if (!isTieredEnabled) return basePrice;
    return calculateTieredPrice(basePrice, userTier);
  };

  const handleEnquiryClick = (product: Product, mode: 'enquire' | 'rfq') => {
    setEnquiryMode(mode);
    setEnquiryProduct(product);
  };

  const handleQuickView = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  const buildCompareProduct = (product: Product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    comparePrice: product.comparePrice,
    images: product.images,
    stock: 0,
    sku: null,
    description: null,
    shortDescription: product.shortDescription,
    minOrderQty: product.minOrderQty,
    Category: product.Category,
  });

  const handleCompareToggle = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
    } else {
      addToCompare(buildCompareProduct(product));
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Page Header */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight">Product Catalogue</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our complete collection of premium products
        </p>
      </section>

      {/* Search and Filters */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort:</span>
            <Select
              value={sortBy}
              onValueChange={(val) => setSortBy(val)}
            >
              <SelectTrigger className="w-[150px] h-8 text-sm">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="name_asc">Name: A-Z</SelectItem>
                <SelectItem value="name_desc">Name: Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      {categories.length > 0 && (
        <section className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? 'bg-primary hover:bg-primary/80 text-white' : ''}
          >
            All Products
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={selectedCategory === cat.id ? 'bg-primary hover:bg-primary/80 text-white' : ''}
            >
              {cat.name}
            </Button>
          ))}
        </section>
      )}

      {/* Results Count */}
      {!loading && products.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min(visibleCount, products.length)} of {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden py-0 gap-0">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No products found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search or filter to find what you&apos;re looking for.
          </p>
          <div className="flex gap-2 justify-center mt-4">
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
            {selectedCategory && (
              <Button
                variant="outline"
                onClick={() => setSelectedCategory(null)}
              >
                Clear Filter
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => {
              const image = getFirstImage(product.images);
              const hasDiscount = product.comparePrice && product.comparePrice > product.price;
              const discountPercent = hasDiscount
                ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
                : 0;
              const hasMOQ = product.minOrderQty > 1;
              const hasWholesale = !!product.wholesalePrice;

              return (
                <Card
                  key={product.id}
                  className="group overflow-hidden py-0 gap-0 transition-shadow hover:shadow-lg"
                >
                  <div
                    className="relative aspect-square overflow-hidden bg-muted cursor-pointer"
                    onClick={() => onNavigate('product', product.id)}
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"

                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <ShoppingCart className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    {hasDiscount && (
                      <Badge className="absolute top-3 left-3 bg-rose-500 text-white">
                        -{discountPercent}%
                      </Badge>
                    )}
                    {/* MOQ badge */}
                    {hasMOQ && (
                      <Badge variant="secondary" className="absolute top-3 right-3 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                        <Package className="mr-1 h-3 w-3" />
                        MOQ: {product.minOrderQty}
                      </Badge>
                    )}
                    {/* Quick View Button — appears on hover */}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute bottom-3 right-3 h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
                      onClick={(e) => handleQuickView(product, e)}
                      aria-label={`Quick view ${product.name}`}
                    >
                      <Eye className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                    </Button>
                    {/* Compare Button */}
                    <Button
                      variant="secondary"
                      size="icon"
                      className={`absolute bottom-3 right-14 h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md ${
                        isInCompare(product.id)
                          ? 'bg-primary text-white hover:bg-primary/80'
                          : 'bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800'
                      }`}
                      onClick={(e) => handleCompareToggle(product, e)}
                      aria-label={isInCompare(product.id) ? `Remove ${product.name} from compare` : `Add ${product.name} to compare`}
                    >
                      <GitCompareArrows className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    {product.Category && (
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {product.Category.name}
                      </span>
                    )}
                    <h3
                      className="font-semibold text-sm line-clamp-1 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => onNavigate('product', product.id)}
                    >
                      {product.name}
                    </h3>
                    {product.shortDescription && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {product.shortDescription}
                      </p>
                    )}
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(getEffectivePrice(product.price))}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.comparePrice!)}
                          </span>
                        )}
                      </div>
                      {settings?.b2b_enable_tiered_pricing === 'true' && userTier && userTier !== 'standard' && (
                        <p className="text-[10px] font-medium text-primary">Tier price applied</p>
                      )}
                    </div>
                    {/* Wholesale price display */}
                    {hasWholesale && (
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                        Wholesale: {formatPrice(product.wholesalePrice!)}
                        {hasMOQ && (
                          <span className="text-muted-foreground font-normal">
                            {' '}· Min. {product.minOrderQty} units
                          </span>
                        )}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => onNavigate('product', product.id)}
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/80 text-white"
                        onClick={() => handleEnquiryClick(product, 'enquire')}
                      >
                        Enquire
                      </Button>
                    </div>
                    {hasWholesale && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-950/30"
                        onClick={() => handleEnquiryClick(product, 'rfq')}
                      >
                        <Hash className="mr-1.5 h-3.5 w-3.5" />
                        Request Quote
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Infinite Scroll / Load More */}
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-8">
              <Button
                variant="outline"
                onClick={() => {
                  setLoadingMore(true);
                  setTimeout(() => {
                    setVisibleCount((prev) => Math.min(prev + 12, products.length));
                    setLoadingMore(false);
                  }, 300);
                }}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
          {!hasMore && products.length > 12 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              All {products.length} products loaded
            </p>
          )}
        </>
      )}

      {/* Enquiry Modal */}
      {enquiryProduct && (
        <EnquiryModal
          productName={enquiryProduct.name}
          productId={enquiryProduct.id}
          open={!!enquiryProduct}
          onOpenChange={(open) => {
            if (!open) setEnquiryProduct(null);
          }}
        />
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          open={!!quickViewProduct}
          onOpenChange={(open) => {
            if (!open) setQuickViewProduct(null);
          }}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}
