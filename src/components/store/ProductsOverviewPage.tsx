"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Package } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

interface ProductsOverviewPageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export function ProductsOverviewPage({ onNavigate }: ProductsOverviewPageProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch {
        console.error("Failed to fetch categories");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white text-center px-4 py-16 md:py-24 shadow-sm">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
          Our Product Categories
        </h1>
        <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Explore our wide range of high-quality products designed to meet your needs. From essentials to premium items, we have something for everyone.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-9 bg-gray-200 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer"
                onClick={() => onNavigate("category", cat.slug)}
              >
                {/* Image */}
                {cat.image ? (
                  <div className="relative h-48 w-full bg-gray-100">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-gray-100 flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-300" />
                  </div>
                )}

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">
                      {cat.description}
                    </p>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate("category", cat.slug);
                    }}
                    className="self-start inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2 rounded-md transition-colors"
                  >
                    Enquire
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">No categories yet</h2>
            <p className="text-gray-400 mt-2">Categories will appear here once added.</p>
          </div>
        )}
      </div>
    </div>
  );
}
