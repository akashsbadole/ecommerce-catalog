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
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <StoreLayout currentPage={currentPage.type} onNavigate={handleNavigate}>
      {renderPage()}
    </StoreLayout>
  );
}
