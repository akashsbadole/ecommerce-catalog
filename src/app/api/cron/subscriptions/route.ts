import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logError } from '@/lib/error-logger';

function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${date}-${random}`;
}

function calculateNextDeliveryDate(currentDate: Date, frequency: string): Date {
  const next = new Date(currentDate);
  switch (frequency) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'bi-weekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
    default:
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    const subscriptions = await db.subscription.findMany({
      where: {
        status: 'active',
        nextDeliveryDate: { lte: now },
      },
      include: {
        User: { select: { id: true, name: true, email: true } },
        Product: {
          select: {
            id: true, name: true, slug: true, price: true,
            sku: true, stock: true, isActive: true, deletedAt: true,
            images: true,
          },
        },
      },
      take: 20,
      orderBy: { nextDeliveryDate: 'asc' },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscriptions due for delivery', processed: 0 });
    }

    let processed = 0;
    let skipped = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      if (!subscription.Product.isActive || subscription.Product.deletedAt) {
        skipped++;
        await db.subscription.update({
          where: { id: subscription.id },
          data: { status: 'paused' },
        });
        continue;
      }

      if (subscription.Product.stock < subscription.quantity) {
        skipped++;
        continue;
      }

      try {
        await db.$transaction(async (tx) => {
          const total = subscription.Product.price * subscription.quantity;

          await tx.order.create({
            data: {
              userId: subscription.userId,
              orderNumber: generateOrderNumber(),
              status: 'pending',
              paymentStatus: 'pending',
              subtotal: total,
              shippingCost: 0,
              tax: 0,
              total,
              items: {
                create: {
                  productId: subscription.Product.id,
                  name: subscription.Product.name,
                  sku: subscription.Product.sku,
                  price: subscription.Product.price,
                  quantity: subscription.quantity,
                  total,
                  images: subscription.Product.images,
                },
              },
            },
          });

          await tx.product.update({
            where: { id: subscription.Product.id },
            data: { stock: { decrement: subscription.quantity } },
          });

          await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              nextDeliveryDate: calculateNextDeliveryDate(
                subscription.nextDeliveryDate,
                subscription.frequency,
              ),
            },
          });
        });

        processed++;
      } catch (err) {
        logError(err, {
          category: 'db',
          context: `Cron subscription order creation for subscription ${subscription.id}`,
        });
        failed++;
      }
    }

    console.log(
      `Subscription cron: ${processed} processed, ${skipped} skipped, ${failed} failed, ${subscriptions.length} total`,
    );

    return NextResponse.json({
      message: 'Subscription orders processed',
      processed,
      skipped,
      failed,
      total: subscriptions.length,
    });
  } catch (error) {
    logError(error, { category: 'api', context: 'Cron subscriptions GET' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
