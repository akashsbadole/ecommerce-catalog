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
  navigate: (page: string, data?: unknown) => void;

  // Auth
  isAdmin: boolean;
  adminUser: AdminUser | null;
  adminToken: string | null;
  auth: {
    user: (AdminUser & { tier?: string; isVerified?: boolean }) | null;
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

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentPage: { type: 'home' },
      navigate: (page: string, data?: unknown) => {
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
          case 'admin-login': set({ currentPage: { type: 'admin-login' } }); break;
          case 'admin':
            set({
              isAdmin: true,
              currentPage: { type: 'admin', activeTab: (data as string) || 'dashboard' }
            });
            break;
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
