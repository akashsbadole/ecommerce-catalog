'use client';

import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  Image,
  LayoutGrid,
  MousePointerClick,
  Quote,
  Images,
  Type,
  MoveVertical,
  Minus,
  Package,
  HelpCircle,
  Star,
  ChevronDown,
  ShoppingCart,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { PageBlock } from '@/lib/page-blocks';

// Allowed HTML tags and attributes for sanitized content
const SANITIZE_OPTIONS = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div', 'span', 'pre', 'code', 'figure', 'figcaption', 'sup', 'sub'],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'style', 'target', 'rel', 'colspan', 'rowspan'],
};

// Dynamic icon resolver
function LucideIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  if (IconComponent) {
    return <IconComponent className={className} />;
  }
  return <Star className={className} />;
}

interface BlockRendererProps {
  block: PageBlock;
  onNavigate?: (page: string, data?: unknown) => void;
}

function HeroBlock({ data, onNavigate }: { data: Record<string, unknown>; onNavigate?: (page: string, data?: unknown) => void }) {
  const bgImage = (data.backgroundImage as string) || '';
  const title = (data.title as string) || 'Welcome';
  const subtitle = (data.subtitle as string) || '';
  const buttonText = (data.buttonText as string) || '';
  const buttonLink = (data.buttonLink as string) || '/catalogue';
  const height = (data.height as string) || 'medium';
  const alignment = (data.alignment as string) || 'center';

  const heightClasses: Record<string, string> = {
    small: 'min-h-[200px] sm:min-h-[250px]',
    medium: 'min-h-[300px] sm:min-h-[400px] lg:min-h-[450px]',
    large: 'min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]',
  };

  const alignClasses: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`relative flex items-center overflow-hidden ${heightClasses[height] || heightClasses.medium}`}>
      {bgImage ? (
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800" />
      )}
      <div className="absolute inset-0 bg-black/30" />
      <div className={`relative z-10 mx-auto max-w-4xl px-6 w-full ${alignClasses[alignment] || alignClasses.center}`}>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 text-lg text-white/90 sm:text-xl">{subtitle}</p>}
        {buttonText && (
          <Button
            size="lg"
            className="mt-6 bg-white text-emerald-700 hover:bg-white/90"
            onClick={() => onNavigate && buttonLink && onNavigate(buttonLink.startsWith('/') ? 'content-page' : 'catalogue', buttonLink)}
          >
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
}

function FeaturesBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || '';
  const columns = (data.columns as number) || 3;
  const features = (data.features as Array<{ title: string; description: string; icon: string }>) || [];

  const gridCols: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className="py-12">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        </div>
      )}
      <div className={`grid gap-6 ${gridCols[columns] || gridCols[3]}`}>
        {features.map((feature, i) => (
          <Card key={i} className="text-center p-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <LucideIcon name={feature.icon || 'Star'} className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold">{feature.title}</h3>
            {feature.description && (
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}

function CtaBlock({ data, onNavigate }: { data: Record<string, unknown>; onNavigate?: (page: string, data?: unknown) => void }) {
  const title = (data.title as string) || '';
  const description = (data.description as string) || '';
  const buttonText = (data.buttonText as string) || '';
  const buttonLink = (data.buttonLink as string) || '/contact';
  const backgroundColor = (data.backgroundColor as string) || 'emerald';

  const bgClasses: Record<string, string> = {
    emerald: 'bg-gradient-to-br from-emerald-600 to-teal-700',
    rose: 'bg-gradient-to-br from-rose-600 to-pink-700',
    amber: 'bg-gradient-to-br from-amber-600 to-orange-700',
    slate: 'bg-gradient-to-br from-slate-700 to-slate-900',
  };

  return (
    <section className={`${bgClasses[backgroundColor] || bgClasses.emerald} rounded-xl p-8 text-center text-white sm:p-12`}>
      {title && <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>}
      {description && <p className="mt-3 max-w-lg mx-auto text-white/90">{description}</p>}
      {buttonText && (
        <Button
          size="lg"
          className="mt-6 bg-white text-emerald-700 hover:bg-white/90"
          onClick={() => onNavigate && buttonLink && onNavigate(buttonLink.startsWith('/') ? 'content-page' : 'contact', buttonLink)}
        >
          {buttonText}
        </Button>
      )}
    </section>
  );
}

function TestimonialsBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || '';
  const testimonials = (data.testimonials as Array<{ name: string; role: string; quote: string; avatar: string }>) || [];

  return (
    <section className="py-12">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <Card key={i} className="p-6">
            <Quote className="h-8 w-8 text-emerald-200 dark:text-emerald-800 mb-4" />
            <p className="text-foreground/80 italic">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-4 flex items-center gap-3">
              {t.avatar ? (
                <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    {t.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ImageGalleryBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || '';
  const columns = (data.columns as number) || 3;
  const images = (data.images as string[]) || [];

  const gridCols: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section className="py-12">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        </div>
      )}
      <div className={`grid gap-4 ${gridCols[columns] || gridCols[3]}`}>
        {images.filter(Boolean).map((src, i) => (
          <div key={i} className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={src}
              alt={`Gallery image ${i + 1}`}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function TextBlock({ data }: { data: Record<string, unknown> }) {
  const content = (data.content as string) || '';

  return (
    <section className="py-8">
      <div
        className="prose prose-neutral dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:tracking-tight
          prose-p:text-foreground/80 prose-a:text-primary
          prose-img:rounded-lg"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content, SANITIZE_OPTIONS) }}
      />
    </section>
  );
}

function SpacerBlock({ data }: { data: Record<string, unknown> }) {
  const height = (data.height as number) || 64;
  return <div style={{ height: `${height}px` }} />;
}

function DividerBlock({ data }: { data: Record<string, unknown> }) {
  const style = (data.style as string) || 'solid';
  return <hr className={`my-8 border-${style === 'dashed' ? 'dashed' : style === 'dotted' ? 'dotted' : 'solid'} border-border`} />;
}

function ProductsBlock({ data, onNavigate }: { data: Record<string, unknown>; onNavigate?: (page: string, data?: unknown) => void }) {
  const title = (data.title as string) || '';
  const maxProducts = (data.maxProducts as number) || 6;
  const [products, setProducts] = useState<Array<{
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    price: number;
    comparePrice: number | null;
    images: string;
    category: { id: string; name: string } | null;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products?featured=true&limit=${maxProducts}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [maxProducts]);

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
    <section className="py-12">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        </div>
      )}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden py-0 gap-0">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const image = getFirstImage(product.images);
            return (
              <Card
                key={product.id}
                className="group overflow-hidden py-0 gap-0 transition-shadow hover:shadow-lg cursor-pointer"
                onClick={() => onNavigate && onNavigate('product', product.id)}
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {image ? (
                    <img
                      src={image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <ShoppingCart className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-2">
                  {product.category && (
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {product.category.name}
                    </span>
                  )}
                  <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-lg font-bold text-emerald-600">{formatPrice(product.price)}</span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.comparePrice)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No featured products available yet.</p>
        </Card>
      )}
    </section>
  );
}

function FaqBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || '';
  const items = (data.items as Array<{ question: string; answer: string }>) || [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-12">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        </div>
      )}
      <div className="max-w-3xl mx-auto space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="border rounded-lg overflow-hidden"
          >
            <button
              className="flex w-full items-center justify-between px-6 py-4 text-left font-medium hover:bg-muted/50 transition-colors"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span>{item.question}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                  openIndex === i ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === i && (
              <div className="px-6 pb-4 text-muted-foreground">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

const BLOCK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  hero: Image,
  features: LayoutGrid,
  cta: MousePointerClick,
  testimonials: Quote,
  'image-gallery': Images,
  text: Type,
  spacer: MoveVertical,
  divider: Minus,
  products: Package,
  faq: HelpCircle,
};

export function PageBlockRenderer({ block, onNavigate }: BlockRendererProps) {
  const { type, data } = block;

  switch (type) {
    case 'hero':
      return <HeroBlock data={data} onNavigate={onNavigate} />;
    case 'features':
      return <FeaturesBlock data={data} />;
    case 'cta':
      return <CtaBlock data={data} onNavigate={onNavigate} />;
    case 'testimonials':
      return <TestimonialsBlock data={data} />;
    case 'image-gallery':
      return <ImageGalleryBlock data={data} />;
    case 'text':
      return <TextBlock data={data} />;
    case 'spacer':
      return <SpacerBlock data={data} />;
    case 'divider':
      return <DividerBlock data={data} />;
    case 'products':
      return <ProductsBlock data={data} onNavigate={onNavigate} />;
    case 'faq':
      return <FaqBlock data={data} />;
    default:
      return null;
  }
}

export { BLOCK_ICONS };
