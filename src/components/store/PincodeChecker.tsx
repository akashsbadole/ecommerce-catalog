'use client';

import { useState } from 'react';
import { MapPin, Truck, CreditCard, XCircle, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface PincodeResult {
  serviceable: boolean;
  deliveryDays: number | null;
  shippingCost: number | null;
  codAvailable: boolean;
  message: string;
  pincode?: string;
  city?: string;
  state?: string;
}

interface PincodeCheckerProps {
  productId?: string;
  initialPincode?: string;
  onPincodeVerified?: (data: { pincode: string; city: string; state: string; serviceable: boolean }) => void;
}

export function PincodeChecker({
  productId,
  initialPincode = '',
  onPincodeVerified,
}: PincodeCheckerProps) {
  const [pincode, setPincode] = useState(initialPincode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PincodeResult | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const handleCheck = async () => {
    const cleaned = pincode.replace(/\D/g, '');
    if (cleaned.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/pincode/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: cleaned, productId }),
      });
      const data = await res.json();
      if (res.ok) {
        const pincodeResult: PincodeResult = {
          serviceable: data.serviceable ?? data.available ?? false,
          deliveryDays: data.deliveryDays ?? null,
          shippingCost: data.shippingCost ?? null,
          codAvailable: data.codAvailable ?? false,
          message: data.message ?? '',
          pincode: cleaned,
          city: data.city ?? '',
          state: data.state ?? '',
        };
        setResult(pincodeResult);
        onPincodeVerified?.({
          pincode: cleaned,
          city: pincodeResult.city || '',
          state: pincodeResult.state || '',
          serviceable: pincodeResult.serviceable,
        });
      } else {
        toast.error(data.error || 'Failed to check pincode');
      }
    } catch {
      toast.error('Failed to check delivery availability');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCheck();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Check delivery availability</span>
      </div>
      <div className="flex gap-2">
        <Input
          type="tel"
          placeholder="Enter 6-digit pincode"
          value={pincode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
            setPincode(val);
            setResult(null);
          }}
          onKeyDown={handleKeyDown}
          className="max-w-[180px]"
          maxLength={6}
        />
        <Button
          onClick={handleCheck}
          disabled={loading || pincode.replace(/\D/g, '').length !== 6}
          size="sm"
          variant="outline"
        >
          {loading ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            'Check'
          )}
        </Button>
      </div>

      {result && (
        <Card
          className={`border ${
            result.serviceable
              ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30'
              : 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30'
          }`}
        >
          <CardContent className="p-4">
            {!result.serviceable ? (
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <XCircle className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">
                  {result.message || 'This pincode is not serviceable'}
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Truck className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">
                    Delivery in{' '}
                    <span className="font-bold">
                      {result.deliveryDays}{' '}
                      {result.deliveryDays === 1 ? 'day' : 'days'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>
                    Shipping:{' '}
                    {result.shippingCost === 0 || result.shippingCost === null
                      ? 'Free'
                      : formatCurrency(result.shippingCost)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5" />
                    COD:{' '}
                    {result.codAvailable ? (
                      <Badge variant="secondary" className="text-xs py-0">
                        Available
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Not available</span>
                    )}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
