import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, getSiteSettings } from '@/lib/email';
import { requireAdminAuth } from '@/lib/admin-auth';

// GET /api/admin/cart-abandonment - List abandoned carts (admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '24');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Find carts that haven't been updated in X hours and have items
    const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    const where = {
      updatedAt: { lt: cutoffDate },
      items: { some: {} },
    };

    const [carts, total] = await Promise.all([
      db.cart.findMany({
        where,
        include: {
          User: {
            select: { id: true, name: true, email: true },
          },
          items: {
            include: {
              Product: {
                select: { id: true, name: true, price: true, images: true },
              },
            },
          },
        },
        orderBy: { updatedAt: 'asc' },
        skip,
        take: limit,
      }),
      db.cart.count({ where }),
    ]);

    // Calculate cart totals
    const cartsWithTotal = carts.map((cart) => ({
      id: cart.id,
      userId: cart.userId,
      user: cart.User,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      total: cart.items.reduce((sum, item) => sum + (item.Product?.price || 0) * item.quantity, 0),
      items: cart.items.map((item) => ({
        id: item.id,
        name: item.Product?.name || 'Unknown',
        price: item.Product?.price || 0,
        quantity: item.quantity,
      })),
      lastUpdated: cart.updatedAt,
      hoursAgo: Math.round((Date.now() - new Date(cart.updatedAt).getTime()) / (1000 * 60 * 60)),
    }));

    return NextResponse.json({
      carts: cartsWithTotal,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalAbandoned: total,
        totalValue: cartsWithTotal.reduce((sum, c) => sum + c.total, 0),
      },
    });
  } catch (error) {
    console.error('Cart Abandonment GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { cartIds } = body;

    if (!cartIds || !Array.isArray(cartIds) || cartIds.length === 0) {
      return NextResponse.json({ error: 'No carts selected' }, { status: 400 });
    }

    const carts = await db.cart.findMany({
      where: { id: { in: cartIds } },
      include: {
        User: { select: { email: true, name: true } },
        items: { include: { Product: true } },
      },
    });

    let sent = 0;
    for (const cart of carts) {
      const email = cart.User?.email;
      if (!email) continue;
      try {
        const getSetting = await getSiteSettings();
        const siteName = getSetting('site_name') || 'My Store';
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        await sendEmail(
          email,
          `You left items in your cart at ${siteName}`,
          `<p>Hi ${cart.User?.name || 'there'},</p>
<p>You left some items in your cart. Complete your purchase before they're gone!</p>
<p><a href="${siteUrl}/cart">Return to Cart</a></p>`
        );
        sent++;
      } catch {
        // continue with next cart
      }
    }

    return NextResponse.json({ sent });
  } catch (error) {
    console.error('Cart recovery error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
