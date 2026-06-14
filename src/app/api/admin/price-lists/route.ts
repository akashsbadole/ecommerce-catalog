import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logError } from '@/lib/error-logger';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (companyId) where.companyId = companyId;
    if (productId) where.productId = productId;

    const [prices, total] = await Promise.all([
      db.customPrice.findMany({
        where,
        include: {
          Company: {
            select: { id: true, name: true, tier: true },
          },
          Product: {
            select: { id: true, name: true, sku: true, price: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.customPrice.count({ where }),
    ]);

    return NextResponse.json({
      prices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logError(error, { category: 'api', context: 'Admin Price Lists GET' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { companyId, productId, price } = body;

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    if (price === undefined || typeof price !== 'number' || price < 0) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
    }

    const existing = await db.customPrice.findUnique({
      where: { companyId_productId: { companyId, productId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Custom price already exists for this company and product' },
        { status: 409 },
      );
    }

    const customPrice = await db.customPrice.create({
      data: { companyId, productId, price },
      include: {
        Company: { select: { id: true, name: true } },
        Product: { select: { id: true, name: true, sku: true } },
      },
    });

    return NextResponse.json({ price: customPrice, message: 'Custom price created successfully' }, { status: 201 });
  } catch (error) {
    logError(error, { category: 'api', context: 'Admin Price Lists POST' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
