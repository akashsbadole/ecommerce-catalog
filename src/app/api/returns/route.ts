import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { resolveUserId } from '@/lib/auth-helpers';

function generateReturnNumber(): string {
  return `RET-${Date.now().toString(36).toUpperCase()}`;
}

// GET /api/returns - Get user's returns
export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
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

    const [returns, total] = await Promise.all([
      db.return.findMany({
        where,
        include: {
          Order: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.return.count({ where }),
    ]);

    return NextResponse.json({
      returns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Returns GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/returns - Create a return request
export async function POST(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storeId = getStoreId(request);
    const body = await request.json();
    const { orderId, reason, reasonDetail, items, refundMethod, notes } = body;

    if (!orderId || !reason) {
      return NextResponse.json(
        { error: 'orderId and reason are required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    // Verify order belongs to user
    const order = await db.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Calculate total from items
    let total = 0;
    for (const item of items) {
      const orderItem = order.items.find((oi) => oi.id === item.orderItemId);
      if (orderItem) {
        total += orderItem.price * item.quantity;
      }
    }

    const returnRequest = await db.return.create({
      data: {
        storeId: storeId || order.storeId,
        orderId,
        userId,
        returnNumber: generateReturnNumber(),
        status: 'requested',
        reason,
        reasonDetail: reasonDetail || null,
        items: JSON.stringify(items),
        total,
        refundMethod: refundMethod || 'original_payment',
        refundAmount: 0,
        notes: notes || null,
      },
      include: {
        Order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
          },
        },
      },
    });

    return NextResponse.json({
      return: returnRequest,
      message: 'Return request created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Returns POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
