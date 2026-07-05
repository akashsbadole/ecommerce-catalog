"use client";

import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  page?: string;
  slug?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (page: string, slug?: string) => void;
}

export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav className="flex gap-1.5 text-xs text-muted-foreground items-center mb-6" aria-label="breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            {isLast || !item.page ? (
              <span className={isLast ? "text-foreground font-medium" : ""}>
                {i === 0 && <Home className="h-3 w-3 inline mr-1" />}
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => onNavigate?.(item.page!, item.slug)}
                className="hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                {i === 0 && <Home className="h-3 w-3" />}
                {item.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
