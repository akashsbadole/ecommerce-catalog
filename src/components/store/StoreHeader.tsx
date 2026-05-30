"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

const navLinks = [
  { label: "Home", page: "home" },
  { label: "Catalogue", page: "catalogue" },
  { label: "Contact", page: "contact" },
];

export function StoreHeader({ onNavigate }: StoreHeaderProps) {
  const { auth, logout, settings } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [searchOpen]);

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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(value);
    }, 300);
  };

  const handleResultClick = (productId: string) => {
    setSearchOpen(false);
    onNavigate("product", productId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
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
            <ShoppingBag className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold tracking-tight">
              Style<span className="text-emerald-600">Store</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-1"
            role="navigation"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Button
                key={link.page}
                variant="ghost"
                className="text-sm font-medium"
                onClick={() => onNavigate(link.page)}
              >
                {link.label}
              </Button>
            ))}
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
            <Button
              variant="outline"
              size="sm"
              className="text-sm border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
              onClick={() => onNavigate("catalogue")}
            >
              <FileText className="mr-1.5 h-4 w-4" />
              Request Quote
            </Button>
            {auth.user ? (
              <div className="flex items-center gap-2">
                {settings?.b2b_enable_buyer_portal === "true" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm flex items-center gap-1.5"
                    onClick={() => onNavigate("portal")}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Portal
                  </Button>
                )}
                {(auth.user.role === "admin" || auth.user.role === "clerk") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm flex items-center gap-1.5"
                    onClick={() => onNavigate("admin")}
                  >
                    Admin
                  </Button>
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
                onClick={() => onNavigate("admin-login")}
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
                  <ShoppingBag className="h-5 w-5 text-emerald-600" />
                  StyleStore
                </SheetTitle>
              </SheetHeader>
              <nav
                className="flex flex-col gap-2 px-4 pt-4"
                role="navigation"
                aria-label="Mobile navigation"
              >
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.page}>
                    <Button
                      variant="ghost"
                      className="justify-start text-base"
                      onClick={() => onNavigate(link.page)}
                    >
                      {link.label}
                    </Button>
                  </SheetClose>
                ))}
                <Separator className="my-2" />
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
                    className="justify-start text-base border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
                    onClick={() => onNavigate("catalogue")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Request Quote
                  </Button>
                </SheetClose>
                {auth.user ? (
                  <>
                    {settings?.b2b_enable_buyer_portal === "true" && (
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          className="justify-start text-base"
                          onClick={() => onNavigate("portal")}
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Buyer Portal
                        </Button>
                      </SheetClose>
                    )}
                    {(auth.user.role === "admin" ||
                      auth.user.role === "clerk") && (
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          className="justify-start text-base"
                          onClick={() => onNavigate("admin")}
                        >
                          Admin Panel
                        </Button>
                      </SheetClose>
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
                      onClick={() => onNavigate("admin-login")}
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
                            unoptimized
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
        </DialogContent>
      </Dialog>
    </>
  );
}
