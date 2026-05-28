'use client';

import { useState, useEffect } from 'react';
import { Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({ accepted: true, essentialOnly: false, date: new Date().toISOString() }));
    setVisible(false);
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({ accepted: true, essentialOnly: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="mx-auto max-w-4xl rounded-xl border border-emerald-200 bg-background/95 backdrop-blur-sm p-5 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
            <Shield className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-foreground">
              We use cookies to improve your experience.
            </p>
            <p className="text-xs text-muted-foreground">
              We use essential cookies to make our site work, and optional analytics cookies to understand how you interact with it. You can accept all cookies or reject non-essential ones.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Accept All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRejectNonEssential}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                Reject Non-Essential
              </Button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Dismiss cookie banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
