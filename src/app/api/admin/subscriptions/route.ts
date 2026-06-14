import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logError } from '@/lib/error-logger';

const VALID_FREQUENCIES = ['weekly', 'bi-weekly', 'monthly'];
const VALID_STATUSES = ['active', 'paused', 'cancelled'];

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status && VALID_STATUSES.includes(status)) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { User: { name: { contains: search, mode: 'insensitive' } } },
        { User: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [subscriptions, total] = await Promise.all([
      db.subscription.findMany({
        where,
        include: {
          User: { select: { id: true, name: true, email: true, phone: true } },
          Company: { select: { id: true, name: true } },
          Product: { select: { id: true, name: true, slug: true, price: true, images: true } },
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
    logError(error, { category: 'api', context: 'Admin subscriptions GET' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { userId, companyId, productId, quantity, frequency, nextDeliveryDate } = body;

    if (!userId || !productId || !quantity || !frequency || !nextDeliveryDate) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, productId, quantity, frequency, nextDeliveryDate' },
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

    const [user, product] = await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.product.findUnique({ where: { id: productId } }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    if (companyId) {
      const company = await db.company.findUnique({ where: { id: companyId } });
      if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }
    }

    const subscription = await db.subscription.create({
      data: {
        userId,
        companyId: companyId || null,
        productId,
        quantity: qty,
        frequency,
        nextDeliveryDate: deliveryDate,
      },
      include: {
        User: { select: { id: true, name: true, email: true } },
        Product: { select: { id: true, name: true, slug: true } },
        Company: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ subscription, message: 'Subscription created successfully' }, { status: 201 });
  } catch (error) {
    logError(error, { category: 'api', context: 'Admin subscriptions POST' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
