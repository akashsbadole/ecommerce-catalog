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
  LayoutDashboard,
  Heart,
  ShoppingCart,
  Package,
  ChevronDown,
  Clock,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
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

function MobileNavItem({ link, onNavigate }: { link: NavItem; onNavigate: (page: string, data?: unknown) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <Button
        variant="ghost"
        className="justify-start text-base"
        onClick={() => setOpen(!open)}
      >
        {link.label}
        <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>
      {open && (
        <div className="ml-4 flex flex-col gap-1">
          {link.children?.map((child) => (
            <SheetClose asChild key={child.slug}>
              <Button
                variant="ghost"
                className="justify-start text-sm"
                onClick={() => onNavigate(child.page, child.slug)}
              >
                {child.label}
              </Button>
            </SheetClose>
          ))}
        </div>
      )}
    </div>
  );
}

const navLinks = [
  { label: "Home", page: "home" },
  { label: "Manufacturing", page: "content-page", slug: "manufacturing" },
  { label: "Products", page: "content-page", slug: "products" },
  { label: "Catalogue", page: "catalogue" },
  {
    label: "About Us",
    page: "content-page",
    slug: "about-us",
    children: [
      { label: "About Us", page: "content-page", slug: "about-us" },
      { label: "Contact Us", page: "content-page", slug: "contact" },
    ],
  },
];

export function StoreHeader({ onNavigate }: StoreHeaderProps) {
  const { auth, logout, settings, cart, wishlist } = useAppStore();
  const isEcommerce = settings?.catalog_mode !== 'catalog';
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('search_history');
      if (stored) setSearchHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

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
      const filtered = prev.filter((q) => q.toLowerCase() !== query.toLowerCase());
      const next = [query, ...filtered].slice(0, 10);
      try { localStorage.setItem('search_history', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const removeSearchFromHistory = (query: string) => {
    setSearchHistory((prev) => {
      const next = prev.filter((q) => q !== query);
      try { localStorage.setItem('search_history', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    try { localStorage.removeItem('search_history'); } catch { /* ignore */ }
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: settings?.currency || "USD",
    }).format(price);
  };

  const getFirstImage = (images: string): string | null => {
    try {
      const arr = JSON.parse(images);
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    } catch {
      return null;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            {settings?.site_logo ? (
              <img
                src={settings.site_logo}
                alt={settings.site_name || 'Logo'}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <ShoppingBag className="h-6 w-6 text-primary" />
            )}
            <span className="text-xl font-bold tracking-tight">
              {settings?.site_name || 'Style'}<span className="text-primary">{settings?.site_name ? '' : 'Store'}</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-1"
            role="navigation"
            aria-label="Main navigation"
          >
            {navLinks.map((link) =>
              link.children ? (
                <DropdownMenu key={link.slug || link.page}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-sm font-medium">
                      {link.label}
                      <ChevronDown className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {link.children.map((child) => (
                      <DropdownMenuItem
                        key={child.slug}
                        onClick={() => onNavigate(child.page, child.slug)}
                        className="cursor-pointer"
                      >
                        {child.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  key={link.slug || link.page}
                  variant="ghost"
                  className="text-sm font-medium"
                  onClick={() => onNavigate(link.page, link.slug)}
                >
                  {link.label}
                </Button>
              ),
            )}
            <Separator orientation="vertical" className="mx-2 h-6" />
            {/* Search Button */}
            <Button
              variant="outline"
              size="sm"
              className="text-sm text-muted-foreground"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="mr-1.5 h-3.5 w-3.5" />
              Search
              <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => onNavigate("wishlist")}
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlist.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                  {wishlist.itemCount > 99 ? "99+" : wishlist.itemCount}
                </span>
              )}
            </Button>
            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => onNavigate("cart")}
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                  {cart.itemCount > 99 ? "99+" : cart.itemCount}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-sm border-primary/20 text-primary/80 hover:bg-primary/5 hover:text-primary-dark dark:border-primary-dark dark:text-primary/40 dark:hover:bg-primary-dark dark:hover:text-primary/30"
              onClick={() => onNavigate("catalogue")}
            >
              <FileText className="mr-1.5 h-4 w-4" />
              Request Quote
            </Button>
            {isEcommerce && (
              <Button
                variant="ghost"
                size="sm"
                className="text-sm"
                onClick={() => onNavigate("quick-order")}
              >
                <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                Quick Order
              </Button>
            )}
            {auth.user ? (
              <div className="flex items-center gap-2">
                {settings?.b2b_enable_buyer_portal === "true" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm flex items-center gap-1.5"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Portal
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onNavigate("account")}
                        className="cursor-pointer"
                      >
                        <User className="mr-2 h-4 w-4" />
                        My Account
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onNavigate("orders")}
                        className="cursor-pointer"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Orders
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                  onClick={() => logout()}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-sm"
                onClick={() => router.push("/admin")}
              >
                Login
              </Button>
            )}
            <ThemeToggle />
          </nav>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {settings?.site_logo ? (
                    <img
                      src={settings.site_logo}
                      alt={settings.site_name || 'Logo'}
                      className="h-6 w-auto object-contain"
                    />
                  ) : (
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  )}
                  {settings?.site_name || 'StyleStore'}
                </SheetTitle>
              </SheetHeader>
              <nav
                className="flex flex-col gap-2 px-4 pt-4"
                role="navigation"
                aria-label="Mobile navigation"
              >
                {navLinks.map((link) =>
                  link.children ? (
                    <MobileNavItem
                      key={link.slug || link.page}
                      link={link}
                      onNavigate={onNavigate}
                    />
                  ) : (
                    <SheetClose asChild key={link.slug || link.page}>
                      <Button
                        variant="ghost"
                        className="justify-start text-base"
                        onClick={() => onNavigate(link.page, link.slug)}
                      >
                        {link.label}
                      </Button>
                    </SheetClose>
                  ),
                )}
                <Separator className="my-2" />
                {/* Mobile Cart & Wishlist */}
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="justify-start text-base"
                    onClick={() => onNavigate("cart")}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Cart {cart.itemCount > 0 && `(${cart.itemCount})`}
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="justify-start text-base"
                    onClick={() => onNavigate("wishlist")}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist{" "}
                    {wishlist.itemCount > 0 && `(${wishlist.itemCount})`}
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-base"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search Products
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-base border-primary/20 text-primary/80 hover:bg-primary/5 hover:text-primary-dark dark:border-primary-dark dark:text-primary/40 dark:hover:bg-primary-dark dark:hover:text-primary/30"
                    onClick={() => onNavigate("catalogue")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Request Quote
                  </Button>
                </SheetClose>
                {isEcommerce && (
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="justify-start text-base"
                      onClick={() => onNavigate("quick-order")}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Quick Order
                    </Button>
                  </SheetClose>
                )}
                {auth.user ? (
                  <>
                    {settings?.b2b_enable_buyer_portal === "true" && (
                      <>
                        <SheetClose asChild>
                          <Button
                            variant="ghost"
                            className="justify-start text-base"
                            onClick={() => onNavigate("account")}
                          >
                            <User className="mr-2 h-4 w-4" />
                            My Account
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button
                            variant="ghost"
                            className="justify-start text-base"
                            onClick={() => onNavigate("orders")}
                          >
                            <Package className="mr-2 h-4 w-4" />
                            Orders
                          </Button>
                        </SheetClose>
                      </>
                    )}
                    <SheetClose asChild>
                      <Button
                        variant="ghost"
                        className="justify-start text-base text-rose-500"
                        onClick={() => logout()}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </SheetClose>
                  </>
                ) : (
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-base"
                      onClick={() => router.push("/admin")}
                    >
                      Login / Partner Access
                    </Button>
                  </SheetClose>
                )}
              </nav>
            </SheetContent>
          </Sheet>
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
                if (e.key === 'Enter' && searchQuery.trim()) {
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
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Searches</span>
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
