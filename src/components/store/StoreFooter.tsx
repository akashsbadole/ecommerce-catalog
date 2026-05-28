'use client';

import { Mail, Phone, MapPin, ShoppingBag, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface StoreFooterProps {
  onNavigate: (page: string, data?: unknown) => void;
  settings?: Record<string, string> | null;
}

export function StoreFooter({ onNavigate, settings }: StoreFooterProps) {
  const companyEmail = settings?.contact_email || 'hello@stylestore.com';
  const companyPhone = settings?.contact_phone || '+1 (555) 123-4567';
  const companyAddress = settings?.contact_address || '123 Style Avenue, Fashion District, NY 10001';

  return (
    <footer className="border-t bg-muted/30" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-600" />
              <span className="text-lg font-bold tracking-tight">
                Style<span className="text-emerald-600">Store</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your premier destination for quality products and exceptional service. 
              Discover our curated collection of premium items designed to elevate 
              your everyday experience.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" aria-label="Facebook" className="text-muted-foreground transition-colors hover:text-foreground">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Twitter" className="text-muted-foreground transition-colors hover:text-foreground">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="text-muted-foreground transition-colors hover:text-foreground">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-muted-foreground transition-colors hover:text-foreground">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: 'Home', page: 'home' },
                { label: 'Catalogue', page: 'catalogue' },
                { label: 'About Us', page: 'content-page', data: 'about-us' },
                { label: 'Blog', page: 'blog' },
                { label: 'Contact Us', page: 'contact' },
              ].map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => onNavigate(link.page, (link as Record<string, string>).data)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Customer Service</h3>
            <ul className="space-y-2">
              {['About Us', 'Shipping Info', 'Returns & Exchanges', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground hover:text-foreground cursor-default">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span className="text-sm text-muted-foreground">{companyEmail}</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span className="text-sm text-muted-foreground">{companyPhone}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span className="text-sm text-muted-foreground">{companyAddress}</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} StyleStore. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Crafted with care for quality shopping.
          </p>
        </div>
      </div>
    </footer>
  );
}
