import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json({ error: 'Code and subtotal are required' }, { status: 400 });
    }

    const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 });
    }

    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      return NextResponse.json({ error: 'This coupon is not yet active' }, { status: 400 });
    }
    if (coupon.expiresAt && now > coupon.expiresAt) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }

    if (subtotal < coupon.minOrder) {
      return NextResponse.json(
        { error: `Minimum order amount of ${coupon.minOrder} required` },
        { status: 400 }
      );
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 });
    }

    const discount =
      coupon.type === 'percentage'
        ? Math.round(subtotal * coupon.value) / 100
        : Math.min(coupon.value, subtotal);

    return NextResponse.json({
      discount: Math.round(discount * 100) / 100,
      type: coupon.type,
      value: coupon.value,
      message: coupon.type === 'percentage' ? `${coupon.value}% discount applied` : `${coupon.value} discount applied`,
    });
  } catch (error) {
    console.error('Coupon validate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
