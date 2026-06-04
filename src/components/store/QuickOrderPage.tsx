'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft, Plus, Trash2, ClipboardPaste, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';

interface QuickOrderRow {
  id: string;
  sku: string;
  quantity: number;
  status: 'pending' | 'success' | 'not-found' | 'error';
  message: string;
}

interface QuickOrderPageProps {
  onNavigate: (page: string, data?: unknown) => void;
}

function createEmptyRow(): QuickOrderRow {
  return {
    id: crypto.randomUUID(),
    sku: '',
    quantity: 1,
    status: 'pending',
    message: '',
  };
}

export function QuickOrderPage({ onNavigate }: QuickOrderPageProps) {
  const { auth, addToCart } = useAppStore();
  const [rows, setRows] = useState<QuickOrderRow[]>(() => [createEmptyRow()]);
  const [loading, setLoading] = useState(false);
  const [pasteValue, setPasteValue] = useState('');

  const addRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRow = (id: string, field: 'sku' | 'quantity', value: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, [field]: field === 'quantity' ? Math.max(1, parseInt(value) || 1) : value, status: 'pending', message: '' }
          : r
      )
    );
  };

  const parsePaste = () => {
    const lines = pasteValue.split('\n').filter((l) => l.trim());
    const parsed: QuickOrderRow[] = [];
    for (const line of lines) {
      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      if (parts.length >= 2) {
        parsed.push({
          id: crypto.randomUUID(),
          sku: parts[0].trim(),
          quantity: Math.max(1, parseInt(parts[1].trim()) || 1),
          status: 'pending',
          message: '',
        });
      }
    }
    if (parsed.length > 0) {
      setRows(parsed);
      setPasteValue('');
      toast.success(`Parsed ${parsed.length} line items`);
    } else {
      toast.error('No valid SKU/Quantity pairs found. Use tab or comma separated values.');
    }
  };

  const addAllToCart = useCallback(async () => {
    if (!auth.token) {
      toast.error('Please log in to add items to cart');
      return;
    }

    setLoading(true);
    const validRows = rows.filter((r) => r.sku.trim() && r.quantity > 0);
    if (validRows.length === 0) {
      toast.error('Please enter at least one SKU with a quantity');
      setLoading(false);
      return;
    }

    let successCount = 0;
    const results: QuickOrderRow[] = [];

    for (const row of validRows) {
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(row.sku)}&all=true`
        );
        if (!res.ok) {
          results.push({ ...row, status: 'error', message: 'Search failed' });
          continue;
        }
        const data = await res.json();
        const product = (data.products || []).find(
          (p: { sku: string }) => p.sku === row.sku
        ) || (data.products || [])[0];

        if (!product) {
          results.push({ ...row, status: 'not-found', message: `No product with SKU "${row.sku}"` });
          continue;
        }

        if (product.stock < row.quantity) {
          results.push({ ...row, status: 'not-found', message: `"${product.name}" only has ${product.stock} in stock` });
          continue;
        }

        const added = await addToCart(product.id, row.quantity);
        if (added) {
          successCount++;
          results.push({ ...row, status: 'success', message: `"${product.name}" added` });
        } else {
          results.push({ ...row, status: 'error', message: `Failed to add "${product.name}"` });
        }
      } catch {
        results.push({ ...row, status: 'error', message: 'Network error' });
      }
    }

    setRows(results);
    if (successCount > 0) {
      toast.success(`${successCount} item${successCount > 1 ? 's' : ''} added to cart`);
    }
    const notFoundCount = results.filter((r) => r.status === 'not-found').length;
    const errorCount = results.filter((r) => r.status === 'error').length;
    if (notFoundCount > 0) {
      toast.warning(`${notFoundCount} item${notFoundCount > 1 ? 's' : ''} not found`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} item${errorCount > 1 ? 's' : ''} failed`);
    }
    setLoading(false);
  }, [rows, auth.token, addToCart]);

  if (!auth.token) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold">Quick Order</h1>
        <p className="mt-2 text-muted-foreground">
          Please log in to use the quick order pad
        </p>
        <Button className="mt-6" onClick={() => onNavigate('home')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => onNavigate('home')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Quick Order</h1>
          <p className="text-sm text-muted-foreground">
            Enter SKU codes and quantities to quickly add items to your cart
          </p>
        </div>
      </div>

      {/* Paste from spreadsheet */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ClipboardPaste className="h-4 w-4" />
            Paste from Spreadsheet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder={`Paste SKU/Quantity pairs here (one per line)\nExample:\nSKU001\t5\nSKU002\t10\nSKU003\t2`}
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            rows={4}
          />
          <Button variant="outline" size="sm" onClick={parsePaste} disabled={!pasteValue.trim()}>
            Parse & Load
          </Button>
        </CardContent>
      </Card>

      {/* SKU Order Rows */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Order Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              <Input
                placeholder="SKU"
                value={row.sku}
                onChange={(e) => updateRow(row.id, 'sku', e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                min={1}
                placeholder="Qty"
                value={row.quantity}
                onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                className="w-24"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRow(row.id)}
                disabled={rows.length <= 1}
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
              {row.status === 'success' && (
                <span className="text-xs text-green-600 whitespace-nowrap">{row.message}</span>
              )}
              {row.status === 'not-found' && (
                <span className="text-xs text-amber-600 whitespace-nowrap">{row.message}</span>
              )}
              {row.status === 'error' && (
                <span className="text-xs text-red-600 whitespace-nowrap">{row.message}</span>
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={addRow}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Row
            </Button>
            <Button onClick={addAllToCart} disabled={loading} className="ml-auto">
              <ShoppingCart className="mr-1.5 h-4 w-4" />
              {loading ? 'Adding...' : 'Add All to Cart'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
