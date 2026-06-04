import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveUserId } from '@/lib/auth-helpers';

// GET /api/quotes/[id] - Get single quote details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const quote = await db.quote.findFirst({
      where: { id, userId },
      include: {
        items: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    return NextResponse.json({ quote });
  } catch (error) {
    console.error('Quote GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${date}-${random}`;
}

// PUT /api/quotes/[id] - Update quote (status change: sent, approved, rejected)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    const allowedStatuses = ['sent', 'approved', 'rejected'];
    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const quote = await db.quote.findFirst({
      where: { id, userId },
      include: { items: true },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (quote.status === 'converted') {
      return NextResponse.json(
        { error: 'Cannot modify a converted quote' },
        { status: 400 }
      );
    }

    if (status === 'approved') {
      // Auto-convert to order
      const order = await db.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            userId,
            orderNumber: generateOrderNumber(),
            status: 'pending',
            paymentStatus: 'pending',
            subtotal: quote.subtotal,
            tax: quote.tax,
            total: quote.total,
            currency: quote.currency,
            notes: quote.notes,
            items: {
              create: quote.items.map((item) => ({
                productId: item.productId,
                name: item.name,
                sku: item.sku,
                price: item.price,
                quantity: item.quantity,
                total: item.total,
                images: item.images,
              })),
            },
          },
        });

        // Mark quote as converted
        await tx.quote.update({
          where: { id },
          data: { status: 'converted' },
        });

        return newOrder;
      });

      return NextResponse.json({
        order,
        message: 'Quote approved and converted to order',
      });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const updatedQuote = await db.quote.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    return NextResponse.json({
      quote: updatedQuote,
      message: 'Quote updated successfully',
    });
  } catch (error) {
    console.error('Quote PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
