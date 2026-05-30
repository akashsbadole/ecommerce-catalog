'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AdminClientProps {
  initialUser: AdminUser | null;
  initialToken: string | null;
}

export default function AdminClient({ initialUser, initialToken }: AdminClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'dashboard';

  const { isAdmin, adminUser, setAdminLogin, setAdminLogout } = useAppStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    // If we have initial auth from server, use it
    if (initialUser && initialToken) {
      // Set up store with server auth state
      const storedToken = localStorage.getItem('admin_token');
      if (!storedToken) {
        localStorage.setItem('admin_token', initialToken);
      }

      // Check if already authenticated in store
      if (!isAdmin) {
        setAdminLogin(initialUser, initialToken);
      }
    }
  }, [initialUser, initialToken, isAdmin, setAdminLogin]);

  const handleAdminLogin = (user: AdminUser, token = '') => {
    setAdminLogin(user, token);
    document.cookie = `admin_token=${token}; path=/; max-age=604800; SameSite=Lax`;
  };

  const handleAdminLogout = () => {
    setAdminLogout();

    // Clear cookie
    document.cookie = 'admin_token=; path=/; max-age=0';

    router.push('/');
  };

  const handleNavigate = (page: string, data?: unknown) => {
    if (page === 'home') {
      router.push('/');
    } else if (page === 'admin') {
      const targetTab = data as string || 'dashboard';
      router.push(`/admin?tab=${targetTab}`);
    }
  };

  // Show loading while checking auth state
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin || !adminUser) {
    return <AdminLogin onLogin={handleAdminLogin} onNavigate={handleNavigate} />;
  }

  return (
    <AdminDashboard
      user={adminUser}
      activeTab={tab}
      onNavigate={handleNavigate}
      onLogout={handleAdminLogout}
    />
  );
}