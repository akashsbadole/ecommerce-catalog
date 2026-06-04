import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveUserId } from '@/lib/auth-helpers';
import { sendOrderConfirmationToCustomer, sendOrderNotificationToAdmin, getSiteSettings } from '@/lib/email';
import { getGlobalSetting, getSetting } from '@/lib/settings';
import { getStoreId } from '@/lib/store-db';

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
      couponCode,
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

    // Calculate shipping from site settings
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

    // Tax calculation from site settings
    const taxRateValue = await getGlobalSetting('tax_rate');
    const taxRate = parseFloat(taxRateValue || '0');
    const tax = Math.round(subtotal * taxRate * 100) / 100;

    // Coupon discount
    let discount = 0;
    let appliedCouponId: string | null = null;
    if (couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon && coupon.isActive) {
        const now = new Date();
        const valid = (!coupon.startsAt || now >= coupon.startsAt) &&
          (!coupon.expiresAt || now <= coupon.expiresAt) &&
          subtotal >= coupon.minOrder &&
          (coupon.maxUses === null || coupon.usedCount < coupon.maxUses);
        if (valid) {
          discount = coupon.type === 'percentage'
            ? Math.round(subtotal * coupon.value) / 100
            : Math.min(coupon.value, subtotal);
          discount = Math.round(discount * 100) / 100;
          appliedCouponId = coupon.id;
        }
      }
    }

    const total = subtotal + shippingCost + tax - discount;

    // Check approval threshold
    const thresholdValue = await getGlobalSetting('order_approval_threshold');
    const approvalThreshold = parseFloat(thresholdValue || '0');
    const requiresApproval = approvalThreshold > 0 && total >= approvalThreshold;

    // Create order in a transaction
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
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

      // Increment coupon usage
      if (appliedCouponId) {
        await tx.coupon.update({
          where: { id: appliedCouponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Clear the cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    // Send order emails (non-blocking)
    const emailSettings = await getSiteSettings();
    const siteName = emailSettings('site_name') || 'Store';
    sendOrderConfirmationToCustomer(order, order.items, siteName).catch(() => {});
    sendOrderNotificationToAdmin(order, order.items, siteName).catch(() => {});

    return NextResponse.json({
      order,
      message: 'Order placed successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Order POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
