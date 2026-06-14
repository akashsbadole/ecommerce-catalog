import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logError } from '@/lib/error-logger';

function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${date}-${random}`;
}

export async function POST(
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
    const { createOrder } = body;

    const subscription = await db.subscription.findFirst({
      where: { id, userId, status: 'active' },
      include: {
        Product: {
          select: {
            id: true, name: true, slug: true, price: true,
            images: true, sku: true, stock: true, isActive: true,
            deletedAt: true, minOrderQty: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Active subscription not found' }, { status: 404 });
    }

    if (!subscription.Product.isActive || subscription.Product.deletedAt) {
      return NextResponse.json(
        { error: 'Product is no longer available' },
        { status: 400 }
      );
    }

    if (subscription.Product.stock < subscription.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for "${subscription.Product.name}". Available: ${subscription.Product.stock}` },
        { status: 400 }
      );
    }

    if (subscription.quantity < subscription.Product.minOrderQty) {
      return NextResponse.json(
        { error: `Minimum order quantity for "${subscription.Product.name}" is ${subscription.Product.minOrderQty}` },
        { status: 400 }
      );
    }

    if (createOrder) {
      const total = subscription.Product.price * subscription.quantity;

      const order = await db.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            userId,
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
          include: { items: true },
        });

        await tx.product.update({
          where: { id: subscription.Product.id },
          data: { stock: { decrement: subscription.quantity } },
        });

        return newOrder;
      });

      return NextResponse.json({
        orderId: order.id,
        orderNumber: order.orderNumber,
        message: 'Order created from subscription',
      }, { status: 201 });
    }

    const cart = await db.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const existingItem = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: subscription.Product.id,
        variantId: null,
      },
    });

    if (existingItem) {
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + subscription.quantity },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId: subscription.Product.id,
          quantity: subscription.quantity,
        },
      });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    return NextResponse.json({
      cartUrl: `${siteUrl}/cart`,
      message: 'Items added to cart successfully',
    });
  } catch (error) {
    logError(error, { category: 'api', context: 'Subscription reorder POST' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
