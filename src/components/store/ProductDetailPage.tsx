'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, ShoppingCart, Send, Check, AlertCircle } from 'lucide-react';
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
  sku: string | null;
  images: string;
  category: { id: string; name: string } | null;
  isFeatured: boolean;
  specifications: string | null;
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
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
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
          subject: `Enquiry about ${product.name}`,
          message: form.message,
          productId: product.id,
          type: 'product',
        }),
      });

      if (res.ok) {
        toast.success('Your enquiry has been submitted successfully!', {
          icon: <Check className="h-4 w-4 text-emerald-600" />,
        });
        setForm({ name: '', email: '', phone: '', message: '' });
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
            <span className="text-sm text-muted-foreground uppercase tracking-wider">
              {product.category.name}
            </span>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {product.name}
            </h1>
            {product.sku && (
              <p className="text-sm text-muted-foreground mt-1">SKU: {product.sku}</p>
            )}
          </div>

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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eq-name">
                  Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="eq-name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eq-email">
                  Email <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="eq-email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eq-phone">Phone</Label>
              <Input
                id="eq-phone"
                type="tel"
                placeholder="Your phone number (optional)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eq-message">
                Message <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="eq-message"
                placeholder="Tell us what you'd like to know..."
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={submitting}
            >
              {submitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Enquiry
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
