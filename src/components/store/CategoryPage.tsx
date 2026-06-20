"use client";

import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/lib/use-seo";
import { CategoryFieldsRenderer } from "./CategoryFieldsRenderer";
import type { CategoryFieldData } from "./CategoryFieldsRenderer";

interface CategoryPageProps {
  slug: string;
  onNavigate: (page: string, data?: unknown) => void;
}

const emptyFields: CategoryFieldData = {
  heroTitle: null,
  heroSubtitle: null,
  heroDescription: null,
  contentSplitImage: null,
  contentSplitHeading: null,
  contentSplitParagraph: null,
  contentSplitBullets: "[]",
  cardsTitle: null,
  cardsProductIds: "",
  cardsMaxCount: 8,
  cardsColumns: 4,
  ctaHeading: null,
  ctaDescription: null,
  ctaBulkText: null,
  ctaBulkLink: null,
  ctaPrivateLabelText: null,
  ctaPrivateLabelLink: null,
  ctaBackgroundColor: null,
  processTitle: null,
  processSubtitle: null,
  processSteps: "[]",
  infographicImage: null,
  infographicCaption: null,
  infographicAltText: null,
};

export function CategoryPage({ slug, onNavigate }: CategoryPageProps) {
  const [category, setCategory] = useState<{
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    ogImage: string | null;
    slug: string;
  } | null>(null);
  const [fields, setFields] = useState<CategoryFieldData>(emptyFields);
  const [products, setProducts] = useState<
    Array<{
      id: string;
      name: string;
      slug: string;
      shortDescription: string | null;
      description: string | null;
      images: string;
      Category: { id: string; name: string; slug?: string } | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const catRes = await fetch(`/api/categories?slug=${slug}`);
        if (catRes.ok) {
          const catData = await catRes.json();
          const cat = (catData.categories || [])[0] || catData.category;
          if (cat) {
            setCategory(cat);
            setFields({
              heroTitle: cat.heroTitle || null,
              heroSubtitle: cat.heroSubtitle || null,
              heroDescription: cat.heroDescription || null,
              contentSplitImage: cat.contentSplitImage || null,
              contentSplitHeading: cat.contentSplitHeading || null,
              contentSplitParagraph: cat.contentSplitParagraph || null,
              contentSplitBullets: cat.contentSplitBullets || "[]",
              cardsTitle: cat.cardsTitle || null,
              cardsProductIds: cat.cardsProductIds || "",
              cardsMaxCount: cat.cardsMaxCount ?? 8,
              cardsColumns: cat.cardsColumns ?? 4,
              ctaHeading: cat.ctaHeading || null,
              ctaDescription: cat.ctaDescription || null,
              ctaBulkText: cat.ctaBulkText || null,
              ctaBulkLink: cat.ctaBulkLink || null,
              ctaPrivateLabelText: cat.ctaPrivateLabelText || null,
              ctaPrivateLabelLink: cat.ctaPrivateLabelLink || null,
              ctaBackgroundColor: cat.ctaBackgroundColor || null,
              processTitle: cat.processTitle || null,
              processSubtitle: cat.processSubtitle || null,
              processSteps: cat.processSteps || "[]",
              infographicImage: cat.infographicImage || null,
              infographicCaption: cat.infographicCaption || null,
              infographicAltText: cat.infographicAltText || null,
            });
            const prodRes = await fetch(`/api/products?categoryId=${cat.id}`);
            if (prodRes.ok) {
              const prodData = await prodRes.json();
              setProducts(prodData.products || []);
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  useSeo(`category-${slug}`, {
    title: category?.metaTitle || category?.name,
    description: category?.metaDescription || category?.description,
    ogImage: category?.ogImage,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Category not found</h2>
        <p className="text-sm text-muted-foreground mb-4">
          The category you're looking for doesn't exist.
        </p>
        <Button onClick={() => onNavigate("catalogue")}>
          Back to catalogue
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <CategoryFieldsRenderer fields={fields} onNavigate={onNavigate} />
    </div>
  );
}
