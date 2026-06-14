'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import {
  ArrowLeft,
  ShoppingCart,
  Send,
  Check,
  ChevronRight,
  Home,
  Hash,
  Package,
  Building2,
  Minus,
  MessageCircle,
  GitCompareArrows,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SocialShare } from './SocialShare';
import { CrossSellSection } from './CrossSellSection';
import { WhatsAppShare } from './WhatsAppShare';
import { PincodeChecker } from './PincodeChecker';
import { trackProductView } from './RecentlyViewedProducts';
import { useAppStore } from '@/lib/store';
import { calculateTieredPrice, formatPrice as libFormatPrice } from '@/lib/pricing';
import { generateProductSchema } from '@/lib/seo/schema-generator';

interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  price: number | null;
  comparePrice: number | null;
  wholesalePrice: number | null;
  stock: number;
  images: string;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  comparePrice: number | null;
  wholesalePrice: number | null;
  minOrderQty: number;
  sku: string | null;
  images: string;
  whatsappNumber: string | null;
  Category: { id: string; name: string; slug: string } | null;
  isFeatured: boolean;
  specifications: string | null;
  documents: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  stock: number;
  lowStockThreshold: number;
  relatedProductIds: string;
}

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string, data?: unknown) => void;
}

export function ProductDetailPage({ productId, onNavigate }: ProductDetailPageProps) {
  const auth = useAppStore((state) => state.auth);
  const settings = useAppStore((state) => state.settings);
  const addToCompare = useAppStore((state) => state.addToCompare);
  const removeFromCompare = useAppStore((state) => state.removeFromCompare);
  const isInCompare = useAppStore((state) => state.isInCompare);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<Record<string, string> | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    enquiryType: 'product',
    quantity: '1',
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
  });

  // Fetch site settings for WhatsApp fallback
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSiteSettings(data.settings || {});
        }
      } catch {
        // ignore settings fetch failure
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
          setForm((prev) => ({
            ...prev,
            message: `I'm interested in ${data.product.name}. Please provide more information.`,
          }));
          // Track recently viewed
          trackProductView({
            id: data.product.id,
            name: data.product.name,
            slug: data.product.slug,
            price: data.product.price,
            images: data.product.images,
          });
        } else {
          toast.error('Product not found');
          onNavigate('catalogue');
        }
      } catch {
        toast.error('Failed to load product');
        onNavigate('catalogue');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, onNavigate]);

  // Fetch variants
  useEffect(() => {
    if (!productId) return;
    const fetchVariants = async () => {
      try {
        const res = await fetch(`/api/products/${productId}/variants`);
        if (res.ok) {
          const data = await res.json();
          const activeVariants = (data.variants || []).filter((v: ProductVariant) => v.isActive);
          setVariants(activeVariants);
          if (activeVariants.length > 0) setSelectedVariant(activeVariants[0]);
        }
      } catch {
        // ignore
      }
    };
    fetchVariants();
  }, [productId]);

  // Fetch related products
  useEffect(() => {
    if (!product?.relatedProductIds) return;
    let ids: string[] = [];
    try { ids = JSON.parse(product.relatedProductIds); } catch { return; }
    if (!Array.isArray(ids) || ids.length === 0) return;
    const fetchRelated = async () => {
      try {
        const params = new URLSearchParams({ all: 'true' });
        ids.forEach(id => params.append('ids', id));
        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setRelatedProducts(data.products || []);
        }
      } catch {
        // ignore
      }
    };
    fetchRelated();
  }, [product?.relatedProductIds]);

  // Fetch algorithmic recommendations
  useEffect(() => {
    if (!productId) return;
    // Only fetch if no manual related products
    if (product?.relatedProductIds) {
      try {
        const ids = JSON.parse(product.relatedProductIds);
        if (Array.isArray(ids) && ids.length > 0) return;
      } catch {}
    }

    const fetchRecommendations = async () => {
      try {
        const res = await fetch(`/api/products/${productId}/recommendations?limit=8`);
        if (res.ok) {
          const data = await res.json();
          setRecommendedProducts(data.products || []);
        }
      } catch {}
    };
    fetchRecommendations();
  }, [productId, product?.relatedProductIds]);

  // SEO: dynamic title, meta description, JSON-LD
  useEffect(() => {
    if (!product) return;

    const siteName = settings?.site_name || 'My Store';
    const prevTitle = document.title;
    const title = product.metaTitle || `${product.name} | ${siteName}`;
    document.title = title;

    const metaDesc = product.metaDescription || product.shortDescription || `Shop ${product.name} at ${siteName}. Premium quality at competitive prices.`;
    let metaEl = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const prevMetaContent = metaEl?.getAttribute('content') || '';
    if (!metaEl) {
      metaEl = document.createElement('meta');
      metaEl.setAttribute('name', 'description');
      document.head.appendChild(metaEl);
    }
    metaEl.setAttribute('content', metaDesc);

    // JSON-LD structured data
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const brandName = settings?.site_name || 'Store';
    const currency = settings?.currency || 'USD';
    const jsonLd = generateProductSchema(product, siteUrl, brandName, currency);

    const scriptEl = document.createElement('script');
    scriptEl.type = 'application/ld+json';
    scriptEl.textContent = JSON.stringify(jsonLd);
    scriptEl.id = 'product-jsonld';
    const existing = document.getElementById('product-jsonld');
    if (existing) existing.remove();
    document.head.appendChild(scriptEl);

    return () => {
      document.title = prevTitle;
      if (metaEl) metaEl.setAttribute('content', prevMetaContent);
      const el = document.getElementById('product-jsonld');
      if (el) el.remove();
    };
  }, [product]);

  const getImages = (images: string): string[] => {
    try {
      const arr = JSON.parse(images);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };

  const getSpecifications = (specs: string): Record<string, string> => {
    try {
      const obj = JSON.parse(specs);
      return typeof obj === 'object' && obj !== null ? obj : {};
    } catch {
      return {};
    }
  };

  const userTier = auth.user?.tier;

  const formatPrice = (price: number) => {
    return libFormatPrice(price, siteSettings?.currency || 'USD');
  };

  const getEffectivePrice = (basePrice: number) => {
    const isTieredEnabled = settings?.b2b_enable_tiered_pricing === 'true';
    if (!isTieredEnabled) return basePrice;
    return calculateTieredPrice(basePrice, userTier, siteSettings || undefined);
  };

  const isRFQ = form.enquiryType === 'rfq';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isRFQ && (!form.quantity || parseInt(form.quantity) < 1)) {
      toast.error('Please enter a valid quantity for your quote request');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          subject: isRFQ
            ? `RFQ: ${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} (Qty: ${form.quantity})`
            : `Enquiry about ${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''}`,
          message: form.message,
          productId: product.id,
          type: isRFQ ? 'rfq' : 'product',
          quantity: form.quantity ? parseInt(form.quantity) : null,
          companyName: form.companyName || null,
          companyEmail: form.companyEmail || null,
          companyPhone: form.companyPhone || null,
          companyAddress: form.companyAddress || null,
        }),
      });

      if (res.ok) {
        toast.success(
          isRFQ
            ? 'Quote request submitted! Our sales team will respond shortly.'
            : 'Your enquiry has been submitted successfully!',
          {
            icon: <Check className="h-4 w-4 text-primary" />,
          }
        );
        setForm({
          name: '',
          email: '',
          phone: '',
          message: '',
          enquiryType: 'product',
          quantity: '1',
          companyName: '',
          companyEmail: '',
          companyPhone: '',
          companyAddress: '',
        });
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit enquiry');
      }
    } catch {
      toast.error('Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 pb-12">
        <Button
          variant="ghost"
          className="w-fit"
          onClick={() => onNavigate('catalogue')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Catalogue
        </Button>
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = getImages(product.images);
  const specs = getSpecifications(product.specifications || '[]');
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Home</span>
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <button
          onClick={() => onNavigate('catalogue')}
          className="hover:text-foreground transition-colors"
        >
          Catalogue
        </button>
        {product.Category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-muted-foreground">{product.Category.name}</span>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="w-fit"
          onClick={() => onNavigate('catalogue')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Catalogue
        </Button>
        {(() => {
          const inCompare = isInCompare(product.id);
          return (
            <Button
              variant={inCompare ? 'default' : 'outline'}
              size="sm"
              className={inCompare ? 'bg-primary hover:bg-primary/80 text-white' : ''}
              onClick={() => {
                if (inCompare) {
                  removeFromCompare(product.id);
                } else {
                  addToCompare({
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    comparePrice: product.comparePrice,
                    images: product.images,
                    stock: product.stock,
                    sku: product.sku,
                    description: product.description,
                    shortDescription: product.shortDescription,
                    minOrderQty: product.minOrderQty,
                    Category: product.Category,
                  });
                }
              }}
            >
              <GitCompareArrows className="mr-1.5 h-4 w-4" />
              {inCompare ? 'In Compare' : 'Compare'}
            </Button>
          );
        })()}
      </div>

      {/* Product Detail */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            {images.length > 0 ? (
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <ShoppingCart className="h-16 w-16 text-gray-400" />
              </div>
            )}
            {hasDiscount && (
              <Badge className="absolute top-4 left-4 bg-rose-500 text-white text-sm px-3 py-1">
                -{discountPercent}% OFF
              </Badge>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    idx === selectedImage
                      ? 'border-primary'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          {product.Category && (
            <button
              onClick={() => onNavigate('catalogue')}
              className="text-sm text-primary hover:text-primary/80 uppercase tracking-wider w-fit transition-colors"
            >
              {product.Category.name}
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {product.name}
            </h1>
            {product.sku && (
              <p className="text-sm text-muted-foreground mt-1">SKU: {product.sku}</p>
            )}
          </div>

          {/* Pricing */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(getEffectivePrice(selectedVariant?.price || product.price))}
              </span>
              {(() => {
                const cp = selectedVariant?.comparePrice || product.comparePrice;
                const sp = getEffectivePrice(selectedVariant?.price || product.price);
                if (cp && cp > sp) {
                  const pct = Math.round(((cp - sp) / cp) * 100);
                  return (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        {formatPrice(cp)}
                      </span>
                      <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                        Save {pct}%
                      </Badge>
                    </>
                  );
                }
                return null;
              })()}
            </div>
            {settings?.b2b_enable_tiered_pricing === 'true' && userTier && userTier !== 'standard' && (
              <p className="text-xs font-medium text-primary">
                Exclusive {userTier} tier price applied
              </p>
            )}
          </div>

          {/* Variant Selector */}
          {variants.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Variant</Label>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <Button
                    key={v.id}
                    variant={selectedVariant?.id === v.id ? 'default' : 'outline'}
                    size="sm"
                    className={
                      selectedVariant?.id === v.id
                        ? 'bg-primary hover:bg-primary/80 text-white'
                        : ''
                    }
                    onClick={() => {
                      setSelectedVariant(v);
                      if (v.images && v.images !== '[]') {
                        try {
                          const imgs = JSON.parse(v.images);
                          if (imgs.length > 0) setSelectedImage(0);
                        } catch {}
                      }
                    }}
                  >
                    {v.name}
                  </Button>
                ))}
              </div>
              {selectedVariant?.sku && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" />
                  SKU: {selectedVariant.sku}
                </p>
              )}
              {selectedVariant?.wholesalePrice && (
                <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30">
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                      <Package className="h-4.5 w-4.5 text-amber-700 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Wholesale Price</p>
                      <p className="text-lg font-bold text-amber-700 dark:text-amber-200">
                        {formatPrice(selectedVariant.wholesalePrice)}
                        <span className="text-xs font-normal text-amber-600 dark:text-amber-400 ml-2">per unit</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Variant Stock */}
              {(() => {
                const stock = selectedVariant?.stock ?? product.stock;
                const threshold = product.lowStockThreshold;
                if (stock <= 0) {
                  return <Badge variant="secondary" className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">Out of stock</Badge>;
                }
                if (stock <= threshold) {
                  return <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Only {stock} left in stock</Badge>;
                }
                return <Badge variant="secondary" className="bg-primary/10 text-primary/80 dark:bg-primary-dark/30 dark:text-primary/40">In Stock</Badge>;
              })()}
            </div>
          )}

          {/* Stock (no variants) */}
          {variants.length === 0 && (() => {
            const stock = product.stock;
            const threshold = product.lowStockThreshold;
            return (
              <div className="flex items-center gap-2">
                {stock <= 0 ? (
                  <Badge variant="secondary" className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">Out of stock</Badge>
                ) : stock <= threshold ? (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Only {stock} left</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-primary/10 text-primary/80 dark:bg-primary-dark/30 dark:text-primary/40">In Stock</Badge>
                )}
              </div>
            );
          })()}

          {/* Pincode Checker */}
          <PincodeChecker productId={product.id} />

          {/* B2B Pricing */}
          {(product.wholesalePrice || (product.minOrderQty && product.minOrderQty > 1)) && (
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30 shadow-sm overflow-hidden">
              <div className="bg-amber-100 dark:bg-amber-900/50 px-4 py-2 border-b border-amber-200 dark:border-amber-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  B2B Wholesale Program
                </span>
                <Badge variant="outline" className="bg-white/50 border-amber-300 text-amber-800 dark:bg-black/20 dark:text-amber-300">
                  Active
                </Badge>
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                    <Package className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <p className="font-semibold text-amber-900 dark:text-amber-100 text-sm">Wholesale Pricing</p>
                      {product.wholesalePrice && (
                        <p className="text-lg font-bold text-primary dark:text-primary/40">
                          {formatPrice(product.wholesalePrice)}
                          <span className="text-xs font-normal text-muted-foreground ml-1">/ unit</span>
                        </p>
                      )}
                    </div>
                    <div className="mt-2 space-y-1.5">
                      <p className="text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                        <Check className="h-3 w-3 text-primary/50" />
                        Minimum order quantity: <span className="font-bold">{product.minOrderQty} units</span>
                      </p>
                      <p className="text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                        <Check className="h-3 w-3 text-primary/50" />
                        Custom branding & private labeling available
                      </p>
                      <p className="text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                        <Check className="h-3 w-3 text-primary/50" />
                        Global logistics and door-step delivery
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white border-none shadow-sm h-9"
                    onClick={() => {
                      setForm(prev => ({ ...prev, enquiryType: 'rfq', quantity: String(product.minOrderQty || 10) }));
                      const enquirySection = document.getElementById('enquiry-section');
                      if (enquirySection) {
                        enquirySection.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        // Fallback: scroll to bottom of the page where the form is usually located
                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                      }
                      setBusinessOpen(true);
                    }}
                  >
                    <Send className="mr-2 h-3.5 w-3.5" />
                    Request Bulk Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Min Order Qty */}
          {product.minOrderQty > 1 && !product.wholesalePrice && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Minus className="h-3.5 w-3.5" />
              Minimum order quantity: {product.minOrderQty} units
            </p>
          )}

          <Separator />

          {product.shortDescription && (
            <p className="text-muted-foreground leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {product.description && (
            <div
              className="prose prose-sm max-w-none text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(product.description, {
                  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
                    'hr', 'div', 'span', 'pre', 'code', 'figure', 'figcaption'],
                  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'style', 'target', 'rel',
                    'colspan', 'rowspan'],
                }),
              }}
            />
          )}

          {/* Specifications */}
          {Object.keys(specs).length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Specifications</h3>
                <Card>
                  <Table>
                    <TableBody>
                      {Object.entries(specs).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableHead className="w-1/3 font-medium text-muted-foreground bg-muted/50">
                            {key}
                          </TableHead>
                          <TableCell>{String(value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </>
          )}

          {/* Documents / Datasheets */}
          {(() => {
            let docs: Array<{ name: string; url: string; size?: number }> = [];
            try {
              docs = product.documents ? JSON.parse(product.documents) : [];
            } catch { /* ignore */ }
            if (docs.length === 0) return null;
            return (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3">Documents & Datasheets</h3>
                  <div className="space-y-2">
                    {docs.map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <FileText className="h-5 w-5 text-red-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          {doc.size && (
                            <p className="text-xs text-muted-foreground">
                              {(doc.size / 1024).toFixed(1)} KB
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">PDF</span>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Social Sharing */}
      <SocialShare
        url={typeof window !== 'undefined' ? window.location.href : ''}
        title={product.name}
      />

      {/* Enquiry Form */}
      <Separator id="enquiry-section" />
      <Card className="max-w-2xl mx-auto w-full shadow-lg border-primary/10 dark:border-primary-dark/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Make an Enquiry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Enquiry Type & Quantity */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pdq-type">Enquiry Type</Label>
                <Select
                  value={form.enquiryType}
                  onValueChange={(val) => setForm({ ...form, enquiryType: val })}
                >
                  <SelectTrigger id="pdq-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">General Enquiry</SelectItem>
                    <SelectItem value="rfq">Request for Quote (RFQ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdq-qty" className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" />
                  Required Quantity
                  {isRFQ && <span className="text-rose-500">*</span>}
                </Label>
                <Input
                  id="pdq-qty"
                  type="number"
                  min={product.minOrderQty || 1}
                  placeholder={String(product.minOrderQty || 1)}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className={isRFQ ? 'border-amber-400 ring-1 ring-amber-400' : ''}
                />
                {product.minOrderQty > 1 && (
                  <p className="text-xs text-muted-foreground">
                    Min. order: {product.minOrderQty} units
                  </p>
                )}
                {isRFQ && (
                  <p className="text-xs text-amber-600">
                    Quantity is required for quote requests
                  </p>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pdq-name">
                  Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="pdq-name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdq-email">
                  Email <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="pdq-email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pdq-phone">Phone</Label>
              <Input
                id="pdq-phone"
                type="tel"
                placeholder="Your phone number (optional)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            {/* Collapsible Business Details */}
            <Collapsible open={businessOpen} onOpenChange={setBusinessOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Business Details
                    {(form.companyName || form.companyEmail) && (
                      <span className="text-xs text-primary font-normal">(filled)</span>
                    )}
                  </span>
                  <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pdq-company" className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      Company Name
                    </Label>
                    <Input
                      id="pdq-company"
                      placeholder="Acme Corp"
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pdq-company-email">Company Email</Label>
                    <Input
                      id="pdq-company-email"
                      type="email"
                      placeholder="sales@company.com"
                      value={form.companyEmail}
                      onChange={(e) => setForm({ ...form, companyEmail: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pdq-company-phone">Company Phone</Label>
                    <Input
                      id="pdq-company-phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={form.companyPhone}
                      onChange={(e) => setForm({ ...form, companyPhone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pdq-company-address">Company Address</Label>
                    <Input
                      id="pdq-company-address"
                      placeholder="123 Business St"
                      value={form.companyAddress}
                      onChange={(e) => setForm({ ...form, companyAddress: e.target.value })}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="pdq-message">
                Message <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="pdq-message"
                placeholder="Tell us what you'd like to know..."
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/80 text-white"
                disabled={submitting}
              >
                {submitting ? (
                  'Submitting...'
                ) : isRFQ ? (
                  <>
                    <Hash className="mr-2 h-4 w-4" />
                    Request Quote
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Enquiry
                  </>
                )}
              </Button>
              <a
                href={`https://wa.me/${(product.whatsappNumber || siteSettings?.whatsapp_number || '').replace(/[^0-9+]/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in ${product.name}. Please share more details.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#20bd5a] transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </a>
              <WhatsAppShare
                productName={product.name}
                productUrl={typeof window !== 'undefined' ? window.location.href : ''}
                phoneNumber={product.whatsappNumber || siteSettings?.whatsapp_number}
                mode="enquiry"
              />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Sticky Mobile CTA */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-3 flex gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom duration-300">
        <Button
          className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold h-12 shadow-sm"
          onClick={() => {
            setForm((prev) => ({ ...prev, enquiryType: "rfq", quantity: String(product.minOrderQty || 10) }));
            const enquirySection = document.getElementById("enquiry-section");
            if (enquirySection) {
              enquirySection.scrollIntoView({ behavior: "smooth" });
            } else {
              window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
            }
          }}
        >
          <Send className="mr-2 h-4 w-4" />
          Get Quote
        </Button>
        <a
          href={`https://wa.me/${(product.whatsappNumber || siteSettings?.whatsapp_number || "").replace(/[^0-9+]/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in ${product.name}. Please share more details.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center rounded-md bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#20bd5a] transition-colors h-12 shadow-sm"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          WhatsApp
        </a>
      </div>

      {/* Related / Recommended Products */}
      {(relatedProducts.length > 0 || recommendedProducts.length > 0) && (
        <div className="space-y-4 pb-20 lg:pb-0">
          <Separator />
          <div>
            <h3 className="text-xl font-semibold">
              {relatedProducts.length > 0 ? 'Related Products' : 'You May Also Like'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {relatedProducts.length > 0 ? 'You may also be interested in' : 'Recommended for you'}
            </p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
            {(relatedProducts.length > 0 ? relatedProducts : recommendedProducts).map((rp) => {
              const rpImages = (() => { try { return JSON.parse(rp.images || '[]'); } catch { return []; } })();
              const rpImg = rpImages.length > 0 ? rpImages[0] : null;
              return (
                <button
                  key={rp.id}
                  type="button"
                  className="flex-shrink-0 w-48 snap-start rounded-lg border bg-card hover:shadow-md transition-shadow text-left group"
                  onClick={() => onNavigate('product', { productId: rp.id })}
                >
                  <div className="relative aspect-square overflow-hidden rounded-t-lg bg-muted">
                    {rpImg ? (
                      <Image src={rpImg} alt={rp.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <ShoppingCart className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm truncate">{rp.name}</p>
                    <p className="text-primary font-semibold text-sm mt-1">{formatPrice(rp.price)}</p>
                    {rp.Category && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{rp.Category.name}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Cross-sell Bundles */}
      <CrossSellSection productId={product.id} />
    </div>
  );
}
