'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package, Loader2, CheckCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { getFirstImage } from '@/lib/utils';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  price: number;
  quantity: number;
  total: number;
  images: string;
}

interface ReturnRequestFormProps {
  orderId: string;
  orderItems: OrderItem[];
  onSubmitted?: () => void;
  onCancel?: () => void;
}

const RETURN_REASONS = [
  { value: 'damaged', label: 'Item arrived damaged' },
  { value: 'wrong_item', label: 'Wrong item received' },
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'other', label: 'Other' },
] as const;

const REFUND_METHODS = [
  { value: 'original_payment', label: 'Original payment method' },
  { value: 'store_credit', label: 'Store credit' },
  { value: 'bank_transfer', label: 'Bank transfer' },
] as const;

export function ReturnRequestForm({
  orderId,
  orderItems,
  onSubmitted,
  onCancel,
}: ReturnRequestFormProps) {
  const { auth } = useAppStore();
  const [submitting, setSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [reason, setReason] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [refundMethod, setRefundMethod] = useState('original_payment');

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedItems.size === orderItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(orderItems.map((i) => i.id)));
    }
  };

  const handleSubmit = async () => {
    if (selectedItems.size === 0) {
      toast.error('Please select at least one item to return');
      return;
    }
    if (!reason) {
      toast.error('Please select a return reason');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          orderId,
          itemIds: Array.from(selectedItems),
          reason,
          reasonDetail: reasonDetail.trim() || null,
          refundMethod,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          'Return request submitted successfully'
        );
        onSubmitted?.();
      } else {
        toast.error(data.error || 'Failed to submit return request');
      }
    } catch {
      toast.error('Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTotal = orderItems
    .filter((i) => selectedItems.has(i.id))
    .reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Items Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Select items to return
          </Label>
          <Button variant="ghost" size="sm" onClick={selectAll} className="h-7 text-xs">
            {selectedItems.size === orderItems.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {orderItems.map((item) => {
            const image = getFirstImage(item.images);
            const isSelected = selectedItems.has(item.id);
            return (
              <label
                key={item.id}
                className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                  {image ? (
                    <Image
                      src={image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  {item.sku && (
                    <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <span className="font-bold text-sm shrink-0">
                  {formatCurrency(item.total)}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Return Reason */}
      <div className="space-y-2">
        <Label>
          Reason for Return <span className="text-rose-500">*</span>
        </Label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger>
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {RETURN_REASONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Additional Details */}
      <div className="space-y-2">
        <Label htmlFor="return-detail">Additional Details</Label>
        <Textarea
          id="return-detail"
          placeholder="Please provide any additional details about your return request..."
          rows={3}
          value={reasonDetail}
          onChange={(e) => setReasonDetail(e.target.value)}
        />
      </div>

      {/* Refund Method */}
      <div className="space-y-2">
        <Label>
          Refund Method <span className="text-rose-500">*</span>
        </Label>
        <Select value={refundMethod} onValueChange={setRefundMethod}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REFUND_METHODS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Summary & Actions */}
      <Card className="bg-muted/30">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {selectedItems.size} of {orderItems.length} items selected
            </span>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Estimated refund</p>
              <p className="text-base font-bold text-primary">
                {formatCurrency(selectedTotal)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" size="sm" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={submitting || selectedItems.size === 0 || !reason}
        >
          {submitting ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
          )}
          {submitting ? 'Submitting...' : 'Submit Return'}
        </Button>
      </div>
    </div>
  );
}
