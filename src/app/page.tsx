'use client';

import { useState, useEffect } from 'react';
import { StoreLayout } from '@/components/store/StoreLayout';
import { HomePage } from '@/components/store/HomePage';
import { CataloguePage } from '@/components/store/CataloguePage';
import { ProductDetailPage } from '@/components/store/ProductDetailPage';
import { ContactPage } from '@/components/store/ContactPage';
import { ContentPageView } from '@/components/store/ContentPageView';
import { BlogPage } from '@/components/store/BlogPage';
import { BlogPostView } from '@/components/store/BlogPostView';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

type Page =
  | { type: 'home' }
  | { type: 'catalogue' }
  | { type: 'product'; productId: string }
  | { type: 'contact' }
  | { type: 'content-page'; slug: string }
  | { type: 'blog' }
  | { type: 'blog-post'; postId: string }
  | { type: 'admin-login' }
  | { type: 'admin'; activeTab: string };

export default function MainApp() {
  const [currentPage, setCurrentPage] = useState<Page>({ type: 'home' });
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!(localStorage.getItem('admin_user') && localStorage.getItem('admin_token'));
    }
    return false;
  });
  const [adminUser, setAdminUser] = useState<{ id: string; email: string; name: string; role: string } | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('admin_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  // Cleanup invalid tokens
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('admin_user');
      const savedToken = localStorage.getItem('admin_token');
      if (!savedUser || !savedToken) {
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_token');
      }
    }
  }, []);

  const handleNavigate = (page: string, data?: unknown) => {
    window.scrollTo(0, 0);
    switch (page) {
      case 'home': setCurrentPage({ type: 'home' }); break;
      case 'catalogue': setCurrentPage({ type: 'catalogue' }); break;
      case 'product': setCurrentPage({ type: 'product', productId: data as string }); break;
      case 'contact': setCurrentPage({ type: 'contact' }); break;
      case 'content-page': setCurrentPage({ type: 'content-page', slug: data as string }); break;
      case 'blog': setCurrentPage({ type: 'blog' }); break;
      case 'blog-post': setCurrentPage({ type: 'blog-post', postId: data as string }); break;
      case 'admin-login': setCurrentPage({ type: 'admin-login' }); break;
      case 'admin':
        setIsAdmin(true);
        setCurrentPage({ type: 'admin', activeTab: (data as string) || 'dashboard' });
        break;
    }
  };

  const handleAdminLogin = (user: { id: string; email: string; name: string; role: string }, token?: string) => {
    setAdminUser(user);
    setIsAdmin(true);
    localStorage.setItem('admin_user', JSON.stringify(user));
    localStorage.setItem('admin_token', token || 'token-' + user.id);
    handleNavigate('admin', 'dashboard');
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setIsAdmin(false);
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    handleNavigate('home');
  };

  // Admin pages (no store layout)
  if (currentPage.type === 'admin-login') {
    return <AdminLogin onLogin={handleAdminLogin} onNavigate={handleNavigate} />;
  }

  if (currentPage.type === 'admin' && isAdmin) {
    return (
      <AdminDashboard
        user={adminUser}
        activeTab={currentPage.activeTab}
        onNavigate={handleNavigate}
        onLogout={handleAdminLogout}
      />
    );
  }

  // Public pages (wrapped in store layout)
  const renderPage = () => {
    switch (currentPage.type) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'catalogue':
        return <CataloguePage onNavigate={handleNavigate} />;
      case 'product':
        return <ProductDetailPage productId={currentPage.productId} onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage />;
      case 'content-page':
        return <ContentPageView slug={currentPage.slug} onNavigate={handleNavigate} />;
      case 'blog':
        return <BlogPage onNavigate={handleNavigate} />;
      case 'blog-post':
        return <BlogPostView postId={currentPage.postId} onNavigate={handleNavigate} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative">
              <span className="text-[8rem] font-black leading-none tracking-tighter text-emerald-100 dark:text-emerald-900/30 select-none sm:text-[10rem]">
                404
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Page not found</h1>
            <p className="mt-2 text-muted-foreground max-w-md">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleNavigate('home')}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
              >
                Back to Home
              </button>
              <button
                onClick={() => handleNavigate('catalogue')}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Browse Catalogue
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <StoreLayout currentPage={currentPage.type} onNavigate={handleNavigate}>
      {renderPage()}
    </StoreLayout>
  );
}
