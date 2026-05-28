'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
  category: { id: string; name: string; slug: string } | null;
  isFeatured: boolean;
  specifications: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string, data?: unknown) => void;
}

export function ProductDetailPage({ productId, onNavigate }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<Record<string, string> | null>(null);
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

  // SEO: dynamic title, meta description, JSON-LD
  useEffect(() => {
    if (!product) return;

    const title = product.metaTitle || `${product.name} | StyleStore`;
    document.title = title;

    const metaDesc = product.metaDescription || product.shortDescription || `Shop ${product.name} at StyleStore. Premium quality at competitive prices.`;
    let metaEl = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaEl) {
      metaEl = document.createElement('meta');
      metaEl.setAttribute('name', 'description');
      document.head.appendChild(metaEl);
    }
    metaEl.setAttribute('content', metaDesc);

    // JSON-LD structured data
    const images = getImages(product.images);
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || product.shortDescription || '',
      sku: product.sku || undefined,
      image: images.length > 0 ? images : undefined,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    };
    if (product.wholesalePrice) {
      (jsonLd.offers as Record<string, unknown>).priceSpecification = {
        '@type': 'PriceSpecification',
        price: product.wholesalePrice,
        priceCurrency: 'USD',
        name: 'Wholesale price',
      };
    }

    const scriptEl = document.createElement('script');
    scriptEl.type = 'application/ld+json';
    scriptEl.textContent = JSON.stringify(jsonLd);
    scriptEl.id = 'product-jsonld';
    const existing = document.getElementById('product-jsonld');
    if (existing) existing.remove();
    document.head.appendChild(scriptEl);

    return () => {
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
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
            ? `RFQ: ${product.name} (Qty: ${form.quantity})`
            : `Enquiry about ${product.name}`,
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
            icon: <Check className="h-4 w-4 text-emerald-600" />,
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
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-muted-foreground">{product.category.name}</span>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Back Button */}
      <Button
        variant="ghost"
        className="w-fit"
        onClick={() => onNavigate('catalogue')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Catalogue
      </Button>

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
                unoptimized
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
                      ? 'border-emerald-600'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          {product.category && (
            <button
              onClick={() => onNavigate('catalogue')}
              className="text-sm text-emerald-600 hover:text-emerald-700 uppercase tracking-wider w-fit transition-colors"
            >
              {product.category.name}
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
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-emerald-600">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.comparePrice!)}
                </span>
                <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                  Save {discountPercent}%
                </Badge>
              </>
            )}
          </div>

          {/* B2B Pricing */}
          {product.wholesalePrice && (
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <Package className="h-4.5 w-4.5 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                    Wholesale Price
                  </p>
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-200">
                    {formatPrice(product.wholesalePrice)}
                    <span className="text-xs font-normal text-amber-600 dark:text-amber-400 ml-2">
                      per unit
                    </span>
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    Min. order: {product.minOrderQty} unit{product.minOrderQty > 1 ? 's' : ''}
                  </p>
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
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {product.description}
              </p>
            </div>
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
        </div>
      </div>

      {/* Enquiry Form */}
      <Separator />
      <Card className="max-w-2xl mx-auto w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-emerald-600" />
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
                      <span className="text-xs text-emerald-600 font-normal">(filled)</span>
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
