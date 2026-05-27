'use client';

import { useEffect, useState, useRef } from 'react';
import { StoreHeader } from './StoreHeader';
import { StoreFooter } from './StoreFooter';

interface StoreLayoutProps {
  currentPage: string;
  onNavigate: (page: string, data?: unknown) => void;
  children: React.ReactNode;
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
          {children}
        </div>
      </main>

      <StoreFooter onNavigate={onNavigate} settings={settings} />
    </div>
  );
}

export { type StoreLayoutProps };
