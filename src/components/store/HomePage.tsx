'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ArrowRight, ShoppingCart, ChevronLeft, ChevronRight, Star, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EnquiryModal } from './EnquiryModal';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  link: string | null;
  linkText: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
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

interface HomePageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [enquiryProduct, setEnquiryProduct] = useState<Product | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [bannersRes, productsRes, categoriesRes] = await Promise.all([
        fetch('/api/banners'),
        fetch('/api/products?featured=true'),
        fetch('/api/categories'),
      ]);

      if (bannersRes.ok) {
        const data = await bannersRes.json();
        setBanners(data.banners || []);
      }
      if (productsRes.ok) {
        const data = await productsRes.json();
        setFeaturedProducts(data.products || []);
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch home page data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // SEO: set document title and meta description
  useEffect(() => {
    document.title = 'StyleStore - Premium Products';
    let metaEl = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaEl) {
      metaEl = document.createElement('meta');
      metaEl.setAttribute('name', 'description');
      document.head.appendChild(metaEl);
    }
    metaEl.setAttribute('content', 'Discover premium products at StyleStore. Wholesale and B2B pricing available. Browse our curated collection of electronics, accessories and more.');

    // JSON-LD: WebSite structured data
    const websiteJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'StyleStore',
      url: typeof window !== 'undefined' ? window.location.origin : '',
      description: 'Premium Products & B2B Wholesale',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: typeof window !== 'undefined' ? `${window.location.origin}/catalogue?search={search_term_string}` : '',
        },
        'query-input': 'required name=search_term_string',
      },
    };

    const orgJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'StyleStore',
      description: 'Premium Products & B2B Wholesale Supplier',
      url: typeof window !== 'undefined' ? window.location.origin : '',
      logo: typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        availableLanguage: ['English'],
      },
    };

    const injectScript = (id: string, data: Record<string, unknown>) => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      script.id = id;
      document.head.appendChild(script);
    };

    injectScript('homepage-website-jsonld', websiteJsonLd);
    injectScript('homepage-org-jsonld', orgJsonLd);

    return () => {
      const el1 = document.getElementById('homepage-website-jsonld');
      const el2 = document.getElementById('homepage-org-jsonld');
      if (el1) el1.remove();
      if (el2) el2.remove();
    };
  }, []);

  // Auto-rotate banner
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const getFirstImage = (images: string) => {
    try {
      const arr = JSON.parse(images);
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    } catch {
      return null;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Banner Carousel */}
      <section aria-label="Promotional banners">
        {loading ? (
          <Skeleton className="h-64 w-full rounded-xl md:h-80 lg:h-96" />
        ) : banners.length > 0 ? (
          <div className="relative overflow-hidden rounded-xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentBanner * 100}%)` }}
            >
              {banners.map((banner) => (
                <div key={banner.id} className="w-full shrink-0">
                  <div className="relative flex min-h-[256px] items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 md:min-h-[320px] lg:min-h-[384px]">
                    {banner.image && (
                      <Image
                        src={banner.image}
                        alt={banner.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}
                    {!banner.image && (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800" />
                    )}
                    <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
                      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        {banner.title}
                      </h1>
                      {banner.subtitle && (
                        <p className="mt-4 text-lg text-white/90 sm:text-xl">
                          {banner.subtitle}
                        </p>
                      )}
                      {banner.linkText && (
                        <Button
                          size="lg"
                          className="mt-6 bg-white text-emerald-700 hover:bg-white/90"
                          onClick={() => {
                            onNavigate('catalogue');
                          }}
                        >
                          {banner.linkText}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {banners.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md backdrop-blur-sm transition-colors hover:bg-white"
                  aria-label="Previous banner"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-800" />
                </button>
                <button
                  onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md backdrop-blur-sm transition-colors hover:bg-white"
                  aria-label="Next banner"
                >
                  <ChevronRight className="h-5 w-5 text-gray-800" />
                </button>
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBanner(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentBanner ? 'w-8 bg-white' : 'w-2 bg-white/50'
                      }`}
                      aria-label={`Go to banner ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="relative flex min-h-[256px] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 md:min-h-[320px]">
            <div className="text-center text-white">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Welcome to StyleStore
              </h1>
              <p className="mt-4 text-lg text-white/90">
                Discover our curated collection of premium products
              </p>
              <Button
                size="lg"
                className="mt-6 bg-white text-emerald-700 hover:bg-white/90"
                onClick={() => onNavigate('catalogue')}
              >
                Browse Catalogue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Category Highlights */}
      {!loading && categories.length > 0 && (
        <section aria-label="Product categories">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Shop by Category</h2>
              <p className="text-sm text-muted-foreground mt-1">Find what you&apos;re looking for</p>
            </div>
            <Button
              variant="ghost"
              className="text-sm text-emerald-600"
              onClick={() => onNavigate('catalogue')}
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.slice(0, 8).map((category) => (
              <button
                key={category.id}
                onClick={() => onNavigate('catalogue')}
                className="group"
              >
                <Card className="overflow-hidden py-0 gap-0 transition-shadow hover:shadow-md">
                  <div className="relative aspect-square bg-muted">
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                        <ShoppingCart className="h-8 w-8 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="font-medium text-sm">{category.name}</h3>
                    {category.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section aria-label="Featured products">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured Products</h2>
            <p className="text-sm text-muted-foreground mt-1">Hand-picked selections for you</p>
          </div>
          <Button
            variant="ghost"
            className="text-sm text-emerald-600"
            onClick={() => onNavigate('catalogue')}
          >
            See All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden py-0 gap-0">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No featured products available yet.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => onNavigate('catalogue')}
            >
              Browse Catalogue
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.map((product) => {
              const image = getFirstImage(product.images);
              const hasDiscount = product.comparePrice && product.comparePrice > product.price;
              const discountPercent = hasDiscount
                ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
                : 0;
              const hasWholesale = !!product.wholesalePrice;

              return (
                <Card
                  key={product.id}
                  className="group overflow-hidden py-0 gap-0 transition-shadow hover:shadow-lg cursor-pointer"
                  onClick={() => onNavigate('product', product.id)}
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
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
                    {product.isFeatured && (
                      <Badge variant="secondary" className="absolute top-3 right-3 bg-amber-100 text-amber-800">
                        <Star className="mr-1 h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    {product.Category && (
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {product.Category.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {product.name}
                    </h3>
                    {product.shortDescription && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {product.shortDescription}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-lg font-bold text-emerald-600">
                        {formatPrice(product.price)}
                      </span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>
                    {hasWholesale && (
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                        Wholesale: {formatPrice(product.wholesalePrice!)}
                      </p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEnquiryProduct(product);
                        }}
                      >
                        Enquire
                      </Button>
                      {hasWholesale && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-950/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEnquiryProduct(product);
                          }}
                        >
                          <Hash className="mr-1 h-3 w-3" />
                          Quote
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-center text-white sm:p-12">
        <h2 className="text-2xl font-bold sm:text-3xl">Have Questions?</h2>
        <p className="mt-3 max-w-lg mx-auto text-white/90">
          Our team is here to help you find the perfect products. Reach out to us today
          and let us assist you with your needs.
        </p>
        <Button
          size="lg"
          className="mt-6 bg-white text-emerald-700 hover:bg-white/90"
          onClick={() => onNavigate('contact')}
        >
          Contact Us
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>

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
    </div>
  );
}
