"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Search, X, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { getFirstImage } from "@/lib/utils";
import { formatPrice as libFormatPrice } from "@/lib/pricing";

interface ProductResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string;
  Category: { id: string; name: string; slug: string } | null;
}

interface CategoryResult {
  id: string;
  name: string;
  slug: string;
  _count: { Product: number };
}

interface BlogPostResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
}

interface AutocompleteResults {
  products: ProductResult[];
  categories: CategoryResult[];
  blogPosts: BlogPostResult[];
}

interface SearchAutocompleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const POPULAR_SEARCHES = [
  "Saree",
  "Kurti",
  "Lehenga",
  "Cotton",
  "Silk",
  "Wholesale",
];

const RECENT_SEARCHES_KEY = "search_autocomplete_history";
const MAX_RECENT = 8;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  if (typeof window === "undefined" || !query.trim()) return;
  const recent = getRecentSearches().filter(
    (q) => q.toLowerCase() !== query.toLowerCase(),
  );
  recent.unshift(query);
  localStorage.setItem(
    RECENT_SEARCHES_KEY,
    JSON.stringify(recent.slice(0, MAX_RECENT)),
  );
}

function removeRecentSearch(query: string) {
  if (typeof window === "undefined") return;
  const recent = getRecentSearches().filter((q) => q !== query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
}

function clearRecentSearches() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

export function SearchAutocomplete({
  open,
  onOpenChange,
}: SearchAutocompleteProps) {
  const { navigate, settings } = useAppStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AutocompleteResults>({
    products: [],
    categories: [],
    blogPosts: [],
  });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem(RECENT_SEARCHES_KEY)
          : null;
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showPopular, setShowPopular] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Focus input on open
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Reset state when closed
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current && !open) {
      setQuery("");
      setResults({ products: [], categories: [], blogPosts: [] });
      setActiveIndex(-1);
      setShowPopular(true);
    }
    prevOpen.current = open;
  }, [open]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults({ products: [], categories: [], blogPosts: [] });
      setShowPopular(true);
      return;
    }

    setShowPopular(false);
    setLoading(true);

    // Cancel previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(
        `/api/search/autocomplete?q=${encodeURIComponent(searchQuery)}`,
        { signal: controller.signal },
      );
      if (res.ok) {
        const data: AutocompleteResults = await res.json();
        setResults(data);
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setResults({ products: [], categories: [], blogPosts: [] });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      setActiveIndex(-1);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchResults(value);
      }, 300);
    },
    [fetchResults],
  );

  const hasResults =
    results.products.length > 0 ||
    results.categories.length > 0 ||
    results.blogPosts.length > 0;

  // Build flat list for keyboard navigation
  const flatItems: { type: string; data: any }[] = [];
  if (showPopular && !query.trim()) {
    POPULAR_SEARCHES.forEach((s) => flatItems.push({ type: "popular", data: s }));
    recentSearches.forEach((s) =>
      flatItems.push({ type: "recent", data: s }),
    );
  } else {
    results.products.forEach((p) =>
      flatItems.push({ type: "product", data: p }),
    );
    results.categories.forEach((c) =>
      flatItems.push({ type: "category", data: c }),
    );
    results.blogPosts.forEach((b) =>
      flatItems.push({ type: "blog", data: b }),
    );
  }

  const handleSelect = (item: { type: string; data: any }) => {
    if (item.type === "popular" || item.type === "recent") {
      setQuery(item.data);
      saveRecentSearch(item.data);
      fetchResults(item.data);
      return;
    }

    if (item.type === "product") {
      saveRecentSearch(query);
      onOpenChange(false);
      navigate("product", item.data.id);
    } else if (item.type === "category") {
      saveRecentSearch(query);
      onOpenChange(false);
      navigate("category", item.data.slug);
    } else if (item.type === "blog") {
      saveRecentSearch(query);
      onOpenChange(false);
      navigate("blog-post", item.data.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < flatItems.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : flatItems.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < flatItems.length) {
        handleSelect(flatItems[activeIndex]);
      } else if (query.trim()) {
        saveRecentSearch(query);
        onOpenChange(false);
        navigate("catalogue");
      }
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  const handleSearchSubmit = () => {
    if (query.trim()) {
      saveRecentSearch(query);
      onOpenChange(false);
      navigate("catalogue");
    }
  };

  const formatPrice = (price: number) =>
    libFormatPrice(price, settings?.currency || "USD");

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleRemoveRecent = (q: string) => {
    removeRecentSearch(q);
    setRecentSearches(getRecentSearches());
  };

  const productListCount = flatItems.filter(
    (i) => i.type === "product",
  ).length;
  const categoryListCount = flatItems.filter(
    (i) => i.type === "category",
  ).length;
  const blogListCount = flatItems.filter((i) => i.type === "blog").length;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Search Panel */}
          <div className="relative mx-auto mt-16 w-full max-w-2xl px-4">
            <div className="rounded-xl border bg-background shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("search_placeholder")}
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={open}
                  aria-controls="search-results"
                  aria-activedescendant={
                    activeIndex >= 0 ? `search-item-${activeIndex}` : undefined
                  }
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setResults({
                        products: [],
                        categories: [],
                        blogPosts: [],
                      });
                      setShowPopular(true);
                      setActiveIndex(-1);
                      inputRef.current?.focus();
                    }}
                    className="rounded-full p-1 hover:bg-muted transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs text-muted-foreground"
                >
                  ESC
                </Button>
              </div>

              {/* Results */}
              <div
                id="search-results"
                role="listbox"
                className="max-h-[60vh] overflow-y-auto"
              >
                {/* Loading */}
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      {t("loading")}
                    </span>
                  </div>
                )}

                {/* Popular & Recent Searches */}
                {!loading && showPopular && !query.trim() && (
                  <div className="p-4 space-y-4">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {t("recent_searches")}
                          </h3>
                          <button
                            onClick={handleClearRecent}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {t("clear_all")}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((search) => (
                            <div
                              key={search}
                              className="group flex items-center gap-1 rounded-full border bg-background px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                            >
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <button
                                onClick={() => {
                                  setQuery(search);
                                  saveRecentSearch(search);
                                  fetchResults(search);
                                }}
                                className="cursor-pointer"
                              >
                                {search}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveRecent(search);
                                }}
                                className="ml-0.5 rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/20 transition-all"
                                aria-label={`Remove ${search}`}
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Popular Searches */}
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {t("popular_searches")}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_SEARCHES.map((search) => (
                          <button
                            key={search}
                            onClick={() => {
                              setQuery(search);
                              saveRecentSearch(search);
                              fetchResults(search);
                            }}
                            className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                          >
                            <TrendingUp className="h-3 w-3 text-muted-foreground" />
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {!loading && !showPopular && hasResults && (
                  <div className="p-2" role="group">
                    {/* Products */}
                    {results.products.length > 0 && (
                      <div>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("products")} ({productListCount})
                        </div>
                        {results.products.map((product) => {
                          const idx = flatItems.findIndex(
                            (i) => i.type === "product" && i.data.id === product.id,
                          );
                          return (
                            <button
                              key={product.id}
                              id={`search-item-${idx}`}
                              role="option"
                              aria-selected={activeIndex === idx}
                              onClick={() =>
                                handleSelect({ type: "product", data: product })
                              }
                              className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors ${
                                activeIndex === idx
                                  ? "bg-muted"
                                  : "hover:bg-muted/50"
                              }`}
                            >
                              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                                <img
                                  src={getFirstImage(product.images) || undefined}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {product.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {product.Category?.name}
                                </div>
                              </div>
                              <div className="text-sm font-semibold shrink-0">
                                {formatPrice(product.price)}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Categories */}
                    {results.categories.length > 0 && (
                      <div>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("categories")} ({categoryListCount})
                        </div>
                        {results.categories.map((category) => {
                          const idx = flatItems.findIndex(
                            (i) => i.type === "category" && i.data.id === category.id,
                          );
                          return (
                            <button
                              key={category.id}
                              id={`search-item-${idx}`}
                              role="option"
                              aria-selected={activeIndex === idx}
                              onClick={() =>
                                handleSelect({
                                  type: "category",
                                  data: category,
                                })
                              }
                              className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition-colors ${
                                activeIndex === idx
                                  ? "bg-muted"
                                  : "hover:bg-muted/50"
                              }`}
                            >
                              <div>
                                <div className="text-sm font-medium">
                                  {category.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {category._count.Product}{" "}
                                  {t("products").toLowerCase()}
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Blog Posts */}
                    {results.blogPosts.length > 0 && (
                      <div>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("blog_posts")} ({blogListCount})
                        </div>
                        {results.blogPosts.map((post) => {
                          const idx = flatItems.findIndex(
                            (i) => i.type === "blog" && i.data.id === post.id,
                          );
                          return (
                            <button
                              key={post.id}
                              id={`search-item-${idx}`}
                              role="option"
                              aria-selected={activeIndex === idx}
                              onClick={() =>
                                handleSelect({ type: "blog", data: post })
                              }
                              className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors ${
                                activeIndex === idx
                                  ? "bg-muted"
                                  : "hover:bg-muted/50"
                              }`}
                            >
                              {post.coverImage ? (
                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                                  <img
                                    src={post.coverImage}
                                    alt={post.title}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ) : null}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {post.title}
                                </div>
                                {post.excerpt && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {post.excerpt}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* No results */}
                {!loading && !showPopular && !hasResults && query.trim().length >= 2 && (
                  <div className="py-12 text-center">
                    <Search className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t("no_results")}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      &quot;{query}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                      &uarr;&darr;
                    </kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                      Enter
                    </kbd>
                    select
                  </span>
                </div>
                {query.trim() && (
                  <button
                    onClick={handleSearchSubmit}
                    className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                  >
                    {t("search")} &quot;{query}&quot;
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
