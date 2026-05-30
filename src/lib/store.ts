import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Page =
  | { type: 'home' }
  | { type: 'catalogue' }
  | { type: 'product'; productId: string }
  | { type: 'contact' }
  | { type: 'content-page'; slug: string }
  | { type: 'blog' }
  | { type: 'blog-post'; postId: string }
  | { type: 'portal' }
  | { type: 'admin-login' }
  | { type: 'admin'; activeTab: string };

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AppState {
  // Navigation
  currentPage: Page;
  navigate: (page: string, data?: unknown, replace?: boolean) => void;

  // Auth
  isAdmin: boolean;
  adminUser: AdminUser | null;
  adminToken: string | null;
  auth: {
    user: (AdminUser & {
      tier?: string;
      isVerified?: boolean;
      companyName?: string | null;
      taxId?: string | null;
      businessPhone?: string | null;
      businessAddress?: string | null;
    }) | null;
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
}

function pageToUrl(page: string, data?: unknown): string {
  switch (page) {
    case 'home': return '/';
    case 'catalogue': return '/catalogue';
    case 'product': return `/product/${data}`;
    case 'contact': return '/contact';
    case 'content-page': return `/page/${data}`;
    case 'blog': return '/blog';
    case 'blog-post': return `/blog/${data}`;
    case 'portal': return '/portal';
    case 'admin-login': return '/admin';
    case 'admin': return `/admin/${data || 'dashboard'}`;
    default: return '/';
  }
}

export function urlToPage(pathname: string): { page: string; data?: unknown } {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return { page: 'home' };
  if (parts[0] === 'admin') return { page: parts[1] ? 'admin' : 'admin-login', data: parts[1] || undefined };
  if (parts[0] === 'product' && parts[1]) return { page: 'product', data: parts[1] };
  if (parts[0] === 'page' && parts[1]) return { page: 'content-page', data: parts[1] };
  if (parts[0] === 'blog-post' && parts[1]) return { page: 'blog-post', data: parts[1] };
  if (parts[0] === 'catalogue') return { page: 'catalogue' };
  if (parts[0] === 'contact') return { page: 'contact' };
  if (parts[0] === 'blog') return { page: parts[1] ? 'blog-post' : 'blog', data: parts[1] || undefined };
  if (parts[0] === 'portal') return { page: 'portal' };
  return { page: 'home' };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentPage: { type: 'home' },
      navigate: (page: string, data?: unknown, replace?: boolean) => {
        if (typeof window !== 'undefined') {
          window.scrollTo(0, 0);
        }
        switch (page) {
          case 'home': set({ currentPage: { type: 'home' } }); break;
          case 'catalogue': set({ currentPage: { type: 'catalogue' } }); break;
          case 'product': set({ currentPage: { type: 'product', productId: data as string } }); break;
          case 'contact': set({ currentPage: { type: 'contact' } }); break;
          case 'content-page': set({ currentPage: { type: 'content-page', slug: data as string } }); break;
          case 'blog': set({ currentPage: { type: 'blog' } }); break;
          case 'blog-post': set({ currentPage: { type: 'blog-post', postId: data as string } }); break;
          case 'portal': set({ currentPage: { type: 'portal' } }); break;
          case 'admin-login': set({ currentPage: { type: 'admin-login' } }); break;
          case 'admin':
            set({
              isAdmin: true,
              currentPage: { type: 'admin', activeTab: (data as string) || 'dashboard' }
            });
            break;
        }
        if (typeof window !== 'undefined') {
          const url = pageToUrl(page, data);
          if (replace) {
            window.history.replaceState({ page, data }, '', url);
          } else {
            window.history.pushState({ page, data }, '', url);
          }
        }
      },

      isAdmin: false,
      adminUser: null,
      adminToken: null,
      auth: { user: null, token: null },
      setAdminLogin: (user, token) => set({
        isAdmin: true,
        adminUser: user,
        adminToken: token,
        auth: { user, token },
      }),
      setAdminLogout: () => set({
        isAdmin: false,
        adminUser: null,
        adminToken: null,
        auth: { user: null, token: null },
        currentPage: { type: 'home' },
      }),
      login: (user, token) => set({
        auth: { user, token },
        isAdmin: user.role === 'admin' || user.role === 'clerk',
        adminUser: (user.role === 'admin' || user.role === 'clerk') ? user : null,
        adminToken: (user.role === 'admin' || user.role === 'clerk') ? token : null,
      }),
      logout: () => set({
        auth: { user: null, token: null },
        isAdmin: false,
        adminUser: null,
        adminToken: null,
        currentPage: { type: 'home' },
      }),

      settings: null,
      setSettings: (settings) => set({ settings }),
      fetchSettings: async () => {
        try {
          const res = await fetch('/api/settings');
          if (res.ok) {
            const data = await res.json();
            set({ settings: data.settings || {} });
          }
        } catch (error) {
          console.error('Failed to fetch settings:', error);
        }
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        isAdmin: state.isAdmin,
        adminUser: state.adminUser,
        adminToken: state.adminToken,
        auth: state.auth,
      }),
    }
  )
);
