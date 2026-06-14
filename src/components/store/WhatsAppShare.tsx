'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WhatsAppShareProps {
  productName?: string;
  productUrl?: string;
  phoneNumber?: string;
  mode?: 'share' | 'enquiry';
}

export function WhatsAppShare({
  productName,
  productUrl,
  phoneNumber,
  mode = 'share',
}: WhatsAppShareProps) {
  const buildUrl = () => {
    const phone = phoneNumber?.replace(/[^0-9]/g, '') || '';

    if (mode === 'enquiry' && phone) {
      const text = productName
        ? `Hi, I'm interested in "${productName}". Could you provide more details?`
        : 'Hi, I have a query about your store.';
      return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    }

    const shareText = productName
      ? `Check out ${productName}${productUrl ? `\n${productUrl}` : ''}`
      : productUrl || '';
    return `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  };

  const label = mode === 'enquiry' ? 'Chat on WhatsApp' : 'Share on WhatsApp';

  return (
    <Button
      variant="outline"
      size="sm"
      className="bg-[#25D366] hover:bg-[#1da851] text-white border-[#25D366] hover:border-[#1da851]"
      onClick={() => window.open(buildUrl(), '_blank', 'noopener,noreferrer')}
    >
      <MessageCircle className="mr-1.5 h-4 w-4" />
      {label}
    </Button>
  );
}
