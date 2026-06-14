import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logError } from '@/lib/error-logger';

const VALID_FREQUENCIES = ['weekly', 'bi-weekly', 'monthly'];
const USER_UPDATABLE_STATUSES = ['active', 'paused', 'cancelled'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const subscription = await db.subscription.findFirst({
      where: { id, userId },
      include: {
        Product: { select: { id: true, name: true, slug: true, price: true, images: true, description: true } },
        Company: { select: { id: true, name: true } },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    logError(error, { category: 'api', context: 'User subscription GET' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { quantity, frequency, nextDeliveryDate, status } = body;

    const existing = await db.subscription.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (quantity !== undefined) {
      const qty = parseInt(quantity);
      if (isNaN(qty) || qty < 1) {
        return NextResponse.json({ error: 'Quantity must be a positive integer' }, { status: 400 });
      }
      updateData.quantity = qty;
    }

    if (frequency !== undefined) {
      if (!VALID_FREQUENCIES.includes(frequency)) {
        return NextResponse.json(
          { error: `Invalid frequency. Must be one of: ${VALID_FREQUENCIES.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.frequency = frequency;
    }

    if (nextDeliveryDate !== undefined) {
      const deliveryDate = new Date(nextDeliveryDate);
      if (isNaN(deliveryDate.getTime())) {
        return NextResponse.json({ error: 'Invalid nextDeliveryDate' }, { status: 400 });
      }
      updateData.nextDeliveryDate = deliveryDate;
    }

    if (status !== undefined) {
      if (!USER_UPDATABLE_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. User can only set status to: ${USER_UPDATABLE_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    const subscription = await db.subscription.update({
      where: { id },
      data: updateData,
      include: {
        Product: { select: { id: true, name: true, slug: true, price: true, images: true } },
      },
    });

    return NextResponse.json({ subscription, message: 'Subscription updated successfully' });
  } catch (error) {
    logError(error, { category: 'api', context: 'User subscription PUT' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.subscription.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const subscription = await db.subscription.update({
      where: { id },
      data: { status: 'cancelled' },
      include: {
        Product: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ subscription, message: 'Subscription cancelled successfully' });
  } catch (error) {
    logError(error, { category: 'api', context: 'User subscription DELETE' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
