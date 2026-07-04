"use client";

import { useState, useEffect } from "react";
import { Package, Send, ChevronDown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFirstImage } from "@/lib/utils";
import { formatPrice as libFormatPrice } from "@/lib/pricing";
import { toast } from "sonner";
import { useSeo } from "@/lib/use-seo";
import { useAppStore } from "@/lib/store";
import { StoreLoading } from "./StoreLoading";
import { ProductReviews } from "./ProductReviews";
import { RecentlyViewed } from "./RecentlyViewed";

interface ProductPageProps {
  slug: string;
  onNavigate: (page: string, data?: unknown) => void;
}

interface FaqItem {
  question: string;
  answer: string;
}

export function ProductPage({ slug, onNavigate }: ProductPageProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
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
    categoryId: string | null;
    Category: {
      id: string;
      name: string;
      slug: string;
      faqTitle: string | null;
      faqItems: string;
    } | null;
  } | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
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
            const firstImg = getFirstImage(rest.images);
            if (firstImg) setActiveImage(firstImg);

            // Recently Viewed logic
            try {
                const stored = localStorage.getItem('recently_viewed') || '[]';
                let viewed = JSON.parse(stored);
                viewed = viewed.filter((p: any) => p.id !== rest.id);
                viewed.unshift({ id: rest.id, name: rest.name, slug: rest.slug, images: rest.images, price: rest.price });
                localStorage.setItem('recently_viewed', JSON.stringify(viewed.slice(0, 10)));
            } catch { /* ignore */ }

            // Fetch related products
            if (rest.categoryId) {
                fetch(`/api/products?categoryId=${rest.categoryId}&limit=5`)
                    .then(r => r.ok ? r.json() : null)
                    .then(data => {
                        if (data?.products) {
                            setRelatedProducts(data.products.filter((p: any) => p.id !== rest.id).slice(0, 4));
                        }
                    })
                    .catch(() => {});
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
    return <StoreLoading />;
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

  const images = (() => {
    try {
      const parsed = JSON.parse(product.images || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
  const settings = useAppStore((s) => s.settings);
  const isB2C = settings?.store_mode === "b2c";
  const addToCart = useAppStore((s) => s.addToCart);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: image || undefined,
    });
    toast.success("Added to cart");
  };

  return (
    <div className="flex flex-col">
      <section className="container mx-auto max-w-3xl px-4 pt-12 md:pt-16 pb-6 md:pb-8 text-center">
        {activeImage && (
          <div className="space-y-4 mb-6">
            <div className="relative h-64 sm:h-80 md:h-96 w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-muted border shadow-sm">
                <img
                    src={activeImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
            </div>
            {images.length > 1 && (
                <div className="flex justify-center gap-2 overflow-x-auto py-2">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveImage(img)}
                            className={`relative h-16 w-16 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                            <img src={img} alt="" className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
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
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        {isB2C ? (
          <>
            <Button
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-base px-8"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-base px-8"
              onClick={() => {
                handleAddToCart();
                onNavigate("cart");
              }}
            >
              Buy Now
            </Button>
          </>
        ) : (
          <Button
            size="lg"
            className="w-full sm:w-auto text-sm sm:text-base px-8"
            onClick={() =>
              useAppStore.getState().openEnquiryModal(product.name, product.id)
            }
          >
            <Send className="mr-2 h-4 w-4" />
            Enquire Now
          </Button>
        )}
      </div>
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

      {isB2C && (
        <section className="container mx-auto max-w-3xl px-4 py-12 md:py-16 border-t">
          <ProductReviews productId={product.id} />
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="container mx-auto max-w-3xl px-4 py-12 border-t">
            <h2 className="text-xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.map((p) => {
                    const img = getFirstImage(p.images);
                    return (
                        <div key={p.id} className="group cursor-pointer" onClick={() => onNavigate("product-page", p.slug)}>
                            <div className="aspect-square bg-muted rounded-xl overflow-hidden mb-2">
                                {img && <img src={img} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />}
                            </div>
                            <p className="text-sm font-medium truncate">{p.name}</p>
                            <p className="text-xs text-primary font-bold">{libFormatPrice(p.price, settings?.currency || "INR")}</p>
                        </div>
                    );
                })}
            </div>
        </section>
      )}

      <section className="container mx-auto max-w-3xl px-4 py-12 border-t">
        <RecentlyViewed productId={product.id} />
      </section>
    </div>
  );
}
