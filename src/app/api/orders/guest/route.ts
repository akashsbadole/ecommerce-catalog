import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getGlobalSetting, getSetting } from '@/lib/settings';
import { getStoreId } from '@/lib/store-db';
import { sendOrderConfirmationToCustomer, sendOrderNotificationToAdmin, getSiteSettings } from '@/lib/email';

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
          price: true, stock: true, isActive: true, deletedAt: true, minOrderQty: true,
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

      if (product.minOrderQty && item.quantity < product.minOrderQty) {
        return NextResponse.json(
          { error: `Minimum order quantity for "${product.name}" is ${product.minOrderQty}` },
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
    const taxRateValue = await getGlobalSetting('tax_rate');
    const taxRate = parseFloat(taxRateValue || '0');
    const tax = Math.round(subtotal * taxRate * 100) / 100;

    // Calculate shipping
    const storeId = getStoreId(request);
    const shippingMethod = await getSetting('shipping_method', storeId) || 'free';
    const shippingRate = parseFloat(await getSetting('shipping_rate', storeId) || '0');
    const shippingFreeAbove = parseFloat(await getSetting('shipping_free_above', storeId) || '0');

    let shippingCost = 0;
    if (shippingMethod === 'flat_rate') {
      shippingCost = shippingRate;
    } else if (shippingMethod === 'flat_rate_free_above') {
      shippingCost = (shippingFreeAbove > 0 && subtotal >= shippingFreeAbove) ? 0 : shippingRate;
    }

    const total = subtotal + shippingCost + tax;

    // Check approval threshold
    const thresholdValue = await getGlobalSetting('order_approval_threshold');
    const approvalThreshold = parseFloat(thresholdValue || '0');
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

    // Send emails (non-blocking)
    try {
      const emailSettings = await getSiteSettings();
      const siteName = emailSettings('site_name') || 'Store';
      if (shippingEmail) {
        sendOrderConfirmationToCustomer(order, order.items, siteName).catch(() => {});
      }
      sendOrderNotificationToAdmin(order, order.items, siteName).catch(() => {});
    } catch {
      // Email sending is non-critical
    }

    return NextResponse.json({
      order,
      message: 'Order placed successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Guest Order POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
