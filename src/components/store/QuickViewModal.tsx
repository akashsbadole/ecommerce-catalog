'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Eye, ShoppingCart, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { EnquiryModal } from './EnquiryModal';

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: number;
  comparePrice: number | null;
  wholesalePrice: number | null;
  minOrderQty: number;
  images: string;
  category: { id: string; name: string } | null;
  isFeatured: boolean;
}

interface QuickViewModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (page: string, data?: unknown) => void;
}

export function QuickViewModal({
  product,
  open,
  onOpenChange,
  onNavigate,
}: QuickViewModalProps) {
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const getFirstImage = (images: string) => {
    try {
      const arr = JSON.parse(images);
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    } catch {
      return null;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const image = getFirstImage(product.images);
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;

  const handleViewDetails = () => {
    onOpenChange(false);
    onNavigate('product', product.id);
  };

  const handleEnquire = () => {
    setEnquiryOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-emerald-600" />
              Quick View
            </DialogTitle>
            <DialogDescription className="sr-only">
              Quick preview of {product.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {image ? (
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <ShoppingCart className="h-10 w-10 text-gray-400" />
                </div>
              )}
              {hasDiscount && (
                <Badge className="absolute top-3 left-3 bg-rose-500 text-white">
                  -{discountPercent}%
                </Badge>
              )}
            </div>

            {/* Category */}
            {product.category && (
              <span className="text-xs text-emerald-600 uppercase tracking-wider font-medium">
                {product.category.name}
              </span>
            )}

            {/* Product Name */}
            <h3 className="text-xl font-bold tracking-tight">{product.name}</h3>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            <Separator />

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-emerald-600">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(product.comparePrice!)}
                  </span>
                )}
              </div>
              {product.wholesalePrice && (
                <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                  Wholesale: {formatPrice(product.wholesalePrice)}
                  <span className="text-muted-foreground font-normal">
                    {' '}· Min. {product.minOrderQty} units
                  </span>
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleEnquire}
            >
              <Send className="mr-2 h-4 w-4" />
              Enquire
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enquiry Modal */}
      <EnquiryModal
        productName={product.name}
        productId={product.id}
        open={enquiryOpen}
        onOpenChange={setEnquiryOpen}
      />
    </>
  );
}
