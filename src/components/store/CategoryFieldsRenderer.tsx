"use client";

import { useState, useEffect } from "react";
import { Send, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { getFirstImage } from "@/lib/utils";

export interface CategoryFieldData {
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroDescription: string | null;
  contentSplitImage: string | null;
  contentSplitHeading: string | null;
  contentSplitParagraph: string | null;
  contentSplitBullets: string;
  cardsTitle: string | null;
  cardsProductIds: string;
  cardsMaxCount: number;
  cardsColumns: number;
  ctaHeading: string | null;
  ctaDescription: string | null;
  ctaBulkText: string | null;
  ctaBulkLink: string | null;
  ctaPrivateLabelText: string | null;
  ctaPrivateLabelLink: string | null;
  ctaBackgroundColor: string | null;
  processTitle: string | null;
  processSubtitle: string | null;
  processSteps: string;
  infographicImage: string | null;
  infographicCaption: string | null;
  infographicAltText: string | null;
}

function parseJsonArray<T>(val: string): T[] {
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function HeroSection({
  title,
  subtitle,
  description,
}: {
  title: string;
  subtitle: string;
  description: string;
}) {
  if (!title && !subtitle && !description) return null;
  return (
    <section className="container mx-auto max-w-3xl px-4 py-12 text-center">
      {subtitle && (
        <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
          {subtitle}
        </p>
      )}
      {title && (
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
      )}
      {description && (
        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </section>
  );
}

function ContentSplitSection({
  image,
  heading,
  paragraph,
  bullets,
}: {
  image: string;
  heading: string;
  paragraph: string;
  bullets: string[];
}) {
  if (!heading && !paragraph && bullets.length === 0) return null;
  return (
    <section className="container mx-auto max-w-5xl px-4 py-16">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
          {image ? (
            <img
              src={image}
              alt={heading}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <div>
          {heading && (
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{heading}</h2>
          )}
          {paragraph && (
            <p className="text-muted-foreground leading-relaxed mb-6">
              {paragraph}
            </p>
          )}
          {bullets.length > 0 && (
            <ul className="space-y-3">
              {bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-foreground">{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function CardsSection({
  title,
  productIds,
  maxCount,
  columns,
  onNavigate,
}: {
  title: string;
  productIds: string[];
  maxCount: number;
  columns: number;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  const [products, setProducts] = useState<
    Array<{
      id: string;
      name: string;
      slug: string;
      shortDescription: string | null;
      images: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const params = new URLSearchParams({
          all: "true",
          limit: String(maxCount),
        });
        if (productIds.length > 0) {
          params.set("ids", productIds.join(","));
        }
        const res = await fetch(`/api/products?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts((data.products || []).slice(0, maxCount));
        }
      } catch {
        /* silently fail */
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [productIds.join(","), maxCount]);

  if (loading) {
    return (
      <section className="container mx-auto max-w-6xl px-4 py-16">
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            {title}
          </h2>
        )}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${Math.min(columns, 4)}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: Math.min(columns, 4) }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card animate-pulse overflow-hidden"
            >
              <div className="h-48 bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="container mx-auto max-w-6xl px-4 py-16">
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          {title}
        </h2>
      )}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${Math.min(columns, 4)}, minmax(0, 1fr))`,
        }}
      >
        {products.map((product) => {
          const image = getFirstImage(product.images);
          return (
            <div
              key={product.id}
              className="rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-md"
            >
              <div className="relative h-48 bg-muted overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                    <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1">{product.name}</h3>
                {product.shortDescription && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.shortDescription}
                  </p>
                )}
                <Button
                  size="sm"
                  className="w-full mt-3"
                  onClick={() =>
                    useAppStore.getState().openEnquiryModal(
                      product.name,
                      product.id,
                    )
                  }
                >
                  <Send className="mr-2 h-3.5 w-3.5" />
                  Enquire
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CtaSection({
  heading,
  description,
  bulkText,
  bulkLink,
  privateLabelText,
  privateLabelLink,
  backgroundColor,
  onNavigate,
}: {
  heading: string;
  description: string;
  bulkText: string;
  bulkLink: string;
  privateLabelText: string;
  privateLabelLink: string;
  backgroundColor: string;
  onNavigate?: (page: string, data?: unknown) => void;
}) {
  if (!heading && !description) return null;
  const isDark = backgroundColor !== "light";

  return (
    <section
      className={`py-16 ${isDark ? "bg-foreground text-background" : "bg-muted"}`}
    >
      <div className="container mx-auto max-w-3xl px-4 text-center">
        {heading && (
          <h2
            className={`text-2xl md:text-3xl font-bold mb-3 ${isDark ? "text-background" : ""}`}
          >
            {heading}
          </h2>
        )}
        {description && (
          <p
            className={`text-lg mb-8 max-w-xl mx-auto ${isDark ? "text-background/70" : "text-muted-foreground"}`}
          >
            {description}
          </p>
        )}
        <div className="flex flex-wrap gap-4 justify-center">
          {bulkText && (
            <Button
              size="lg"
              onClick={() => {
                const [page, slug] = (bulkLink || "/contact")
                  .replace(/^\//, "")
                  .split("/");
                if (page === "contact") {
                  useAppStore.getState().openEnquiryModal(heading);
                } else {
                  onNavigate?.("content-page", slug || page);
                }
              }}
            >
              {bulkText}
            </Button>
          )}
          {privateLabelText && (
            <Button
              size="lg"
              variant={isDark ? "secondary" : "outline"}
              onClick={() => {
                const [page, slug] = (privateLabelLink || "/contact")
                  .replace(/^\//, "")
                  .split("/");
                if (page === "contact") {
                  useAppStore.getState().openEnquiryModal(heading);
                } else {
                  onNavigate?.("content-page", slug || page);
                }
              }}
              className="text-white"
            >
              {privateLabelText}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function ProcessSection({
  title,
  subtitle,
  steps,
}: {
  title: string;
  subtitle: string;
  steps: Array<{ title: string; description: string }>;
}) {
  if (steps.length === 0) return null;
  return (
    <section className="container mx-auto max-w-5xl px-4 py-16">
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          {subtitle}
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center relative"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold mb-3">
              {i + 1}
            </div>
            <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
            <p className="text-xs text-muted-foreground">{step.description}</p>
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-5 left-[60%] w-[80%] h-px bg-border" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function InfographicSection({
  image,
  caption,
  altText,
}: {
  image: string;
  caption: string;
  altText: string;
}) {
  if (!image && !caption) return null;
  return (
    <section className="container mx-auto max-w-5xl px-4 py-16">
      <div className="rounded-xl overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={altText || "Infographic"}
            className="w-full h-auto object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-gradient-to-br from-primary/5 to-primary/10">
            <ImageIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">
              Infographic placeholder
            </p>
            {caption && (
              <p className="text-muted-foreground/60 text-xs mt-1 max-w-xs">
                {caption}
              </p>
            )}
          </div>
        )}
      </div>
      {caption && (
        <p className="text-sm text-muted-foreground text-center mt-3">
          {caption}
        </p>
      )}
    </section>
  );
}

interface CategoryFieldsRendererProps {
  fields: CategoryFieldData;
  onNavigate?: (page: string, data?: unknown) => void;
}

export function CategoryFieldsRenderer({
  fields,
  onNavigate,
}: CategoryFieldsRendererProps) {
  const bullets = parseJsonArray<string>(fields.contentSplitBullets);
  const productIds = parseJsonArray<string>(fields.cardsProductIds);
  const steps = parseJsonArray<{ title: string; description: string }>(
    fields.processSteps,
  );

  return (
    <>
      <HeroSection
        title={fields.heroTitle || ""}
        subtitle={fields.heroSubtitle || ""}
        description={fields.heroDescription || ""}
      />

      <ContentSplitSection
        image={fields.contentSplitImage || ""}
        heading={fields.contentSplitHeading || ""}
        paragraph={fields.contentSplitParagraph || ""}
        bullets={bullets}
      />

      <CardsSection
        title={fields.cardsTitle || ""}
        productIds={productIds}
        maxCount={fields.cardsMaxCount}
        columns={fields.cardsColumns}
        onNavigate={onNavigate}
      />

      <CtaSection
        heading={fields.ctaHeading || ""}
        description={fields.ctaDescription || ""}
        bulkText={fields.ctaBulkText || ""}
        bulkLink={fields.ctaBulkLink || ""}
        privateLabelText={fields.ctaPrivateLabelText || ""}
        privateLabelLink={fields.ctaPrivateLabelLink || ""}
        backgroundColor={fields.ctaBackgroundColor || "dark"}
        onNavigate={onNavigate}
      />

      <ProcessSection
        title={fields.processTitle || ""}
        subtitle={fields.processSubtitle || ""}
        steps={steps}
      />

      <InfographicSection
        image={fields.infographicImage || ""}
        caption={fields.infographicCaption || ""}
        altText={fields.infographicAltText || ""}
      />
    </>
  );
}
