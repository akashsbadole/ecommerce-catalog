"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Menu,
  X,
  ShoppingBag,
  FileText,
  Search,
  User,
  LogOut,
  Heart,
  ShoppingCart,
  Package,
  ChevronDown,
  Clock,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SimpleThemeToggle } from "@/components/SimpleThemeToggle";
import { useAppStore } from "@/lib/store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getFirstImage } from "@/lib/utils";
import { formatPrice as libFormatPrice } from "@/lib/pricing";

interface StoreHeaderProps {
  onNavigate: (page: string, data?: unknown) => void;
}

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string;
  Category: { id: string; name: string } | null;
}

interface NavItem {
  label: string;
  page: string;
  slug?: string;
  children?: NavItem[];
}

const mainNavLinks: NavItem[] = [
  { label: "Home", page: "home" },
  { label: "About Us", page: "about" },
  { label: "Manufacturing", page: "manufacturing" },
  // { label: "Products", page: "products" },
  { label: "Catalogue", page: "catalogue" },
  { label: "Contact Us", page: "contact" },
];

export function StoreHeader({ onNavigate }: StoreHeaderProps) {
  const { auth, logout, settings, cart, wishlist } = useAppStore();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem("search_history")
          : null;
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [dynamicNavLinks, setDynamicNavLinks] = useState<NavItem[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Merge dynamic content pages into main nav
  useEffect(() => {
    async function fetchNavLinks() {
      try {
        const res = await fetch("/api/content-pages");
        if (res.ok) {
          const data = await res.json();
          const pages = (data.pages || []).filter(
            (p: any) =>
              p.isActive &&
              ![
                "home",
                "catalogue",
                "about-us",
                "manufacturing",
                "contact",
              ].includes(p.slug),
          );
          if (pages.length > 0) {
            const links: NavItem[] = pages.map((p: any) => ({
              label: p.title,
              page: "content-page",
              slug: p.slug,
            }));
            setDynamicNavLinks(links);
          }
        }
      } catch {
        setDynamicNavLinks([]);
      }
    }
    fetchNavLinks();
  }, []);

  const allNavLinks = [...mainNavLinks, ...dynamicNavLinks];

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (searchOpen) {
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => window.clearTimeout(timer);
    }

    const resetTimer = window.setTimeout(() => {
      setSearchQuery("");
      setSearchResults([]);
    }, 0);
    return () => window.clearTimeout(resetTimer);
  }, [searchOpen]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(
        `/api/products?search=${encodeURIComponent(query)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.products || []);
      }
    } catch {
      // ignore search errors
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const saveSearchToHistory = (query: string) => {
    if (!query.trim()) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter(
        (q) => q.toLowerCase() !== query.toLowerCase(),
      );
      const next = [query, ...filtered].slice(0, 10);
      try {
        localStorage.setItem("search_history", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const removeSearchFromHistory = (query: string) => {
    setSearchHistory((prev) => {
      const next = prev.filter((q) => q !== query);
      try {
        localStorage.setItem("search_history", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem("search_history");
    } catch {
      /* ignore */
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(value);
    }, 300);
  };

  const handleResultClick = (productId: string) => {
    saveSearchToHistory(searchQuery);
    setSearchOpen(false);
    onNavigate("product", productId);
  };

  const formatPrice = (price: number) => {
    return libFormatPrice(price, settings?.currency || "USD");
  };

  return (
    <>
      {/* === TOP BAR === */}
      <div className="bg-muted/50 border-b text-xs">
        <div className="container mx-auto flex h-9 items-center justify-between px-4">
          {/* Left: contact info or welcome */}
          <div className="hidden md:flex items-center gap-4 text-muted-foreground">
            {auth.user ? (
              <span>
                Welcome,{" "}
                <span className="font-medium text-foreground">
                  {auth.user.name || auth.user.email}
                </span>
              </span>
            ) : (
              <span>Welcome to {settings?.site_name || "Our Store"}</span>
            )}
          </div>
          {/* Right: utility links */}
          <div className="flex items-center gap-1 ml-auto">
            {auth.user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1.5"
                  onClick={() => onNavigate("account")}
                >
                  <User className="h-3 w-3" />
                  <span className="hidden sm:inline">My Account</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1.5"
                  onClick={() => onNavigate("orders")}
                >
                  <Package className="h-3 w-3" />
                  <span className="hidden sm:inline">Orders</span>
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1.5"
                onClick={() => router.push("/admin")}
              >
                <User className="h-3 w-3" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            )}
            <Separator orientation="vertical" className="mx-0.5 h-4" />
            <Button
              variant="ghost"
              size="icon"
              className="relative h-7 w-7"
              onClick={() => onNavigate("wishlist")}
              aria-label="Wishlist"
            >
              <Heart className="h-3.5 w-3.5" />
              {wishlist.itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-[14px] rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center px-0.5">
                  {wishlist.itemCount > 99 ? "99+" : wishlist.itemCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-7 w-7"
              onClick={() => onNavigate("cart")}
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {cart.itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-[14px] rounded-full bg-primary text-[9px] font-bold text-white flex items-center justify-center px-0.5">
                  {cart.itemCount > 99 ? "99+" : cart.itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* === MAIN NAVIGATION BAR === */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          {/* Logo */}
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 transition-opacity hover:opacity-80 shrink-0"
          >
            {settings?.site_logo ? (
              <img
                src={settings.site_logo}
                alt={settings.site_name || "Logo"}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <ShoppingBag className="h-6 w-6 text-primary" />
            )}
            <span className="text-lg font-bold tracking-tight hidden sm:inline">
              {settings?.site_name || "My Store"}
            </span>
          </button>

          {/* Desktop Navigation - Center */}
          <nav
            className="hidden lg:flex items-center gap-0.5"
            role="navigation"
            aria-label="Main navigation"
          >
            {allNavLinks.map((link) => (
              <Button
                key={link.slug || link.page}
                variant="ghost"
                className="text-sm font-medium px-3"
                onClick={() => onNavigate(link.page, link.slug)}
              >
                {link.label}
              </Button>
            ))}
          </nav>

          {/* Right: Search + CTA */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle */}
            <SimpleThemeToggle className="h-9 w-9" />

            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
            >
              <Search className="h-4.5 w-4.5" />
            </Button>
            {/* Get Bulk Quote CTA */}
            <Button
              size="sm"
              className="hidden md:flex text-sm bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 px-4"
              onClick={() => onNavigate("catalogue")}
            >
              <FileText className="h-4 w-4" />
              Get Bulk Quote
            </Button>
            {/* Mobile Menu Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <SheetHeader className="border-b px-4 py-3">
                  <SheetTitle className="flex items-center gap-2 text-base">
                    {settings?.site_logo ? (
                      <img
                        src={settings.site_logo}
                        alt={settings.site_name || "Logo"}
                        className="h-6 w-auto object-contain"
                      />
                    ) : (
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    )}
                    {settings?.site_name || "My Store"}
                  </SheetTitle>
                </SheetHeader>
                <nav
                  className="flex flex-col gap-1 px-3 pt-3"
                  role="navigation"
                  aria-label="Mobile navigation"
                >
                  {/* Main Nav Links */}
                  {allNavLinks.map((link) => (
                    <SheetClose asChild key={link.slug || link.page}>
                      <Button
                        variant="ghost"
                        className="justify-start text-sm h-9"
                        onClick={() => onNavigate(link.page, link.slug)}
                      >
                        {link.label}
                      </Button>
                    </SheetClose>
                  ))}

                  <Separator className="my-2" />

                  {/* Account Links */}
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
                    Account
                  </p>
                  {auth.user ? (
                    <>
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          className="justify-start text-sm h-9"
                          onClick={() => onNavigate("account")}
                        >
                          <User className="mr-2 h-4 w-4" />
                          My Account
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          className="justify-start text-sm h-9"
                          onClick={() => onNavigate("orders")}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Orders
                        </Button>
                      </SheetClose>
                    </>
                  ) : (
                    <SheetClose asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-sm h-9"
                        onClick={() => router.push("/admin")}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Login / Partner Access
                      </Button>
                    </SheetClose>
                  )}

                  <Separator className="my-2" />

                  {/* Cart & Wishlist */}
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="justify-start text-sm h-9"
                      onClick={() => onNavigate("wishlist")}
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Wishlist{" "}
                      {wishlist.itemCount > 0 && `(${wishlist.itemCount})`}
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="justify-start text-sm h-9"
                      onClick={() => onNavigate("cart")}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Cart {cart.itemCount > 0 && `(${cart.itemCount})`}
                    </Button>
                  </SheetClose>

                  <Separator className="my-2" />

                  {/* Bulk Quote CTA */}
                  <SheetClose asChild>
                    <Button
                      className="justify-start text-sm h-9 bg-primary text-primary-foreground"
                      onClick={() => onNavigate("catalogue")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Get Bulk Quote
                    </Button>
                  </SheetClose>

                  {/* Search */}
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-sm h-9"
                      onClick={() => setSearchOpen(true)}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Search Products
                    </Button>
                  </SheetClose>

                  {/* Logout */}
                  {auth.user && (
                    <>
                      <Separator className="my-2" />
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          className="justify-start text-sm h-9 text-rose-500"
                          onClick={() => logout()}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </SheetClose>
                    </>
                  )}

                  <Separator className="my-2" />

                  <div className="px-2 py-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Appearance</span>
                    <SimpleThemeToggle className="h-9 w-9" />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-lg p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Search Products</DialogTitle>
          </DialogHeader>
          <div className="flex items-center border-b px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  saveSearchToHistory(searchQuery);
                  doSearch(searchQuery);
                }
              }}
              className="flex h-12 w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {searchLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery && searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No results found
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try adjusting your search terms
                </p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-2">
                {searchResults.map((product) => {
                  const image = getFirstImage(product.images);
                  return (
                    <button
                      key={product.id}
                      onClick={() => handleResultClick(product.id)}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-muted transition-colors"
                    >
                      {image ? (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                          <Image
                            src={image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {product.Category && (
                            <span>{product.Category.name}</span>
                          )}
                          <span>{formatPrice(product.price)}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col py-2">
                {searchHistory.length > 0 && (
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Recent Searches
                    </span>
                    <button
                      onClick={clearSearchHistory}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear
                    </button>
                  </div>
                )}
                {searchHistory.length > 0 ? (
                  <div className="px-2">
                    {searchHistory.map((query, idx) => (
                      <div key={idx} className="flex items-center gap-2 group">
                        <button
                          onClick={() => {
                            setSearchQuery(query);
                            doSearch(query);
                          }}
                          className="flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-muted transition-colors"
                        >
                          <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="text-sm">{query}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSearchFromHistory(query);
                          }}
                          className="shrink-0 p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Remove "${query}" from history`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Search className="h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Start typing to search products
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Press{" "}
                      <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">
                        Esc
                      </kbd>{" "}
                      to close
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
