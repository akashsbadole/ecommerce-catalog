'use client';

import Image from 'next/image';
import { ShoppingCart, ArrowLeft, X, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppStore } from '@/lib/store';
import { formatPrice as libFormatPrice } from '@/lib/pricing';

interface ComparePageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export function ComparePage({ onNavigate }: ComparePageProps) {
  const { compare, removeFromCompare, clearCompare, addToCart, auth, settings } = useAppStore();
  const { products } = compare;

  const getFirstImage = (images: string) => {
    try {
      const arr = JSON.parse(images);
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    } catch {
      return null;
    }
  };

  const formatPrice = (price: number) => {
    return libFormatPrice(price, settings?.currency || 'USD');
  };

  const handleAddToCart = async (productId: string) => {
    if (!auth.token) {
      toast.error('Please login to add items to cart');
      return;
    }
    const success = await addToCart(productId);
    if (success) {
      toast.success('Added to cart');
    } else {
      toast.error('Failed to add to cart');
    }
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col gap-6 pb-12">
        <Button variant="ghost" className="w-fit" onClick={() => onNavigate('catalogue')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Catalogue
        </Button>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">No products to compare</h2>
          <p className="text-muted-foreground mt-2">
            Add products from the catalogue to start comparing.
          </p>
          <Button className="mt-6 bg-primary hover:bg-primary/80 text-white" onClick={() => onNavigate('catalogue')}>
            Browse Catalogue
          </Button>
        </div>
      </div>
    );
  }

  const rows: { label: string; render: (product: typeof products[number]) => React.ReactNode }[] = [
    {
      label: 'Image',
      render: (product) => {
        const img = getFirstImage(product.images);
        return (
          <div className="relative h-40 w-40 mx-auto overflow-hidden rounded-lg bg-muted">
            {img ? (
              <Image src={img} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      label: 'Name',
      render: (product) => (
        <span className="font-semibold text-foreground">{product.name}</span>
      ),
    },
    {
      label: 'Price',
      render: (product) => (
        <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
      ),
    },
    {
      label: 'Category',
      render: (product) => (
        <span className="text-muted-foreground">
          {product.Category?.name || '—'}
        </span>
      ),
    },
    {
      label: 'Stock',
      render: (product) => {
        if (product.stock <= 0) {
          return <Badge variant="secondary" className="bg-rose-100 text-rose-700">Out of stock</Badge>;
        }
        if (product.stock <= 5) {
          return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Only {product.stock} left</Badge>;
        }
        return <Badge variant="secondary" className="bg-primary/10 text-primary/80">In Stock</Badge>;
      },
    },
    {
      label: 'SKU',
      render: (product) => (
        <span className="text-muted-foreground font-mono text-sm">{product.sku || '—'}</span>
      ),
    },
    {
      label: 'Description',
      render: (product) => (
        <span className="text-sm text-muted-foreground line-clamp-4">
          {product.shortDescription || product.description?.replace(/<[^>]*>/g, '').slice(0, 150) || '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="w-fit" onClick={() => onNavigate('catalogue')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catalogue
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Compare Products</h1>
        </div>
        <Button variant="outline" size="sm" onClick={clearCompare}>
          Clear All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px] font-medium text-muted-foreground bg-muted/50">Feature</TableHead>
              {products.map((product) => (
                <TableHead key={product.id} className="text-center min-w-[200px]">
                  <div className="flex flex-col items-center gap-1 relative">
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute -top-1 -right-1 rounded-full p-1 hover:bg-muted transition-colors"
                      aria-label={`Remove ${product.name}`}
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <span className="font-semibold">{product.name}</span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableHead className="font-medium text-muted-foreground bg-muted/50">
                  {row.label}
                </TableHead>
                {products.map((product) => (
                  <TableCell key={product.id} className="text-center">
                    {row.render(product)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow>
              <TableHead className="font-medium text-muted-foreground bg-muted/50">
                Action
              </TableHead>
              {products.map((product) => (
                <TableCell key={product.id} className="text-center">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/80 text-white"
                    onClick={() => handleAddToCart(product.id)}
                  >
                    <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                    Add to Cart
                  </Button>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
