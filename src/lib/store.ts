import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Page =
  | { type: "home" }
  | { type: "catalogue" }
  | { type: "category"; slug: string }
  | { type: "product"; productId: string }
  | { type: "products" }
  | { type: "contact" }
  | { type: "about" }
  | { type: "manufacturing" }
  | { type: "blog" }
  | { type: "blog-post"; slug: string }
  | { type: "content-page"; slug: string }
  | { type: "admin-login" }
  | { type: "admin"; activeTab: string };

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
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

  // Global Enquiry Modal
  enquiryModal: { open: boolean; productName?: string; productId?: string };
  openEnquiryModal: (productName?: string, productId?: string) => void;
  closeEnquiryModal: () => void;
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
              window.history.pushState({}, "", `/product/${data as string}`);
            break;
          case "products":
            set({ currentPage: { type: "products" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/product");
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
          case "blog":
            set({ currentPage: { type: "blog" } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", "/blog");
            break;
          case "blog-post":
            set({ currentPage: { type: "blog-post", slug: data as string } });
            if (typeof window !== "undefined")
              window.history.pushState({}, "", `/blog/${data as string}`);
            break;
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
        });
      },

      settings: null,
      setSettings: (settings) => set({ settings }),
      fetchSettings: async () => {
        try {
          const res = await fetch("/api/settings/public", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            set({ settings: data.settings || {} });
          }
        } catch (error) {
          console.error("Failed to fetch settings:", error);
        }
      },

      enquiryModal: { open: false },
      openEnquiryModal: (productName, productId) => set({ enquiryModal: { open: true, productName, productId } }),
      closeEnquiryModal: () => set({ enquiryModal: { open: false } }),
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
