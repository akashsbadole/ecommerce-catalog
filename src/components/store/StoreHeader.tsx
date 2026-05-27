'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

interface StoreHeaderProps {
  onNavigate: (page: string) => void;
}

const navLinks = [
  { label: 'Home', page: 'home' },
  { label: 'Catalogue', page: 'catalogue' },
  { label: 'Contact', page: 'contact' },
];

export function StoreHeader({ onNavigate }: StoreHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <ShoppingBag className="h-6 w-6 text-emerald-600" />
          <span className="text-xl font-bold tracking-tight">
            Style<span className="text-emerald-600">Store</span>
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Button
              key={link.page}
              variant="ghost"
              className="text-sm font-medium"
              onClick={() => onNavigate(link.page)}
            >
              {link.label}
            </Button>
          ))}
          <Separator orientation="vertical" className="mx-2 h-6" />
          <Button
            variant="outline"
            size="sm"
            className="text-sm"
            onClick={() => onNavigate('admin-login')}
          >
            Admin
          </Button>
        </nav>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-emerald-600" />
                StyleStore
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 px-4 pt-4" role="navigation" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <SheetClose asChild key={link.page}>
                  <Button
                    variant="ghost"
                    className="justify-start text-base"
                    onClick={() => onNavigate(link.page)}
                  >
                    {link.label}
                  </Button>
                </SheetClose>
              ))}
              <Separator className="my-2" />
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="justify-start text-base"
                  onClick={() => onNavigate('admin-login')}
                >
                  Admin Panel
                </Button>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
