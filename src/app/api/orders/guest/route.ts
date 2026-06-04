import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${date}-${random}`;
}

// POST /api/orders/guest - Create order as guest (no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
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

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    if (!shippingEmail || !shippingName) {
      return NextResponse.json({ error: 'Name and email are required for guest checkout' }, { status: 400 });
    }

    // Validate and build order items
    const orderItems: Array<{
      productId: string;
      name: string;
      sku: string | null;
      price: number;
      quantity: number;
      total: number;
      images: string;
    }> = [];
    let subtotal = 0;

    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price) {
        return NextResponse.json(
          { error: 'Each item must have productId, quantity, and price' },
          { status: 400 }
        );
      }

      const product = await db.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true, name: true, sku: true, images: true,
          price: true, stock: true, isActive: true, deletedAt: true,
        },
      });

      if (!product || !product.isActive || product.deletedAt) {
        return NextResponse.json(
          { error: `Product "${item.productId}" not found or unavailable` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product.name}". Available: ${product.stock}` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: item.quantity,
        total: itemTotal,
        images: product.images,
      });
    }

    // Tax calculation
    const taxSettings = await db.siteSetting.findUnique({ where: { key: 'tax_rate' } });
    const taxRate = parseFloat(taxSettings?.value || '0');
    const tax = Math.round(subtotal * taxRate * 100) / 100;

    const total = subtotal + tax;

    // Check approval threshold
    const thresholdSetting = await db.siteSetting.findUnique({ where: { key: 'order_approval_threshold' } });
    const approvalThreshold = parseFloat(thresholdSetting?.value || '0');
    const requiresApproval = approvalThreshold > 0 && total >= approvalThreshold;

    // Create order in a transaction
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          status: requiresApproval ? 'pending_approval' : 'pending',
          paymentStatus: 'pending',
          paymentMethod: paymentMethod || null,
          subtotal,
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
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // Decrease stock
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      order,
      message: 'Order placed successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Guest Order POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
