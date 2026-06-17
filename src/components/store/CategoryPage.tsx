"use client";

import { useState, useEffect } from "react";
import { Package, Send, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { getFirstImage } from "@/lib/utils";

interface CategoryPageProps {
  slug: string;
  onNavigate: (page: string, data?: unknown) => void;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  images: string;
  Category: { id: string; name: string; slug?: string } | null;
}

export function CategoryPage({ slug, onNavigate }: CategoryPageProps) {
  const [category, setCategory] = useState<{
    id: string;
    name: string;
    description: string | null;
    image: string | null;
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
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
      {/* Title & Description */}
      <div className="container mx-auto max-w-3xl px-4 pt-16 pb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground text-lg leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      {/* Products Grid */}
      {products.length > 0 && (
        <div className="container mx-auto max-w-6xl px-4 pb-16">
          <div className="grid md:grid-cols-3 gap-6">
            {products.map((product) => {
              const image = getFirstImage(product.images);
              return (
                <div
                  key={product.id}
                  className="border rounded-xl overflow-hidden bg-background transition-shadow hover:shadow-md"
                >
                  <div className="relative h-56 bg-muted overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                    {product.Category && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium inline-block mb-2">
                        {product.Category.name}
                      </span>
                    )}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {product.description ||
                        product.shortDescription ||
                        "Premium quality product manufactured in-house."}
                    </p>
                    <Button
                      className="w-full"
                      onClick={() =>
                        useAppStore
                          .getState()
                          .openEnquiryModal(product.name, product.id)
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
        </div>
      )}
    </div>
  );
}
