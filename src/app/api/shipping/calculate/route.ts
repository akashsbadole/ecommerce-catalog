import { NextRequest, NextResponse } from 'next/server';
import { getSetting } from '@/lib/settings';
import { getStoreId } from '@/lib/store-db';

export async function POST(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const body = await request.json();
    const { subtotal } = body;

    const method = await getSetting('shipping_method', storeId) || 'free';
    const rate = parseFloat(await getSetting('shipping_rate', storeId) || '0');
    const freeAbove = parseFloat(await getSetting('shipping_free_above', storeId) || '0');

    let shippingCost = 0;

    if (method === 'flat_rate') {
      shippingCost = rate;
    } else if (method === 'flat_rate_free_above') {
      if (freeAbove > 0 && subtotal >= freeAbove) {
        shippingCost = 0;
      } else {
        shippingCost = rate;
      }
    }

    return NextResponse.json({
      shippingCost,
      method,
      freeAbove,
      rate,
    });
  } catch (error) {
    console.error('Shipping calculation error:', error);
    return NextResponse.json({ shippingCost: 0 });
  }
}
