"use client";

import { useState, useEffect } from "react";
import { Package, Send, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFirstImage } from "@/lib/utils";
import { useSeo } from "@/lib/use-seo";
import { useAppStore } from "@/lib/store";

interface ProductPageProps {
  slug: string;
  onNavigate: (page: string, data?: unknown) => void;
}

interface FaqItem {
  question: string;
  answer: string;
}

export function ProductPage({ slug, onNavigate }: ProductPageProps) {
  const [product, setProduct] = useState<{
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    description: string | null;
    images: string;
    price: number;
    metaTitle: string | null;
    metaDescription: string | null;
    ogImage: string | null;
    Category: { id: string; name: string; slug: string; faqTitle: string | null; faqItems: string } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products?slug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          const prod = (data.products || [])[0];
          if (prod) {
            const { blocks: _blocks, ...rest } = prod;
            setProduct(rest);
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

  useSeo(`product-${slug}`, {
    title: product?.metaTitle || product?.name,
    description: product?.metaDescription || product?.shortDescription,
    ogImage: product?.ogImage,
  });

  const faqItems: FaqItem[] = (() => {
    try {
      const parsed = JSON.parse(product?.Category?.faqItems || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Product not found</h2>
        <p className="text-sm text-muted-foreground mb-4">
          The product you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button onClick={() => onNavigate("catalogue")}>
          Back to catalogue
        </Button>
      </div>
    );
  }

  const image = getFirstImage(product.images);

  return (
    <div className="flex flex-col">
      <section className="container mx-auto max-w-3xl px-4 pt-12 md:pt-16 pb-6 md:pb-8 text-center">
        {image && (
          <div className="relative h-48 sm:h-56 md:h-64 w-full max-w-lg mx-auto mb-4 md:mb-6 rounded-xl overflow-hidden bg-muted">
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 md:mb-3">
          {product.name}
        </h1>
        {product.shortDescription && (
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            {product.shortDescription}
          </p>
        )}
        <Button
          size="default"
          className="mt-4 md:mt-6 w-full sm:w-auto text-sm sm:text-base"
          onClick={() =>
            useAppStore.getState().openEnquiryModal(product.name, product.id)
          }
        >
          <Send className="mr-2 h-4 w-4" />
          Enquire Now
        </Button>
      </section>

      {faqItems.length > 0 && (
        <section className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
          {product.Category?.faqTitle && (
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 md:mb-10">
              {product.Category.faqTitle}
            </h2>
          )}
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <button
                  className="flex w-full items-center justify-between px-4 md:px-6 py-3 md:py-4 text-left text-sm md:text-base font-medium hover:bg-muted/50 transition-colors"
                  onClick={() => setFaqOpenIndex(faqOpenIndex === i ? null : i)}
                >
                  <span className="pr-2">{item.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 md:h-5 md:w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      faqOpenIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {faqOpenIndex === i && (
                  <div className="px-4 md:px-6 pb-3 md:pb-4 text-sm md:text-base text-muted-foreground">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
