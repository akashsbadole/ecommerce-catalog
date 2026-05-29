'use client';

import { useAppStore } from '@/lib/store';
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
import BuyerPortalPage from '@/app/portal/page';

export default function MainApp() {
  const {
    currentPage,
    navigate,
    isAdmin,
    adminUser,
    setAdminLogin,
    setAdminLogout
  } = useAppStore();

  const handleAdminLogin = (user: { id: string; email: string; name: string; role: string }, token?: string) => {
    setAdminLogin(user, token || 'token-' + user.id);
    navigate('admin', 'dashboard');
  };

  const handleAdminLogout = () => {
    setAdminLogout();
    navigate('home');
  };

  // Admin pages (no store layout)
  if (currentPage.type === 'admin-login') {
    return <AdminLogin onLogin={handleAdminLogin} onNavigate={navigate} />;
  }

  if (currentPage.type === 'admin' && isAdmin) {
    return (
      <AdminDashboard
        user={adminUser}
        activeTab={currentPage.activeTab}
        onNavigate={navigate}
        onLogout={handleAdminLogout}
      />
    );
  }

  // Public pages (wrapped in store layout)
  const renderPage = () => {
    switch (currentPage.type) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'catalogue':
        return <CataloguePage onNavigate={navigate} />;
      case 'product':
        return <ProductDetailPage productId={currentPage.productId} onNavigate={navigate} />;
      case 'contact':
        return <ContactPage />;
      case 'content-page':
        return <ContentPageView slug={currentPage.slug} onNavigate={navigate} />;
      case 'blog':
        return <BlogPage onNavigate={navigate} />;
      case 'blog-post':
        return <BlogPostView postId={currentPage.postId} onNavigate={navigate} />;
      case 'portal':
        return <BuyerPortalPage />;
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
                onClick={() => navigate('home')}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
              >
                Back to Home
              </button>
              <button
                onClick={() => navigate('catalogue')}
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
    <StoreLayout currentPage={currentPage.type} onNavigate={navigate}>
      {renderPage()}
    </StoreLayout>
  );
}
