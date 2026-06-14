import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logError } from '@/lib/error-logger';

const VALID_FREQUENCIES = ['weekly', 'bi-weekly', 'monthly'];
const VALID_STATUSES = ['active', 'paused', 'cancelled'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    const subscription = await db.subscription.findUnique({
      where: { id },
      include: {
        User: { select: { id: true, name: true, email: true, phone: true } },
        Company: { select: { id: true, name: true } },
        Product: { select: { id: true, name: true, slug: true, price: true, images: true, description: true } },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    logError(error, { category: 'api', context: 'Admin subscription GET' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const body = await request.json();
    const { status, quantity, frequency, nextDeliveryDate } = body;

    const existing = await db.subscription.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

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

    const subscription = await db.subscription.update({
      where: { id },
      data: updateData,
      include: {
        User: { select: { id: true, name: true, email: true } },
        Company: { select: { id: true, name: true } },
        Product: { select: { id: true, name: true, slug: true, price: true, images: true } },
      },
    });

    return NextResponse.json({ subscription, message: 'Subscription updated successfully' });
  } catch (error) {
    logError(error, { category: 'api', context: 'Admin subscription PUT' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    const existing = await db.subscription.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    await db.subscription.delete({ where: { id } });

    return NextResponse.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    logError(error, { category: 'api', context: 'Admin subscription DELETE' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
