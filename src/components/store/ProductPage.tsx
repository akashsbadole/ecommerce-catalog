"use client";

import { useState, useEffect } from "react";
import { Package, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFirstImage } from "@/lib/utils";
import { useSeo } from "@/lib/use-seo";
import { useAppStore } from "@/lib/store";

interface ProductPageProps {
  slug: string;
  onNavigate: (page: string, data?: unknown) => void;
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
  } | null>(null);
  const [loading, setLoading] = useState(true);

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
      <section className="container mx-auto max-w-3xl px-4 pt-16 pb-8 text-center">
        {image && (
          <div className="relative h-64 w-full max-w-lg mx-auto mb-6 rounded-xl overflow-hidden bg-muted">
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          {product.name}
        </h1>
        {product.shortDescription && (
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            {product.shortDescription}
          </p>
        )}
        <Button
          size="lg"
          className="mt-6"
          onClick={() =>
            useAppStore.getState().openEnquiryModal(product.name, product.id)
          }
        >
          <Send className="mr-2 h-4 w-4" />
          Enquire Now
        </Button>
      </section>
    </div>
  );
}
