import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth-edge';

async function resolveUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);
  return payload?.userId ?? null;
}

function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${date}-${random}`;
}

// GET /api/orders - Get user's orders
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

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: {
            select: {
              id: true,
              name: true,
              price: true,
              quantity: true,
              total: true,
              images: true,
              sku: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/orders - Create order from cart (checkout)
export async function POST(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      shippingName,
      shippingEmail,
      shippingPhone,
      shippingAddress,
      billingName,
      billingEmail,
      billingAddress,
      paymentMethod,
      notes,
    } = body;

    // Get user's cart with items
    const cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            Product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                stock: true,
                sku: true,
                minOrderQty: true,
                isActive: true,
                deletedAt: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (!item.Product.isActive || item.Product.deletedAt) {
        return NextResponse.json(
          { error: `Product "${item.Product.name}" is no longer available` },
          { status: 400 }
        );
      }
      if (item.Product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${item.Product.name}". Available: ${item.Product.stock}` },
          { status: 400 }
        );
      }
      if (item.quantity < item.Product.minOrderQty) {
        return NextResponse.json(
          { error: `Minimum order quantity for "${item.Product.name}" is ${item.Product.minOrderQty}` },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + item.Product.price * item.quantity, 0);
    const shippingCost = 0; // Default to free shipping, can be configured
    const tax = 0; // Tax calculation can be added later
    const total = subtotal + shippingCost + tax;

    // Create order in a transaction
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderNumber: generateOrderNumber(),
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: paymentMethod || null,
          subtotal,
          shippingCost,
          tax,
          total,
          currency: 'USD',
          shippingName: shippingName || null,
          shippingEmail: shippingEmail || null,
          shippingPhone: shippingPhone || null,
          shippingAddress: shippingAddress || null,
          billingName: billingName || null,
          billingEmail: billingEmail || null,
          billingAddress: billingAddress || null,
          notes: notes || null,
          items: {
            create: cart.items.map((item) => ({
              productId: item.Product.id,
              variantId: item.variantId,
              name: item.Product.name,
              sku: item.Product.sku,
              price: item.Product.price,
              quantity: item.quantity,
              total: item.Product.price * item.quantity,
              images: item.Product.images,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Decrease stock for each item
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.Product.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear the cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return NextResponse.json({
      order,
      message: 'Order placed successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Order POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
