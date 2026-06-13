'use client';

import { useEffect, useRef, ReactNode, cloneElement, isValidElement } from 'react';
import { useAppStore } from '@/lib/store';
import { StoreHeader } from './StoreHeader';
import { StoreFooter } from './StoreFooter';
import { BackToTop } from './BackToTop';
import { CookieConsent } from './CookieConsent';
import { CompareBar } from './CompareBar';
import { MobileBottomNav } from './MobileBottomNav';

interface StoreLayoutProps {
  currentPage: string;
  onNavigate: (page: string, data?: unknown) => void;
  children: ReactNode;
}

export function StoreLayout({ currentPage, onNavigate, children }: StoreLayoutProps) {
  const settings = useAppStore((s) => s.settings);
  const fetchSettings = useAppStore((s) => s.fetchSettings);
  const prevPageRef = useRef(currentPage);

  // Fetch settings on mount if not already loaded
  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

  // Inject JSON-LD Organization structured data when settings are loaded
  useEffect(() => {
    if (!settings) return;

    const siteName = settings.site_name || 'My Store';
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

      <main className="flex-1 pb-16 lg:pb-0">
        {settings
          ? isValidElement(children)
            ? cloneElement(children as React.ReactElement<Record<string, unknown>>, { settings })
            : children
          : children}
      </main>

      <StoreFooter onNavigate={onNavigate} settings={settings} />

      <MobileBottomNav onNavigate={onNavigate} />

      <div className="md:mb-16 lg:mb-0">
        <BackToTop />
      </div>

      <div className="md:mb-16 lg:mb-0">
        <CompareBar />
      </div>

      <CookieConsent />
    </div>
  );
}

export { type StoreLayoutProps };
