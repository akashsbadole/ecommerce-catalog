"use client";

import { Home, Search, ShoppingCart, User, Menu } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export function MobileBottomNav({ onNavigate }: MobileBottomNavProps) {
  const { cart, currentPage } = useAppStore();

  const navItems = [
    {
      label: "Home",
      icon: Home,
      page: "home",
      active: currentPage.type === "home",
    },
    {
      label: "Search",
      icon: Search,
      page: "catalogue", // Or maybe open search dialog? Let's stick to catalogue for now or home-search
      active: currentPage.type === "catalogue",
    },
    {
      label: "Cart",
      icon: ShoppingCart,
      page: "cart",
      active: currentPage.type === "cart",
      badge: cart.itemCount,
    },
    {
      label: "Account",
      icon: User,
      page: "account",
      active: currentPage.type === "account",
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t pb-safe">
      <nav className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onNavigate(item.page)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              item.active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <item.icon className="h-5 w-5" />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center px-1">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium leading-none">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
