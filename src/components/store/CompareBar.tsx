'use client';

import Image from 'next/image';
import { X, GitCompareArrows, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { getFirstImage } from '@/lib/utils';

export function CompareBar() {
  const { compare, removeFromCompare, clearCompare, setCompareOpen, navigate } = useAppStore();
  const { products } = compare;

  if (products.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground shrink-0">
            <GitCompareArrows className="h-4 w-4" />
            <span>Compare ({products.length}/4)</span>
          </div>

          <div className="flex items-center gap-3 flex-1 overflow-x-auto">
            {products.map((product) => {
              const image = getFirstImage(product.images);
              return (
                <div
                  key={product.id}
                  className="relative flex items-center gap-2 rounded-lg border bg-card px-3 py-2 shrink-0"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-cover"

                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        N/A
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium truncate max-w-[120px]">{product.name}</span>
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted transition-colors"
                    aria-label={`Remove ${product.name} from compare`}
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              );
            })}
            {products.length < 4 && (
              <div className="flex items-center justify-center h-14 w-24 shrink-0 rounded-lg border border-dashed text-xs text-muted-foreground">
                + Add more
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCompare}
              className="text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/80 text-white"
              onClick={() => navigate('compare')}
              disabled={products.length < 2}
            >
              <GitCompareArrows className="h-4 w-4 mr-1" />
              Compare Now
            </Button>
          </div>
        </div>
        {products.length >= 4 && (
          <p className="text-xs text-muted-foreground mt-1.5">Maximum 4 products for comparison</p>
        )}
      </div>
    </div>
  );
}
