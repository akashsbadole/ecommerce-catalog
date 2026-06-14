import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Page =
  | { type: "home" }
  | { type: "catalogue" }
  | { type: "category"; slug: string }
  | { type: "product"; productId: string }
  | { type: "contact" }
  | { type: "about" }
  | { type: "manufacturing" }
  // | { type: "products" }
  | { type: "content-page"; slug: string }
  | { type: "blog" }
  | { type: "blog-post"; postId: string }
  | { type: "portal" }
  | { type: "admin-login" }
  | { type: "admin"; activeTab: string }
  | { type: "cart" }
  | { type: "wishlist" }
  | { type: "orders" }
  | { type: "order-detail"; orderId: string }
  | { type: "account" }
  | { type: "checkout" }
  | { type: "compare" }
  | { type: "quick-order" };

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  Product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice: number | null;
    images: string;
    stock: number;
    isActive: boolean;
    minOrderQty: number;
  };
}

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  Product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice: number | null;
    wholesalePrice: number | null;
    images: string;
    stock: number;
    isActive: boolean;
    isFeatured: boolean;
    shortDescription: string | null;
    Category: { id: string; name: string; slug: string } | null;
  };
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
}

interface WishlistState {
  items: WishlistItem[];
  itemCount: number;
  loading: boolean;
}

export interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: string;
  stock: number;
  sku: string | null;
  description: string | null;
  shortDescription: string | null;
  minOrderQty: number;
  Category: { id: string; name: string } | null;
}

interface CompareState {
  products: CompareProduct[];
  compareOpen: boolean;
}

interface AppState {
  // Navigation
  currentPage: Page;
  navigate: (page: string, data?: unknown) => void;

  // Auth
  isAdmin: boolean;
  adminUser: AdminUser | null;
  adminToken: string | null;
  auth: {
    user:
      | (AdminUser & {
          tier?: string;
          isVerified?: boolean;
          companyName?: string | null;
          taxId?: string | null;
          businessPhone?: string | null;
          businessAddress?: string | null;
          phone?: string | null;
        })
      | null;
    token: string | null;
  };
  setAdminLogin: (user: AdminUser, token: string) => void;
  setAdminLogout: () => void;
  login: (user: any, token: string) => void;
  logout: () => void;

  // Global Settings
  settings: Record<string, string> | null;
  setSettings: (settings: Record<string, string>) => void;
  fetchSettings: () => Promise<void>;

  // Cart
  cart: CartState;
  fetchCart: () => Promise<void>;
  addToCart: (
    productId: string,
    quantity?: number,
    variantId?: string,
  ) => Promise<boolean>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;

  // Wishlist
  wishlist: WishlistState;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;

  // Compare
  compare: CompareState;
  addToCompare: (product: CompareProduct) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  setCompareOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentPage: { type: "home" },
      navigate: (page: string, data?: unknown) => {
        if (typeof window !== "undefined") {
          window.scrollTo(0, 0);
        }
        switch (page) {
          case "home":
            set({ currentPage: { type: "home" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/");
            break;
          case "catalogue":
            set({ currentPage: { type: "catalogue" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/catalogue");
            break;
          case "category":
            set({ currentPage: { type: "category", slug: data as string } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", `/catalogue/${data as string}`);
            break;
          case "product":
            {
              const productId = data as string;
              fetch(`/api/products/${productId}`)
                .then((r) => r.ok ? r.json() : null)
                .then((product) => {
                  const catSlug = product?.category?.slug || product?.Category?.slug;
                  if (catSlug) {
                    get().navigate("category", catSlug);
                  } else {
                    get().navigate("catalogue");
                  }
                })
                .catch(() => get().navigate("catalogue"));
            }
            break;
          case "contact":
            set({ currentPage: { type: "contact" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/contact");
            break;
          case "about":
            set({ currentPage: { type: "about" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/about");
            break;
          case "manufacturing":
            set({ currentPage: { type: "manufacturing" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/manufacturing");
            break;
          // case "products":
          //   set({ currentPage: { type: "products" } });
          //   if (typeof window !== "undefined")
          //     window.history.pushState({}, "", "/products");
          //   break;
          case "content-page": {
            const rawSlug = (data as string) || "";
            const slug = rawSlug.replace(/^\/+/, "");
            if (!slug) break;
            set({
              currentPage: { type: "content-page", slug },
            });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", `/${slug}`);
            break;
          }
          case "blog":
            set({ currentPage: { type: "blog" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/blog");
            break;
          case "blog-post":
            set({ currentPage: { type: "blog-post", postId: data as string } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", `/blog/${data as string}`);
            break;
          case "portal":
            set({ currentPage: { type: "portal" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/portal");
            break;
          case "admin-login":
            set({ currentPage: { type: "admin-login" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/admin");
            break;
          case "admin":
            set({
              isAdmin: true,
              currentPage: {
                type: "admin",
                activeTab: (data as string) || "dashboard",
              },
            });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/admin");
            break;
          case "cart":
            set({ currentPage: { type: "cart" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/cart");
            break;
          case "wishlist":
            set({ currentPage: { type: "wishlist" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/wishlist");
            break;
          case "orders":
            set({ currentPage: { type: "orders" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/orders");
            break;
          case "order-detail":
            set({
              currentPage: { type: "order-detail", orderId: data as string },
            });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", `/orders/${data as string}`);
            break;
          case "account":
            set({ currentPage: { type: "account" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/account");
            break;
          case "checkout":
            set({ currentPage: { type: "checkout" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/checkout");
            break;
          case "compare":
            set({ currentPage: { type: "compare" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/compare");
            break;
          case "quick-order":
            set({ currentPage: { type: "quick-order" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/quick-order");
            break;
        }
      },

      isAdmin: false,
      adminUser: null,
      adminToken: null,
      auth: { user: null, token: null },
      setAdminLogin: (user, token) =>
        set({
          isAdmin: true,
          adminUser: user,
          adminToken: token,
          auth: { user, token },
        }),
      setAdminLogout: () =>
        set({
          isAdmin: false,
          adminUser: null,
          adminToken: null,
          auth: { user: null, token: null },
          currentPage: { type: "home" },
        }),
      login: (user, token) =>
        set({
          auth: { user, token },
          isAdmin:
            user.role === "admin" ||
            user.role === "clerk" ||
            user.role === "editor",
          adminUser:
            user.role === "admin" ||
            user.role === "clerk" ||
            user.role === "editor"
              ? user
              : null,
          adminToken:
            user.role === "admin" ||
            user.role === "clerk" ||
            user.role === "editor"
              ? token
              : null,
        }),
      logout: () => {
        set({
          auth: { user: null, token: null },
          isAdmin: false,
          adminUser: null,
          adminToken: null,
          currentPage: { type: "home" },
          cart: { items: [], total: 0, itemCount: 0, loading: false },
          wishlist: { items: [], itemCount: 0, loading: false },
        });
      },

      settings: null,
      setSettings: (settings) => set({ settings }),
      fetchSettings: async () => {
        try {
          const res = await fetch("/api/settings/public");
          if (res.ok) {
            const data = await res.json();
            set({ settings: data.settings || {} });
          }
        } catch (error) {
          console.error("Failed to fetch settings:", error);
        }
      },

      // Cart
      cart: { items: [], total: 0, itemCount: 0, loading: false },
      fetchCart: async () => {
        const { auth } = get();
        if (!auth.token) {
          set({ cart: { items: [], total: 0, itemCount: 0, loading: false } });
          return;
        }
        set((state) => ({ cart: { ...state.cart, loading: true } }));
        try {
          const res = await fetch("/api/cart", {
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          if (res.ok) {
            const data = await res.json();
            set({
              cart: {
                items: data.items || [],
                total: data.total || 0,
                itemCount: data.itemCount || 0,
                loading: false,
              },
            });
          }
        } catch (error) {
          console.error("Failed to fetch cart:", error);
          set((state) => ({ cart: { ...state.cart, loading: false } }));
        }
      },
      addToCart: async (productId, quantity = 1, variantId) => {
        const { auth } = get();
        if (!auth.token) {
          // Guest cart: store locally
          try {
            const localCartKey = "guest_cart";
            const stored = localStorage.getItem(localCartKey);
            const guestCart = stored
              ? JSON.parse(stored)
              : { items: [], total: 0, itemCount: 0 };

            // Fetch product details
            const res = await fetch(`/api/products/${productId}`);
            if (!res.ok) return false;
            const data = await res.json();
            const product = data.product;

            const existingIdx = guestCart.items.findIndex(
              (i: any) =>
                i.productId === productId &&
                i.variantId === (variantId || null),
            );

            if (existingIdx >= 0) {
              guestCart.items[existingIdx].quantity += quantity;
            } else {
              guestCart.items.push({
                id: `guest_${productId}_${Date.now()}`,
                productId,
                variantId: variantId || null,
                quantity,
                Product: {
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  comparePrice: product.comparePrice,
                  images: product.images,
                  stock: product.stock,
                  isActive: product.isActive,
                  minOrderQty: product.minOrderQty || 1,
                },
              });
            }

            guestCart.total = guestCart.items.reduce(
              (sum: number, i: any) => sum + i.Product.price * i.quantity,
              0,
            );
            guestCart.itemCount = guestCart.items.reduce(
              (sum: number, i: any) => sum + i.quantity,
              0,
            );

            localStorage.setItem(localCartKey, JSON.stringify(guestCart));

            set({
              cart: {
                items: guestCart.items,
                total: guestCart.total,
                itemCount: guestCart.itemCount,
                loading: false,
              },
            });
            return true;
          } catch (error) {
            console.error("Failed to add to guest cart:", error);
            return false;
          }
        }
        try {
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
            body: JSON.stringify({ productId, quantity, variantId }),
          });
          if (res.ok) {
            const data = await res.json();
            set({
              cart: {
                items: data.items || [],
                total: data.total || 0,
                itemCount: data.itemCount || 0,
                loading: false,
              },
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error("Failed to add to cart:", error);
          return false;
        }
      },
      updateCartItem: async (itemId, quantity) => {
        const { auth } = get();
        if (!auth.token) return;
        try {
          const res = await fetch("/api/cart", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
            body: JSON.stringify({ itemId, quantity }),
          });
          if (res.ok) {
            const data = await res.json();
            set({
              cart: {
                items: data.items || [],
                total: data.total || 0,
                itemCount: data.itemCount || 0,
                loading: false,
              },
            });
          }
        } catch (error) {
          console.error("Failed to update cart item:", error);
        }
      },
      removeFromCart: async (itemId) => {
        const { auth } = get();
        if (!auth.token) return;
        try {
          const res = await fetch(`/api/cart?itemId=${itemId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          if (res.ok) {
            const data = await res.json();
            // Re-fetch cart to get updated state
            get().fetchCart();
          }
        } catch (error) {
          console.error("Failed to remove from cart:", error);
        }
      },
      clearCart: async () => {
        const { auth } = get();
        if (!auth.token) return;
        try {
          await fetch("/api/cart", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          set({ cart: { items: [], total: 0, itemCount: 0, loading: false } });
        } catch (error) {
          console.error("Failed to clear cart:", error);
        }
      },

      // Wishlist
      wishlist: { items: [], itemCount: 0, loading: false },
      fetchWishlist: async () => {
        const { auth } = get();
        if (!auth.token) {
          set({ wishlist: { items: [], itemCount: 0, loading: false } });
          return;
        }
        set((state) => ({ wishlist: { ...state.wishlist, loading: true } }));
        try {
          const res = await fetch("/api/wishlist", {
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          if (res.ok) {
            const data = await res.json();
            set({
              wishlist: {
                items: data.items || [],
                itemCount: data.itemCount || 0,
                loading: false,
              },
            });
          }
        } catch (error) {
          console.error("Failed to fetch wishlist:", error);
          set((state) => ({ wishlist: { ...state.wishlist, loading: false } }));
        }
      },
      addToWishlist: async (productId) => {
        const { auth } = get();
        if (!auth.token) return false;
        try {
          const res = await fetch("/api/wishlist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
            body: JSON.stringify({ productId }),
          });
          if (res.ok) {
            get().fetchWishlist();
            return true;
          }
          return false;
        } catch (error) {
          console.error("Failed to add to wishlist:", error);
          return false;
        }
      },
      removeFromWishlist: async (productId) => {
        const { auth } = get();
        if (!auth.token) return;
        try {
          await fetch(`/api/wishlist?productId=${productId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${auth.token}` },
          });
          get().fetchWishlist();
        } catch (error) {
          console.error("Failed to remove from wishlist:", error);
        }
      },
      isInWishlist: (productId) => {
        const { wishlist } = get();
        return wishlist.items.some((item) => item.productId === productId);
      },

      // Compare
      compare: { products: [], compareOpen: false },
      addToCompare: (product) => {
        const { compare } = get();
        if (compare.products.length >= 4) return;
        if (compare.products.some((p) => p.id === product.id)) return;
        set({
          compare: {
            ...compare,
            products: [...compare.products, product],
            compareOpen: true,
          },
        });
      },
      removeFromCompare: (productId) => {
        const { compare } = get();
        set({
          compare: {
            ...compare,
            products: compare.products.filter((p) => p.id !== productId),
          },
        });
      },
      clearCompare: () => {
        set({ compare: { products: [], compareOpen: false } });
      },
      isInCompare: (productId) => {
        const { compare } = get();
        return compare.products.some((p) => p.id === productId);
      },
      setCompareOpen: (open) => {
        const { compare } = get();
        set({ compare: { ...compare, compareOpen: open } });
      },
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        isAdmin: state.isAdmin,
        adminUser: state.adminUser,
        adminToken: state.adminToken,
        auth: state.auth,
      }),
    },
  ),
);
