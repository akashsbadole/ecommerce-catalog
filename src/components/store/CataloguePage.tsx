"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { Search, ShoppingCart, X, Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuickViewModal } from "./QuickViewModal";
import { useAppStore } from "@/lib/store";
import {
  calculateTieredPrice,
  formatPrice as libFormatPrice,
} from "@/lib/pricing";
import { getFirstImage } from "@/lib/utils";
import { useContentPage, getPageContentData } from "@/lib/use-page-content";
import { BLOCK_DEFAULTS } from "@/lib/page-blocks";
import { useSeo } from "@/lib/use-seo";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  price: number;
  comparePrice: number | null;
  wholesalePrice: number | null;
  minOrderQty: number;
  images: string;
  Category: { id: string; name: string; slug?: string } | null;
  isFeatured: boolean;
  specifications?: string | null;
}

interface CataloguePageProps {
  onNavigate: (page: string, data?: unknown) => void;
  data?: Record<string, unknown>;
}

export function CataloguePage({
  onNavigate,
  data: externalData,
}: CataloguePageProps) {
  const { auth, settings } = useAppStore();
  const { blocks, loading: cmsLoading } = useContentPage("catalogue-page-content");
  const rawData = blocks ? getPageContentData(
    blocks,
    "catalogue-page-content",
    BLOCK_DEFAULTS["catalogue-page-content"].defaultData,
  ) : null;
  const cmsData = externalData ?? (cmsLoading ? null : rawData ?? BLOCK_DEFAULTS["catalogue-page-content"].defaultData);
  const cmsPageTitle = cmsData ? (cmsData.pageTitle as string) || "Product Catalogue" : "";
  const cmsPageDescription = cmsData ? (cmsData.pageDescription as string) || "" : "";
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCategoryData, setSelectedCategoryData] =
    useState<Category | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );
  const [sortBy, setSortBy] = useState("featured");
  const [visibleCount, setVisibleCount] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const visibleProducts = useMemo(
    () => products.slice(0, visibleCount),
    [products, visibleCount],
  );
  const hasMore = visibleCount < products.length;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedCategory) params.set("categoryId", selectedCategory);
      if (sortBy && sortBy !== "featured") params.set("sort", sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const cat = categories.find((c) => c.id === selectedCategory);
      setSelectedCategoryData(cat || null);
    } else {
      setSelectedCategoryData(null);
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  useSeo(`catalogue-${selectedCategoryData?.slug || ""}`, {
    title: selectedCategoryData?.name || cmsPageTitle,
    description: cmsPageDescription || selectedCategoryData?.description || "Browse our complete catalogue of premium products.",
    siteName: settings?.site_name,
  });

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + 12, products.length));
            setLoadingMore(false);
          }, 300);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, products.length]);

  const userTier = auth.user?.tier;
  const formatPrice = (price: number) =>
    libFormatPrice(price, settings?.currency || "USD");

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setVisibleCount(12);
    setSearchQuery("");
  };

  const handleEnquiryClick = (product: Product) => {
    useAppStore.getState().openEnquiryModal(product.name, product.id);
  };

  return (
    <div className="flex flex-col">
      {/* Page Header */}
      <section className="bg-muted/30 border-b py-10 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold tracking-tight">
            {selectedCategoryData?.name || cmsPageTitle}
          </h1>
          {(cmsPageDescription || selectedCategoryData?.description) && (
            <p className="mt-2 text-muted-foreground max-w-3xl leading-relaxed">
              {selectedCategoryData?.description || cmsPageDescription}
            </p>
          )}
        </div>
      </section>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <section className="py-4 px-4 border-b bg-background sticky top-0 z-10">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => handleCategorySelect(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap shrink-0 ${
                  !selectedCategory
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search and Sort Bar */}
      <section className="border-b py-4 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products by name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(12);
                }}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setVisibleCount(12);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort:</span>
              <Select
                value={sortBy}
                onValueChange={(val) => {
                  setSortBy(val);
                  setVisibleCount(12);
                }}
              >
                <SelectTrigger className="w-[150px] h-8 text-sm">
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="name_asc">Name: A-Z</SelectItem>
                  <SelectItem value="name_desc">Name: Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-10 px-4">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border rounded-xl overflow-hidden">
                  <Skeleton className="h-28 sm:h-32 w-full" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No products found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search or filter to find what you&apos;re
                looking for.
              </p>
              <div className="flex gap-2 justify-center mt-4">
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setVisibleCount(12);
                    }}
                  >
                    Clear Search
                  </Button>
                )}
                {selectedCategory && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleCategorySelect(null);
                    }}
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {Math.min(visibleCount, products.length)} of{" "}
                  {products.length} products
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {visibleProducts.map((product) => {
                  const image = getFirstImage(product.images);
                  return (
                    <div
                      key={product.id}
                      className="border rounded-xl overflow-hidden bg-background group transition-shadow hover:shadow-lg"
                    >
                      <div
                        className="relative h-28 sm:h-32 bg-muted flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() =>
                          onNavigate(
                            "category",
                            product.Category?.slug || "all",
                          )
                        }
                      >
                        {image ? (
                          <Image
                            src={image}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            No image
                          </span>
                        )}
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute bottom-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md bg-white/90 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewProduct(product);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="p-3">
                        <h3
                          className="text-sm font-semibold mb-1 cursor-pointer hover:text-primary transition-colors line-clamp-1"
                          onClick={() =>
                            onNavigate(
                              "category",
                              product.Category?.slug || "all",
                            )
                          }
                        >
                          {product.name}
                        </h3>
                        {product.shortDescription && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {product.shortDescription}
                          </p>
                        )}
                        <Button
                          size="sm"
                          className="w-full text-xs font-medium"
                          onClick={() => handleEnquiryClick(product)}
                        >
                          Enquire
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div ref={sentinelRef} className="text-center mt-8">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLoadingMore(true);
                      setTimeout(() => {
                        setVisibleCount((prev) =>
                          Math.min(prev + 12, products.length),
                        );
                        setLoadingMore(false);
                      }, 300);
                    }}
                    disabled={loadingMore}
                    className="rounded-full px-6"
                  >
                    {loadingMore ? "Loading..." : "Load more products ↓"}
                  </Button>
                </div>
              )}
              {!hasMore && products.length > 12 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  All {products.length} products loaded
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          open={!!quickViewProduct}
          onOpenChange={(open) => {
            if (!open) setQuickViewProduct(null);
          }}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}
