import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logError } from '@/lib/error-logger';

const VALID_FREQUENCIES = ['weekly', 'bi-weekly', 'monthly'];

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (status) {
      where.status = status;
    }

    const [subscriptions, total] = await Promise.all([
      db.subscription.findMany({
        where,
        include: {
          Product: { select: { id: true, name: true, slug: true, price: true, images: true, description: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.subscription.count({ where }),
    ]);

    return NextResponse.json({
      subscriptions,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logError(error, { category: 'api', context: 'User subscriptions GET' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity, frequency, nextDeliveryDate, companyId } = body;

    if (!productId || !quantity || !frequency || !nextDeliveryDate) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, quantity, frequency, nextDeliveryDate' },
        { status: 400 }
      );
    }

    if (!VALID_FREQUENCIES.includes(frequency)) {
      return NextResponse.json(
        { error: `Invalid frequency. Must be one of: ${VALID_FREQUENCIES.join(', ')}` },
        { status: 400 }
      );
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      return NextResponse.json({ error: 'Quantity must be a positive integer' }, { status: 400 });
    }

    const deliveryDate = new Date(nextDeliveryDate);
    if (isNaN(deliveryDate.getTime())) {
      return NextResponse.json({ error: 'Invalid nextDeliveryDate' }, { status: 400 });
    }

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const resolvedCompanyId = companyId || null;

    const subscription = await db.subscription.create({
      data: {
        userId,
        companyId: resolvedCompanyId,
        productId,
        quantity: qty,
        frequency,
        nextDeliveryDate: deliveryDate,
      },
      include: {
        Product: { select: { id: true, name: true, slug: true, price: true, images: true } },
      },
    });

    return NextResponse.json({ subscription, message: 'Subscription created successfully' }, { status: 201 });
  } catch (error) {
    logError(error, { category: 'api', context: 'User subscriptions POST' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
