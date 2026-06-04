import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const coupons = await db.coupon.findMany({
      where: storeId ? { storeId } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Get coupons error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, type, value, minOrder, maxUses, startsAt, expiresAt, isActive } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { error: 'Code, type, and value are required' },
        { status: 400 }
      );
    }

    const storeId = getStoreId(request);
    const couponCode = code.toUpperCase();

    // Check for duplicate code within store
    const existing = await db.coupon.findFirst({
      where: {
        code: couponCode,
        ...(storeId ? { storeId } : {}),
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A coupon with this code already exists' },
        { status: 400 }
      );
    }

    const coupon = await db.coupon.create({
      data: {
        code: couponCode,
        type,
        value,
        minOrder: minOrder || 0,
        maxUses: maxUses || null,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive ?? true,
        ...(storeId ? { storeId } : {}),
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error('Create coupon error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
