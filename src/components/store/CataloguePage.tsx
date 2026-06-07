'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Search, ShoppingCart, X, Info, Package, Eye, GitCompareArrows, Download, ArrowRight, Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
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
import { getFirstImage } from '@/lib/utils';

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
  description: string | null;
  price: number;
  comparePrice: number | null;
  wholesalePrice: number | null;
  minOrderQty: number;
  images: string;
  Category: { id: string; name: string; slug?: string } | null;
  isFeatured: boolean;
  specifications?: string | null;
}

interface CataloguePageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

const defaultCategoryInfo: Record<string, { tags: string[]; desc: string }> = {
  khakhra: { tags: ['12+ variants', 'Private label'], desc: 'Thin, crispy, roasted flatbreads available in a wide range of flavours and spice levels. One of our flagship lines — highest daily output capacity. Ideal for B2B, retail brands and private label.' },
  bhakhri: { tags: ['8+ varieties'], desc: 'Traditional recipes with modern automation. Consistent thickness and crunch across batches. Available in multiple grain compositions.' },
  makhana: { tags: ['6+ flavours', 'PL ready'], desc: 'Specialised roasting and flavouring line for fox nuts. Light, crispy finish with even coating across all flavour variants.' },
  extruder: { tags: ['10+ shapes'], desc: 'High-speed extrusion for puffed and shaped snacks. Custom shapes and textures achievable for private label clients.' },
  digestive: { tags: ['5+ varieties'], desc: 'Baked digestive biscuits and health-focused snacks. Formulations customisable for target nutrition profiles.' },
};

const packagingOptions = [
  { title: 'Purva Bites branded', desc: 'Ready-branded packs for distributors, modern trade and institutional buyers', tag: 'Distributor friendly', highlight: false },
  { title: 'Your brand / private label', desc: 'Send your artwork — we print, pack and ship under your brand identity. No minimums disclosed publicly.', tag: 'Private label', highlight: true },
  { title: 'Bulk / institutional', desc: '5kg, 10kg, 25kg formats for canteens, hotels, airlines and govt procurement', tag: 'Bulk format', highlight: false },
];

const categoryTabs = [
  { id: 'all', label: 'All products' },
  { id: 'khakhra', label: 'Khakhra' },
  { id: 'bhakhri', label: 'Bhakhri' },
  { id: 'makhana', label: 'Makhana' },
  { id: 'extruder', label: 'Extruder' },
  { id: 'digestive', label: 'Digestive' },
];

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

  // Inline enquiry form state
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    category: '',
    orderType: '',
    quantity: '',
    message: '',
  });
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);

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

  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    }
    loadCategories();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // SEO
  useEffect(() => {
    const siteName = settings?.site_name || 'My Store';
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

  const userTier = auth.user?.tier;

  const formatPrice = (price: number) => {
    return libFormatPrice(price, settings?.currency || 'USD');
  };

  const getEffectivePrice = (basePrice: number) => {
    const isTieredEnabled = settings?.b2b_enable_tiered_pricing === 'true';
    if (!isTieredEnabled) return basePrice;
    return calculateTieredPrice(basePrice, userTier, settings || undefined);
  };

  const handleEnquiryClick = (product: Product, mode: 'enquire' | 'rfq') => {
    setEnquiryMode(mode);
    setEnquiryProduct(product);
  };

  const handleQuickView = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  const handleCompareToggle = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
    } else {
      addToCompare({
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
    }
  };

  const handleInlineEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryForm.name || !enquiryForm.phone) {
      toast.error('Please fill in your name and phone number');
      return;
    }
    setEnquirySubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: enquiryForm.name,
          email: enquiryForm.email || null,
          phone: enquiryForm.phone,
          subject: `Bulk/Private Label Enquiry${enquiryForm.category ? ` - ${enquiryForm.category}` : ''}`,
          message: [
            enquiryForm.company ? `Company: ${enquiryForm.company}` : '',
            enquiryForm.category ? `Product category: ${enquiryForm.category}` : '',
            enquiryForm.orderType ? `Order type: ${enquiryForm.orderType}` : '',
            enquiryForm.quantity ? `Approx. qty/month: ${enquiryForm.quantity}` : '',
            enquiryForm.message,
          ].filter(Boolean).join('\n'),
          type: 'product',
        }),
      });
      if (res.ok) {
        toast.success('Enquiry submitted! Our team will respond within 24 hours.', { icon: <Check className="h-4 w-4 text-primary" /> });
        setEnquiryForm({ name: '', company: '', phone: '', email: '', category: '', orderType: '', quantity: '', message: '' });
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit enquiry');
      }
    } catch {
      toast.error('Failed to submit enquiry. Please try again.');
    } finally {
      setEnquirySubmitting(false);
    }
  };

  // Build category info from API categories + defaults
  const getCategoryInfo = (cat: Category) => {
    const slug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
    const defaults = defaultCategoryInfo[slug];
    return {
      name: cat.name,
      tags: defaults?.tags || ['Available'],
      desc: cat.description || defaults?.desc || `Explore our range of ${cat.name} products.`,
    };
  };

  const activeCategoryInfo = useMemo(() => {
    if (!selectedCategory) return null;
    const cat = categories.find(c => c.id === selectedCategory);
    if (!cat) return null;
    return getCategoryInfo(cat);
  }, [selectedCategory, categories]);

  const matchedCategoryTab = useMemo(() => {
    if (!selectedCategory) return null;
    const cat = categories.find(c => c.id === selectedCategory);
    if (!cat) return null;
    const slug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
    return categoryTabs.find(t => t.id === slug) || null;
  }, [selectedCategory, categories]);

  return (
    <div className="flex flex-col">
      {/* B2B Notice Banner */}
      <section className="bg-muted/40 py-3 px-4">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            <button onClick={() => onNavigate('home')} className="hover:text-foreground transition-colors">Home</button>
            <span className="mx-1.5">›</span>
            <span>Catalogue</span>
          </p>
          <div className="flex items-center gap-2 bg-background border rounded px-3 py-1.5">
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">We do not sell retail. All orders are B2B, bulk & trade only.</span>
          </div>
        </div>
      </section>

      {/* Search and Sort Bar */}
      <section className="border-b py-4 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(12); }}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setVisibleCount(12); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort:</span>
              <Select value={sortBy} onValueChange={(val) => { setSortBy(val); setVisibleCount(12); }}>
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
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-5 px-4 border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2 flex-wrap">
              {categoryTabs.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setVisibleCount(12);
                    if (cat.id === 'all') {
                      setSelectedCategory(null);
                    } else {
                      const matchCat = categories.find(c => (c.slug || c.name.toLowerCase().replace(/\s+/g, '-')) === cat.id);
                      setSelectedCategory(matchCat?.id || null);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    (cat.id === 'all' && !selectedCategory) || matchedCategoryTab?.id === cat.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {!loading && (
              <p className="text-xs text-muted-foreground">
                Showing {Math.min(visibleCount, products.length)} of {products.length} products
                {activeCategoryInfo ? ` in ${activeCategoryInfo.name}` : ''}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Category Hero Strip */}
      {activeCategoryInfo && (
        <section className="bg-muted/40 py-6 px-4">
          <div className="container mx-auto max-w-6xl flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:w-32 h-24 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
              Category photo
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold">{activeCategoryInfo.name}</h2>
                {activeCategoryInfo.tags.map((tag) => (
                  <span key={tag} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded">{tag}</span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{activeCategoryInfo.desc}</p>
            </div>
            <button onClick={() => onNavigate('contact')} className="text-sm border rounded-full px-4 py-2 whitespace-nowrap hover:bg-muted transition-colors">
              Enquire for this category →
            </button>
          </div>
        </section>
      )}

      {/* Product Grid */}
      <section className="py-10 px-4">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border rounded-xl overflow-hidden">
                  <Skeleton className="h-32 w-full" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No products found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search or filter to find what you&apos;re looking for.
              </p>
              <div className="flex gap-2 justify-center mt-4">
                {searchQuery && (
                  <Button variant="outline" onClick={() => { setSearchQuery(''); setVisibleCount(12); }}>
                    Clear Search
                  </Button>
                )}
                {selectedCategory && (
                  <Button variant="outline" onClick={() => { setSelectedCategory(null); setVisibleCount(12); }}>
                    Clear Filter
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {visibleProducts.map((product) => {
                  const image = getFirstImage(product.images);
                  const tags: string[] = [];
                  if (product.Category) tags.push(product.Category.name);
                  if (product.isFeatured) tags.push('Featured');

                  return (
                    <div key={product.id} className="border rounded-xl overflow-hidden bg-background group transition-shadow hover:shadow-lg">
                      <div
                        className="relative h-32 bg-muted flex items-center justify-center overflow-hidden cursor-pointer"
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
                          <span className="text-xs text-muted-foreground">Product photo</span>
                        )}
                        {/* Quick View Button */}
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute bottom-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
                          onClick={(e) => handleQuickView(product, e)}
                          aria-label={`Quick view ${product.name}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {/* Compare Button */}
                        <Button
                          variant="secondary"
                          size="icon"
                          className={`absolute bottom-2 right-12 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md ${
                            isInCompare(product.id)
                              ? 'bg-primary text-white hover:bg-primary/80'
                              : 'bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800'
                          }`}
                          onClick={(e) => handleCompareToggle(product, e)}
                          aria-label={isInCompare(product.id) ? `Remove ${product.name} from compare` : `Add ${product.name} to compare`}
                        >
                          <GitCompareArrows className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="p-3">
                        <div className="flex gap-1.5 mb-2 flex-wrap">
                          {tags.map((tag) => (
                            <span key={tag} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3
                          className="text-sm font-semibold mb-1 cursor-pointer hover:text-primary transition-colors line-clamp-1"
                          onClick={() => onNavigate('product', product.id)}
                        >
                          {product.name}
                        </h3>
                        {product.shortDescription && (
                          <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                            {product.shortDescription}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground mb-3">
                          {product.minOrderQty > 1 ? `Min. order: ${product.minOrderQty} units` : 'Min. order: B2B / trade only'}
                        </p>
                        <Button
                          size="sm"
                          className="w-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                          onClick={() => handleEnquiryClick(product, 'enquire')}
                        >
                          Enquire
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Infinite Scroll / Load More */}
              {hasMore && (
                <div ref={sentinelRef} className="text-center mt-8">
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
                    className="rounded-full px-6"
                  >
                    {loadingMore ? 'Loading...' : 'Load more products ↓'}
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
        </div>
      </section>

      {/* Packaging Showcase */}
      <section className="bg-muted/40 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-xl font-bold mb-2">Packaging built for retail & trade</h2>
          <p className="text-sm text-muted-foreground mb-8">Available in three formats — choose what works for your business</p>
          <div className="grid md:grid-cols-3 gap-6">
            {packagingOptions.map((item) => (
              <div key={item.title} className={`rounded-xl p-5 text-center ${item.highlight ? 'border-2 border-primary bg-background relative' : 'border bg-background'}`}>
                {item.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded whitespace-nowrap">Most requested</span>}
                <div className="h-24 bg-muted rounded-lg mb-4 flex items-center justify-center text-xs text-muted-foreground">
                  {item.title} pack photo
                </div>
                <h3 className="text-sm font-semibold mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{item.desc}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded ${item.highlight ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>{item.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inline Enquiry Form */}
      <section className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-xl font-bold text-center mb-2">Interested in bulk or private label?</h2>
          <p className="text-xs text-gray-400 text-center mb-8">Share your requirement — our team will respond within 24 hours with pricing & sample details</p>
          <form onSubmit={handleInlineEnquirySubmit} className="max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <input
                placeholder="Your name *"
                value={enquiryForm.name}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500"
              />
              <input
                placeholder="Company name"
                value={enquiryForm.company}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, company: e.target.value })}
                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500"
              />
              <input
                placeholder="Phone number *"
                value={enquiryForm.phone}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500"
              />
              <input
                placeholder="Email address"
                value={enquiryForm.email}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <select
                value={enquiryForm.category}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, category: e.target.value })}
                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-gray-500"
              >
                <option value="">Product category</option>
                {categoryTabs.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.label}>{c.label}</option>
                ))}
              </select>
              <select
                value={enquiryForm.orderType}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, orderType: e.target.value })}
                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-gray-500"
              >
                <option value="">Order type (bulk / PL / branded)</option>
                <option value="Bulk">Bulk</option>
                <option value="Private label">Private label</option>
                <option value="Branded">Branded</option>
              </select>
              <input
                placeholder="Approx. qty / month"
                value={enquiryForm.quantity}
                onChange={(e) => setEnquiryForm({ ...enquiryForm, quantity: e.target.value })}
                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500"
              />
            </div>
            <textarea
              placeholder="Any specific requirements, flavour preferences or packaging notes (optional)"
              value={enquiryForm.message}
              onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-gray-500 mb-4 h-20 resize-none"
            />
            <div className="text-center">
              <Button
                type="submit"
                disabled={enquirySubmitting}
                className="bg-primary text-primary-foreground text-sm font-medium rounded-full px-8 py-2.5 hover:bg-primary/90 transition-colors"
              >
                {enquirySubmitting ? 'Submitting...' : 'Submit product enquiry'}
              </Button>
              <p className="text-[10px] text-gray-500 mt-2">Goes directly to CRM · no spam · sales team alerted instantly</p>
            </div>
          </form>
        </div>
      </section>

      {/* Related Links */}
      <section className="bg-muted/40 py-6 px-4">
        <div className="container mx-auto max-w-6xl flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-muted-foreground">Want full product specs, flavour lists and pack details?</p>
          <div className="flex gap-3">
            <button onClick={() => onNavigate('contact')} className="text-xs bg-primary text-primary-foreground rounded-full px-4 py-2 flex items-center gap-1.5 hover:bg-primary/90 transition-colors">
              <Download className="h-3 w-3" /> Download full catalogue
            </button>
            <button onClick={() => onNavigate('manufacturing')} className="text-xs border rounded-full px-4 py-2 flex items-center gap-1.5 hover:bg-muted transition-colors">
              View manufacturing capabilities →
            </button>
          </div>
        </div>
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
