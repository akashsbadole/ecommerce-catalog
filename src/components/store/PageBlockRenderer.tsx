"use client";

import { useEffect, useState, useRef } from "react";
import DOMPurify from "dompurify";
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
  ChevronLeft,
  ChevronRight,
  GalleryHorizontal,
  Layers,
  User,
  TrendingUp,
  Users,
  Factory,
  Video,
  Award,
  FormInput,
  UserCircle,
  Building,
  ArrowDownToLine,
  Building2,
  ShieldCheck,
  Clock,
  Verified,
  Play,
  Phone,
  MessageCircle,
  Send,
  ArrowRight,
  Mail,
  Newspaper,
  CreditCard,
  Check,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion, useInView, animate } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { PageBlock } from "@/lib/page-blocks";

// Allowed HTML tags and attributes for sanitized content
const SANITIZE_OPTIONS = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "blockquote",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "hr",
    "div",
    "span",
    "pre",
    "code",
    "figure",
    "figcaption",
    "sup",
    "sub",
  ],
  ALLOWED_ATTR: [
    "href",
    "src",
    "alt",
    "title",
    "class",
    "id",
    "style",
    "target",
    "rel",
    "colspan",
    "rowspan",
  ],
};

// Dynamic icon resolver
function LucideIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (
    LucideIcons as unknown as Record<
      string,
      React.ComponentType<{ className?: string }>
    >
  )[name];
  if (IconComponent) {
    return <IconComponent className={className} />;
  }
  return <Star className={className} />;
}

interface BlockRendererProps {
  block?: PageBlock;
  onNavigate?: (page: string, data?: unknown) => void;
}

function HeroBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const bgImage = (data.backgroundImage as string) || "";
  const title = (data.title as string) || "Welcome";
  const subtitle = (data.subtitle as string) || "";
  const buttonText = (data.buttonText as string) || "";
  const buttonLink = (data.buttonLink as string) || "/catalogue";
  const height = (data.height as string) || "medium";
  const alignment = (data.alignment as string) || "center";

  const heightClasses: Record<string, string> = {
    small: "min-h-[200px] sm:min-h-[250px]",
    medium: "min-h-[300px] sm:min-h-[400px] lg:min-h-[450px]",
    large: "min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]",
  };

  const alignClasses: Record<string, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div
      className={`relative flex items-center overflow-hidden ${heightClasses[height] || heightClasses.medium}`}
    >
      {bgImage ? (
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800" />
      )}
      <div className="absolute inset-0 bg-black/30" />
      <div
        className={`relative z-10 mx-auto max-w-4xl px-6 w-full ${alignClasses[alignment] || alignClasses.center}`}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-lg text-white/90 sm:text-xl">{subtitle}</p>
        )}
        {buttonText && (
          <Button
            size="lg"
            className="mt-6 bg-white text-emerald-700 hover:bg-white/90"
            onClick={() =>
              onNavigate &&
              buttonLink &&
              onNavigate(
                buttonLink.startsWith("/") ? "content-page" : "catalogue",
                buttonLink.replace("/page/", ""),
              )
            }
          >
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
}

function FeaturesBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "";
  const columns = (data.columns as number) || 3;
  const features =
    (data.features as Array<{
      title: string;
      description: string;
      icon: string;
    }>) || [];

  const gridCols: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className="py-12">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>
        </div>
      )}
      <div className={`grid gap-6 ${gridCols[columns] || gridCols[3]}`}>
        {features.map((feature, i) => (
          <Card key={i} className="text-center p-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <LucideIcon
                name={feature.icon || "Star"}
                className="h-6 w-6 text-emerald-600"
              />
            </div>
            <h3 className="font-semibold">{feature.title}</h3>
            {feature.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}

function CtaBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const title = (data.title as string) || "";
  const description = (data.description as string) || "";
  const buttonText = (data.buttonText as string) || "";
  const buttonLink = (data.buttonLink as string) || "/contact";
  const backgroundColor = (data.backgroundColor as string) || "emerald";

  const bgClasses: Record<string, string> = {
    emerald: "bg-gradient-to-br from-emerald-600 to-teal-700",
    rose: "bg-gradient-to-br from-rose-600 to-pink-700",
    amber: "bg-gradient-to-br from-amber-600 to-orange-700",
    slate: "bg-gradient-to-br from-slate-700 to-slate-900",
  };

  return (
    <section
      className={`${bgClasses[backgroundColor] || bgClasses.emerald} rounded-xl p-8 text-center text-white sm:p-12`}
    >
      {title && <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>}
      {description && (
        <p className="mt-3 max-w-lg mx-auto text-white/90">{description}</p>
      )}
      {buttonText && (
        <Button
          size="lg"
          className="mt-6 bg-white text-emerald-700 hover:bg-white/90"
          onClick={() =>
            onNavigate &&
            buttonLink &&
            onNavigate(
              buttonLink.startsWith("/") ? "content-page" : "contact",
              buttonLink.replace("/page/", ""),
            )
          }
        >
          {buttonText}
        </Button>
      )}
    </section>
  );
}

function TestimonialsBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "";
  const testimonials =
    (data.testimonials as Array<{
      name: string;
      role: string;
      quote: string;
      avatar: string;
    }>) || [];

  return (
    <section className="py-12">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <Card key={i} className="p-6">
            <Quote className="h-8 w-8 text-emerald-200 dark:text-emerald-800 mb-4" />
            <p className="text-foreground/80 italic">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-4 flex items-center gap-3">
              {t.avatar ? (
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    {t.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                {t.role && (
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ImageGalleryBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "";
  const columns = (data.columns as number) || 3;
  const images = (data.images as string[]) || [];

  const gridCols: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className="py-12">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>
        </div>
      )}
      <div className={`grid gap-4 ${gridCols[columns] || gridCols[3]}`}>
        {images.filter(Boolean).map((src, i) => (
          <div
            key={i}
            className="aspect-square overflow-hidden rounded-lg bg-muted"
          >
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
  const content = (data.content as string) || "";

  return (
    <section className="py-8">
      <div
        className="prose prose-neutral dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:tracking-tight
          prose-p:text-foreground/80 prose-a:text-primary
          prose-img:rounded-lg"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(content, SANITIZE_OPTIONS),
        }}
      />
    </section>
  );
}

function SpacerBlock({ data }: { data: Record<string, unknown> }) {
  const height = (data.height as number) || 64;
  return <div style={{ height: `${height}px` }} />;
}

function DividerBlock({ data }: { data: Record<string, unknown> }) {
  const style = (data.style as string) || "solid";
  return (
    <hr
      className={`my-8 border-${style === "dashed" ? "dashed" : style === "dotted" ? "dotted" : "solid"} border-border`}
    />
  );
}

function ProductsBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const title = (data.title as string) || "";
  const maxProducts = (data.maxProducts as number) || 6;
  const [products, setProducts] = useState<
    Array<{
      id: string;
      name: string;
      slug: string;
      shortDescription: string | null;
      price: number;
      comparePrice: number | null;
      images: string;
      Category: { id: string; name: string } | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `/api/products?featured=true&limit=${maxProducts}`,
        );
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <section className="py-12">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>
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
                onClick={() => onNavigate && onNavigate("product", product.id)}
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
                  {product.Category && (
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {product.Category.name}
                    </span>
                  )}
                  <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-lg font-bold text-emerald-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.comparePrice &&
                      product.comparePrice > product.price && (
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
          <p className="text-muted-foreground">
            No featured products available yet.
          </p>
        </Card>
      )}
    </section>
  );
}

function FaqBlock({ data }: { data: Record<string, unknown> }) {
  const title = (data.title as string) || "";
  const items =
    (data.items as Array<{ question: string; answer: string }>) || [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-12">
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>
        </div>
      )}
      <div className="max-w-3xl mx-auto space-y-3">
        {items.map((item, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <button
              className="flex w-full items-center justify-between px-6 py-4 text-left font-medium hover:bg-muted/50 transition-colors"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span>{item.question}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                  openIndex === i ? "rotate-180" : ""
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

function CountUp({
  end,
  suffix = "",
}: {
  end: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, end, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [inView, end]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

function TrustBarBlock({ data }: { data: Record<string, unknown> }) {
  const stats =
    (data.stats as Array<{ value: number; suffix: string; label: string }>) ||
    [];
  if (stats.length === 0) return null;

  return (
    <section className="border-y bg-muted/50">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-border">
          {stats.map((stat, i) => (
            <div key={i} className="text-center px-4 py-4 md:py-0">
              <div className="text-2xl md:text-3xl font-bold text-foreground">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AudienceCardsBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const label = (data.label as string) || "";
  const heading = (data.heading as string) || "";
  const description = (data.description as string) || "";
  const cards =
    (data.cards as Array<{
      title: string;
      description: string;
      cta: string;
    }>) || [];

  return (
    <section className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
      >
        {label && (
          <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground mb-2">
            {label}
          </p>
        )}
        {heading && (
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {heading}
          </h2>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mt-1 mb-8">
            {description}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="group border border-border/60 rounded-xl p-6 text-center hover:border-brand/30 hover:shadow-sm hover:-translate-y-0.5 transition-all"
            >
              <h3 className="font-semibold text-sm">{card.title}</h3>
              <p className="text-xs text-muted-foreground mt-2 mb-4">
                {card.description}
              </p>
              <Button
                size="sm"
                className="bg-brand text-brand-foreground hover:bg-brand-muted text-xs px-4 py-1.5 h-auto"
                onClick={() => onNavigate && onNavigate("contact")}
              >
                {card.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function CapabilitiesBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const label = (data.label as string) || "";
  const heading = (data.heading as string) || "";
  const items = (data.items as string[]) || [];
  const imageCaption = (data.imageCaption as string) || "";
  const ctaText = (data.ctaText as string) || "";
  const ctaLink = (data.ctaLink as string) || "";

  const iconList = [Building2, Verified, Layers, Package, ShieldCheck, Clock];

  return (
    <section className="bg-muted/30 border-y">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          {label && (
            <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground mb-2">
              {label}
            </p>
          )}
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3">
              {heading && (
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
                  {heading}
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((item, i) => {
                  const Icon = iconList[i % iconList.length];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      className="flex items-center gap-3 p-2"
                    >
                      <Icon className="h-5 w-5 text-brand shrink-0" />
                      <span className="text-sm">{item}</span>
                    </motion.div>
                  );
                })}
              </div>
              {ctaText && (
                <Button
                  variant="outline"
                  className="mt-6 text-sm"
                  onClick={() =>
                    onNavigate &&
                    onNavigate("content-page", ctaLink.replace("/page/", ""))
                  }
                >
                  {ctaText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="lg:col-span-2 relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
              <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center">
                <Building2 className="h-12 w-12 text-brand/40" />
              </div>
              {imageCaption && (
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-xs text-muted-foreground bg-background/80 backdrop-blur rounded-lg px-3 py-2">
                    {imageCaption}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ProductCategoriesBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const label = (data.label as string) || "";
  const heading = (data.heading as string) || "";
  const description = (data.description as string) || "";
  const categories =
    (data.categories as Array<{ name: string; variants: string }>) || [];
  const ctaText = (data.ctaText as string) || "";
  const ctaLink = (data.ctaLink as string) || "";

  return (
    <section className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
      >
        {label && (
          <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground mb-2">
            {label}
          </p>
        )}
        {heading && (
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {heading}
          </h2>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mt-1 mb-8">
            {description}
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="group text-center cursor-pointer"
              onClick={() => onNavigate && onNavigate("catalogue")}
            >
              <div className="aspect-square rounded-xl bg-muted flex items-center justify-center overflow-hidden border group-hover:border-brand/30 transition-colors">
                <Package className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="font-medium text-sm mt-2">{cat.name}</h3>
              <p className="text-xs text-muted-foreground">{cat.variants}</p>
            </motion.div>
          ))}
        </div>
        {ctaText && (
          <div className="text-center mt-10">
            <Button
              variant="outline"
              onClick={() => onNavigate && onNavigate("catalogue")}
            >
              {ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </motion.div>
    </section>
  );
}

function FactoryReelBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const label = (data.label as string) || "";
  const heading = (data.heading as string) || "";
  const description = (data.description as string) || "";
  const ctaText = (data.ctaText as string) || "";

  return (
    <section className="relative overflow-hidden bg-foreground/5">
      <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-brand-teal/10" />
      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {label && (
            <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground mb-2">
              {label}
            </p>
          )}
          {heading && (
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
              {heading}
            </h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
              {description}
            </p>
          )}
          <div className="relative max-w-3xl mx-auto aspect-video rounded-xl overflow-hidden bg-muted border">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-brand/90 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                <Play className="h-6 w-6 text-brand-foreground ml-0.5" />
              </div>
            </div>
          </div>
          {ctaText && (
            <Button
              variant="outline"
              className="mt-6"
              onClick={() =>
                onNavigate &&
                onNavigate(
                  "content-page",
                  ((data.ctaLink as string) || "").replace("/page/", ""),
                )
              }
            >
              {ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function CertificationsBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const label = (data.label as string) || "";
  const heading = (data.heading as string) || "";
  const items = (data.items as string[]) || [];
  const ctaText = (data.ctaText as string) || "";

  return (
    <section className="bg-muted/30 border-y">
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {label && (
            <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground mb-2">
              {label}
            </p>
          )}
          {heading && (
            <h2 className="text-xl md:text-2xl font-bold mb-8">{heading}</h2>
          )}
          <div className="flex flex-wrap justify-center gap-6 items-center">
            {items.map((cert) => (
              <div
                key={cert}
                className="w-20 h-14 rounded-lg bg-background border flex items-center justify-center text-xs font-semibold text-muted-foreground hover:border-brand/40 hover:text-brand transition-colors"
              >
                {cert}
              </div>
            ))}
          </div>
          {ctaText && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-8 text-muted-foreground"
              onClick={() =>
                onNavigate &&
                onNavigate(
                  "content-page",
                  ((data.ctaLink as string) || "").replace("/page/", ""),
                )
              }
            >
              {ctaText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function LeadCaptureBlock({ data }: { data: Record<string, unknown> }) {
  const heading = (data.heading as string) || "";
  const description = (data.description as string) || "";
  const submitText = (data.submitText as string) || "Submit";
  const disclaimer = (data.disclaimer as string) || "";
  const fields =
    (data.fields as Array<{
      name: string;
      label: string;
      type: string;
      required: boolean;
      placeholder: string;
      options?: string[];
    }>) || [];
  const messageField = (data.messageField as boolean) ?? true;

  return (
    <section className="relative overflow-hidden bg-foreground text-background">
      <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-muted to-brand/90" />
      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {heading && (
            <h2 className="text-2xl md:text-3xl font-bold text-center text-brand-foreground mb-2">
              {heading}
            </h2>
          )}
          {description && (
            <p className="text-sm text-brand-foreground/70 text-center mb-8">
              {description}
            </p>
          )}

          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const formData = new FormData(form);
              try {
                const res = await fetch("/api/enquiries", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(Object.fromEntries(formData)),
                });
                if (res.ok) {
                  toast.success(
                    "Enquiry submitted! We'll call you back within 24 hours.",
                    { icon: <Send className="h-4 w-4" /> },
                  );
                  form.reset();
                } else {
                  const err = await res.json();
                  toast.error(
                    err.error || "Failed to submit. Please try again.",
                  );
                }
              } catch {
                toast.error("Network error. Please try again.");
              }
            }}
          >
            {fields.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {fields.map((field) =>
                  field.type === "select" ? (
                    <Select key={field.name} name={field.name}>
                      <SelectTrigger className="bg-background/10 border-brand-foreground/20 text-brand-foreground">
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.options || []).map((opt) => (
                          <SelectItem key={opt} value={opt.toLowerCase()}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      key={field.name}
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="bg-background/10 border-brand-foreground/20 text-brand-foreground placeholder:text-brand-foreground/50"
                    />
                  ),
                )}
              </div>
            )}
            {messageField && (
              <Textarea
                name="message"
                placeholder="Brief requirement or message (optional)"
                rows={3}
                className="bg-background/10 border-brand-foreground/20 text-brand-foreground placeholder:text-brand-foreground/50"
              />
            )}
            <div className="text-center">
              <Button
                type="submit"
                size="lg"
                className="bg-brand-foreground text-brand hover:bg-brand-foreground/90"
              >
                {submitText}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
            {disclaimer && (
              <p className="text-xs text-brand-foreground/50 text-center mt-3">
                {disclaimer}
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}

function LeadershipBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const label = (data.label as string) || "";
  const heading = (data.heading as string) || "";
  const members =
    (data.members as Array<{ name: string; role: string; bio: string }>) || [];
  const ctaText = (data.ctaText as string) || "";

  return (
    <section className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
      >
        {label && (
          <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground mb-2">
            {label}
          </p>
        )}
        {heading && (
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">
            {heading}
          </h2>
        )}
        <div className="grid md:grid-cols-3 gap-6">
          {members.map((person, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex items-start gap-4 p-4 rounded-xl border"
            >
              <div className="w-12 h-14 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Photo</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm">{person.name}</h3>
                <p className="text-xs text-muted-foreground">{person.role}</p>
                <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">
                  {person.bio}
                </p>
              </div>
            </motion.div>
          ))}
          {ctaText && (
            <div className="flex flex-col justify-center items-center gap-2 p-4 rounded-xl border border-dashed">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() =>
                  onNavigate &&
                  onNavigate(
                    "content-page",
                    ((data.ctaLink as string) || "").replace("/page/", ""),
                  )
                }
              >
                {ctaText}
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

function PartnerLogosBlock({ data }: { data: Record<string, unknown> }) {
  const heading = (data.heading as string) || "";
  const testimonials =
    (data.testimonials as Array<{ quote: string; author: string }>) || [];
  const logoCount = (data.logoCount as number) || 0;

  return (
    <section className="bg-muted/30 border-y">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          {heading && (
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-8">
              {heading}
            </h2>
          )}
          {testimonials.length > 0 && (
            <div className="grid md:grid-cols-3 gap-4 mb-10">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="p-5 rounded-xl border bg-background"
                >
                  <p className="text-sm text-foreground leading-relaxed italic">
                    {t.quote}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    — {t.author}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
          {logoCount > 0 && (
            <div className="flex flex-wrap justify-center gap-8 items-center border-t pt-8">
              {Array.from({ length: logoCount }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-16 rounded bg-muted border flex items-center justify-center text-xs text-muted-foreground"
                >
                  Logo {i + 1}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function StickyCtaBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const text = (data.text as string) || "";
  const buttons =
    (data.buttons as Array<{ text: string; type: string; action: string }>) ||
    [];

  return (
    <div className="sticky bottom-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        {text && <span className="text-sm font-semibold">{text}</span>}
        <div className="flex gap-2">
          {buttons.map((btn, i) => (
            <Button
              key={i}
              size="sm"
              variant={
                btn.type === "primary"
                  ? "default"
                  : btn.type === "whatsapp"
                    ? "outline"
                    : "ghost"
              }
              className={
                btn.type === "primary"
                  ? "bg-brand text-brand-foreground hover:bg-brand-muted"
                  : btn.type === "whatsapp"
                    ? "border-brand-teal text-brand-teal hover:bg-brand-teal/10"
                    : "text-muted-foreground"
              }
              onClick={() => {
                if (btn.action === "enquiry")
                  onNavigate && onNavigate("contact");
                else if (btn.action === "whatsapp")
                  window.open("https://wa.me/", "_blank");
              }}
            >
              {btn.type === "whatsapp" && (
                <MessageCircle className="mr-1.5 h-4 w-4" />
              )}
              {btn.type === "phone" && <Phone className="mr-1.5 h-4 w-4" />}
              {btn.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

const BLOCK_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  hero: Image,
  features: LayoutGrid,
  cta: MousePointerClick,
  testimonials: Quote,
  "image-gallery": Images,
  text: Type,
  spacer: MoveVertical,
  divider: Minus,
  products: Package,
  faq: HelpCircle,
  slider: GalleryHorizontal,
  "product-carousel": Layers,
  about: User,
  "trust-bar": TrendingUp,
  "audience-cards": Users,
  capabilities: Factory,
  "product-categories": LayoutGrid,
  "factory-reel": Video,
  certifications: Award,
  "lead-capture": FormInput,
  leadership: UserCircle,
  "partner-logos": Building,
  "sticky-cta": ArrowDownToLine,
  "blog-grid": Newspaper,
  "pricing-table": CreditCard,
};

function BlogGridBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const title = (data.title as string) || "Latest from our blog";
  const maxPosts = (data.maxPosts as number) || 6;
  const layout = (data.layout as string) || "grid";
  const showFeatured = (data.showFeatured as boolean) !== false;

  const [posts, setPosts] = useState<
    Array<{
      id: string;
      title: string;
      slug: string;
      excerpt: string;
      coverImage: string;
      publishedAt: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch(`/api/blog?limit=${maxPosts}&published=true`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts?.slice(0, maxPosts) || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [maxPosts]);

  if (loading) {
    return (
      <div className="py-16">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-16">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground">No blog posts available yet.</p>
        </div>
      </div>
    );
  }

  const displayPosts = showFeatured ? posts : posts.slice(1);

  return (
    <div className="py-16">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">{title}</h2>
        </div>

        {layout === "list" ? (
          <div className="space-y-6 max-w-3xl mx-auto">
            {displayPosts.map((post) => (
              <div
                key={post.id}
                className="flex gap-4 items-start rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="h-20 w-20 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{post.title}</h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <button
                    onClick={() =>
                      onNavigate?.("blog-post", { postId: post.id })
                    }
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-2 inline-flex items-center gap-1"
                  >
                    Read more <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : layout === "carousel" ? (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6">
              {displayPosts.map((post) => (
                <div
                  key={post.id}
                  className="min-w-[280px] max-w-[320px] rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  {post.coverImage && (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-40 w-full rounded-t-xl object-cover"
                    />
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold line-clamp-2">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-1">
                        {post.excerpt}
                      </p>
                    )}
                    <button
                      onClick={() =>
                        onNavigate?.("blog-post", { postId: post.id })
                      }
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-3 inline-flex items-center gap-1"
                    >
                      Read more <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="h-48 w-full bg-muted flex items-center justify-center">
                    <Newspaper className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    {post.publishedAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                    <button
                      onClick={() =>
                        onNavigate?.("blog-post", { postId: post.id })
                      }
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
                    >
                      Read more <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <button
            onClick={() => onNavigate?.("blog")}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            View all posts <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PricingTableBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const title = (data.title as string) || "Our Pricing";
  const description = (data.description as string) || "";
  const tiers =
    (data.tiers as Array<{
      name: string;
      price: string;
      description: string;
      features: string[];
      ctaText: string;
      ctaLink: string;
      highlighted: boolean;
    }>) || [];

  if (tiers.length === 0) return null;

  return (
    <div className="py-16">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">{title}</h2>
          {description && (
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`rounded-xl border bg-card p-6 flex flex-col relative ${
                tier.highlighted
                  ? "border-emerald-500 shadow-lg ring-1 ring-emerald-500 scale-105 md:scale-110 z-10"
                  : "shadow-sm"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="text-center mt-2">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <p className="text-3xl font-bold mt-3">{tier.price}</p>
                {tier.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {tier.description}
                  </p>
                )}
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {(tier.features || []).map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  if (tier.ctaLink)
                    onNavigate?.(
                      "content-page",
                      tier.ctaLink.replace("/page/", ""),
                    );
                  else onNavigate?.("contact");
                }}
                className={`mt-6 w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                  tier.highlighted
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-muted text-foreground hover:bg-accent"
                }`}
              >
                {tier.ctaText || "Get started"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SliderBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const items =
    (data.items as Array<{
      image: string;
      title: string;
      subtitle: string;
      link: string;
    }>) || [];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (data.autoplay && items.length > 1) {
      const timer = setInterval(
        () => {
          setActiveIndex((prev) => (prev + 1) % items.length);
        },
        (data.interval as number) || 5000,
      );
      return () => clearInterval(timer);
    }
  }, [items.length, data.autoplay, data.interval]);

  if (items.length === 0) return null;

  return (
    <div className="relative h-[300px] sm:h-[450px] w-full overflow-hidden rounded-xl">
      {items.map((item, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-emerald-700" />
          )}
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center p-6">
            <h2 className="text-3xl font-bold sm:text-5xl">{item.title}</h2>
            <p className="mt-4 text-lg text-white/90 max-w-2xl">
              {item.subtitle}
            </p>
            {item.link && (
              <Button
                className="mt-8 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => onNavigate && onNavigate("catalogue")}
              >
                View Collection
              </Button>
            )}
          </div>
        </div>
      ))}
      {items.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white hover:bg-black/40"
            onClick={() =>
              setActiveIndex((prev) => (prev - 1 + items.length) % items.length)
            }
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white hover:bg-black/40"
            onClick={() => setActiveIndex((prev) => (prev + 1) % items.length)}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  );
}

function AboutBlock({
  data,
  onNavigate,
}: {
  data: Record<string, unknown>;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const title = (data.title as string) || "";
  const content = (data.content as string) || "";
  const image = (data.image as string) || "";
  const imagePosition = (data.imagePosition as string) || "left";
  const buttonText = (data.buttonText as string) || "";

  return (
    <section className="py-12">
      <div
        className={`flex flex-col ${imagePosition === "right" ? "lg:flex-row-reverse" : "lg:flex-row"} gap-12 items-center`}
      >
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <div
            className="prose prose-neutral dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(content, SANITIZE_OPTIONS),
            }}
          />
          {buttonText && (
            <Button
              variant="outline"
              onClick={() => onNavigate && onNavigate("contact")}
            >
              {buttonText}
            </Button>
          )}
        </div>
        {image && (
          <div className="flex-1 w-full max-w-xl">
            <img
              src={image}
              alt={title}
              className="rounded-2xl shadow-xl w-full object-cover aspect-4/3"
            />
          </div>
        )}
      </div>
    </section>
  );
}

export function PageBlockRenderer({
  block,
  blocks,
  onNavigate,
}: BlockRendererProps & { blocks?: PageBlock[] }) {
  if (blocks) {
    return (
      <>
        {blocks.map((b) => (
          <PageBlockRenderer key={b.id} block={b} onNavigate={onNavigate} />
        ))}
      </>
    );
  }

  if (!block) return null;
  const { type, data } = block;

  const bgColor = (data.bgColor as string) || "";
  const paddingTop = (data.paddingTop as number) ?? 80;
  const paddingBottom = (data.paddingBottom as number) ?? 80;
  const customClass = (data.customClass as string) || "";

  const styleContainer = (element: React.ReactNode) => {
    if (!bgColor && paddingTop === 80 && paddingBottom === 80 && !customClass)
      return element;
    return (
      <div
        className={customClass || undefined}
        style={{
          backgroundColor: bgColor || undefined,
          paddingTop: paddingTop !== 80 ? `${paddingTop}px` : undefined,
          paddingBottom:
            paddingBottom !== 80 ? `${paddingBottom}px` : undefined,
        }}
      >
        {element}
      </div>
    );
  };

  const blockElement = (() => {
    switch (type) {
      case "hero":
        return <HeroBlock data={data} onNavigate={onNavigate} />;
      case "features":
        return <FeaturesBlock data={data} />;
      case "cta":
        return <CtaBlock data={data} onNavigate={onNavigate} />;
      case "testimonials":
        return <TestimonialsBlock data={data} />;
      case "image-gallery":
        return <ImageGalleryBlock data={data} />;
      case "text":
        return <TextBlock data={data} />;
      case "spacer":
        return <SpacerBlock data={data} />;
      case "divider":
        return <DividerBlock data={data} />;
      case "products":
      case "product-carousel":
        return <ProductsBlock data={data} onNavigate={onNavigate} />;
      case "faq":
        return <FaqBlock data={data} />;
      case "slider":
        return <SliderBlock data={data} onNavigate={onNavigate} />;
      case "about":
        return <AboutBlock data={data} onNavigate={onNavigate} />;
      case "trust-bar":
        return <TrustBarBlock data={data} />;
      case "audience-cards":
        return <AudienceCardsBlock data={data} onNavigate={onNavigate} />;
      case "capabilities":
        return <CapabilitiesBlock data={data} onNavigate={onNavigate} />;
      case "product-categories":
        return <ProductCategoriesBlock data={data} onNavigate={onNavigate} />;
      case "factory-reel":
        return <FactoryReelBlock data={data} onNavigate={onNavigate} />;
      case "certifications":
        return <CertificationsBlock data={data} onNavigate={onNavigate} />;
      case "lead-capture":
        return <LeadCaptureBlock data={data} />;
      case "leadership":
        return <LeadershipBlock data={data} onNavigate={onNavigate} />;
      case "partner-logos":
        return <PartnerLogosBlock data={data} />;
      case "sticky-cta":
        return <StickyCtaBlock data={data} onNavigate={onNavigate} />;
      case "blog-grid":
        return <BlogGridBlock data={data} onNavigate={onNavigate} />;
      case "pricing-table":
        return <PricingTableBlock data={data} onNavigate={onNavigate} />;
      default:
        return null;
    }
  })();

  return blockElement ? styleContainer(blockElement) : null;
}

export { BLOCK_ICONS };
