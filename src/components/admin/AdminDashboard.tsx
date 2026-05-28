'use client';

import { useState } from 'react';
import {
  ShoppingBag,
  LayoutDashboard,
  Package,
  FolderOpen,
  MessageSquare,
  Image as ImageIcon,
  FileText,
  BookOpen,
  ArrowRightLeft,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminDashboardHome } from '@/components/admin/AdminDashboardHome';
import { AdminProducts } from '@/components/admin/AdminProducts';
import { AdminCategories } from '@/components/admin/AdminCategories';
import { AdminEnquiries } from '@/components/admin/AdminEnquiries';
import { AdminBanners } from '@/components/admin/AdminBanners';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { AdminMedia } from '@/components/admin/AdminMedia';
import { AdminPages } from '@/components/admin/AdminPages';
import { AdminBlog } from '@/components/admin/AdminBlog';
import { AdminRedirects } from '@/components/admin/AdminRedirects';

interface AdminDashboardProps {
  user: { id: string; email: string; name: string; role: string } | null;
  activeTab: string;
  onNavigate: (page: string, data?: unknown) => void;
  onLogout: () => void;
}

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: FolderOpen },
  { id: 'enquiries', label: 'Enquiries', icon: MessageSquare },
  { id: 'media', label: 'Media', icon: ImageIcon },
  { id: 'pages', label: 'Pages', icon: FileText },
  { id: 'blog', label: 'Blog', icon: BookOpen },
  { id: 'banners', label: 'Banners', icon: ImageIcon },
  { id: 'redirects', label: 'Redirects', icon: ArrowRightLeft },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function SidebarContent({
  activeTab,
  onTabChange,
  userName,
  userEmail,
  onLogout,
  onNavigate,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName: string;
  userEmail: string;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4">
        <ShoppingBag className="h-5 w-5 text-emerald-600" />
        <span className="text-lg font-bold">
          Style<span className="text-emerald-600">Store</span>
        </span>
        <Badge variant="secondary" className="ml-auto text-xs">Admin</Badge>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1" role="navigation" aria-label="Admin navigation">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {isActive && (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator />

      {/* User Info & Actions */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-muted-foreground">{userEmail}</p>
        </div>
        <Separator />
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-sm"
            onClick={() => onNavigate('home')}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            View Store
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard({ user, activeTab, onNavigate, onLogout }: AdminDashboardProps) {
  const isMobile = useIsMobile();
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    setMobileOpen(false);
  };

  const handleQuickNav = (tab: string) => {
    setCurrentTab(tab);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <AdminDashboardHome onNavigate={handleQuickNav} />;
      case 'products':
        return <AdminProducts />;
      case 'categories':
        return <AdminCategories />;
      case 'enquiries':
        return <AdminEnquiries />;
      case 'banners':
        return <AdminBanners />;
      case 'media':
        return <AdminMedia />;
      case 'pages':
        return <AdminPages />;
      case 'blog':
        return <AdminBlog />;
      case 'redirects':
        return <AdminRedirects />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboardHome onNavigate={handleQuickNav} />;
    }
  };

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 shrink-0 border-r bg-background">
          <SidebarContent
            activeTab={currentTab}
            onTabChange={handleTabChange}
            userName={user?.name || 'Admin'}
            userEmail={user?.email || ''}
            onLogout={onLogout}
            onNavigate={onNavigate}
          />
        </aside>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SidebarContent
                  activeTab={currentTab}
                  onTabChange={handleTabChange}
                  userName={user?.name || 'Admin'}
                  userEmail={user?.email || ''}
                  onLogout={onLogout}
                  onNavigate={onNavigate}
                />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold text-sm">
                Style<span className="text-emerald-600">Store</span>
              </span>
            </div>
            <Badge variant="secondary" className="text-xs ml-1">Admin</Badge>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-rose-600"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </header>
        )}

        {/* Page Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8">
            {renderContent()}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
