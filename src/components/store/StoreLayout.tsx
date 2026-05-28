'use client';

import { useEffect, useState, useRef, ReactNode, cloneElement, isValidElement } from 'react';
import { StoreHeader } from './StoreHeader';
import { StoreFooter } from './StoreFooter';

interface StoreLayoutProps {
  currentPage: string;
  onNavigate: (page: string, data?: unknown) => void;
  children: ReactNode;
}

export function StoreLayout({ currentPage, onNavigate, children }: StoreLayoutProps) {
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const prevPageRef = useRef(currentPage);

  // Fetch settings on mount
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch('/api/settings', { signal: controller.signal });
        if (res.ok && !cancelled) {
          const data = await res.json();
          setSettings(data.settings || {});
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch settings:', error);
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // Inject JSON-LD Organization structured data when settings are loaded
  useEffect(() => {
    if (!settings) return;

    const siteName = settings.site_name || 'StyleStore';
    const siteDesc = settings.site_description || 'Premium Products & B2B Wholesale Supplier';
    const contactEmail = settings.contact_email || '';
    const contactPhone = settings.contact_phone || '';

    const orgJsonLd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      description: siteDesc,
      url: typeof window !== 'undefined' ? window.location.origin : '',
    };

    if (settings.site_logo) {
      orgJsonLd.logo = settings.site_logo;
    }

    const contactPoint: Record<string, unknown> = {
      '@type': 'ContactPoint',
      contactType: 'sales',
      availableLanguage: ['English'],
    };
    if (contactEmail) contactPoint.email = contactEmail;
    if (contactPhone) contactPoint.telephone = contactPhone;
    orgJsonLd.contactPoint = contactPoint;

    const existing = document.getElementById('layout-org-jsonld');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(orgJsonLd);
    script.id = 'layout-org-jsonld';
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('layout-org-jsonld');
      if (el) el.remove();
    };
  }, [settings]);

  // Scroll to top on navigation
  useEffect(() => {
    if (prevPageRef.current !== currentPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      prevPageRef.current = currentPage;
    }
  }, [currentPage]);

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader onNavigate={onNavigate} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {settings
            ? isValidElement(children)
              ? cloneElement(children, { settings })
              : children
            : children}
        </div>
      </main>

      <StoreFooter onNavigate={onNavigate} settings={settings} />
    </div>
  );
}

export { type StoreLayoutProps };
