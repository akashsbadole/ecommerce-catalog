'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, ShoppingBag, Facebook, Twitter, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface StoreFooterProps {
  onNavigate: (page: string, data?: unknown) => void;
  settings?: Record<string, string> | null;
}

export function StoreFooter({ onNavigate, settings }: StoreFooterProps) {
  const companyEmail = settings?.site_email || settings?.contact_email || '';
  const companyPhone = settings?.site_phone || settings?.contact_phone || '';
  const companyAddress = settings?.site_address || settings?.contact_address || '';
  const siteName = settings?.site_name || 'My Store';

  // Social media links from settings
  const facebookUrl = settings?.facebook_url || '#';
  const twitterUrl = settings?.twitter_url || '#';
  const instagramUrl = settings?.instagram_url || '#';
  const linkedinUrl = settings?.linkedin_url || '#';
  const whatsappNumber = settings?.whatsapp_number;

  // Customer service links that navigate to content pages
  const customerServiceLinks = [
    { label: 'About Us', page: 'content-page', data: 'about-us' },
    { label: 'Shipping Info', page: 'content-page', data: 'shipping-info' },
    { label: 'Returns & Exchanges', page: 'content-page', data: 'returns-exchanges' },
    { label: 'Privacy Policy', page: 'content-page', data: 'privacy-policy' },
    { label: 'Terms of Service', page: 'content-page', data: 'terms-of-service' },
  ];

  // Newsletter subscription
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setSubscribing(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || 'Subscribed successfully!');
        setNewsletterEmail('');
      } else {
        toast.error(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="border-t bg-muted/30" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold tracking-tight">
                {siteName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {settings?.site_description || 'Your trusted online store for quality products and exceptional service.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground transition-colors hover:text-foreground">
                <Facebook className="h-4 w-4" />
              </a>
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground transition-colors hover:text-foreground">
                <Twitter className="h-4 w-4" />
              </a>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground transition-colors hover:text-foreground">
                <Instagram className="h-4 w-4" />
              </a>
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground transition-colors hover:text-foreground">
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
              {customerServiceLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => onNavigate(link.page, link.data)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href={`mailto:${companyEmail}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {companyEmail}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href={`tel:${companyPhone}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {companyPhone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-muted-foreground">{companyAddress}</span>
              </li>
              {whatsappNumber && (
                <li className="flex items-start gap-2">
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    WhatsApp: {whatsappNumber}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-10 rounded-lg border bg-background/50 p-6 text-center sm:text-left">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Subscribe to Our Newsletter</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Get the latest updates, deals, and news delivered to your inbox.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full sm:w-auto gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="sm:w-64"
                aria-label="Email for newsletter subscription"
              />
              <Button type="submit" disabled={subscribing} className="shrink-0">
                <Mail className="mr-2 h-4 w-4" />
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {settings?.site_name || 'My Store'}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Crafted with care for quality shopping.
          </p>
        </div>
      </div>
    </footer>
  );
}
