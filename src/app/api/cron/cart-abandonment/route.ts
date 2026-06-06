import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, getSiteSettings } from '@/lib/email';
import { logError } from '@/lib/error-logger';

/**
 * Cron endpoint for automated cart abandonment recovery.
 * 
 * Protected by CRON_SECRET to prevent unauthorized access.
 * Run via Vercel cron (vercel.json) or external scheduler.
 * 
 * Finds carts inactive for >24 hours with items, sends recovery emails.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret) {
      return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find carts inactive for 24+ hours with items
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const abandonedCarts = await db.cart.findMany({
      where: {
        updatedAt: { lt: cutoffDate },
        items: { some: {} },
      },
      include: {
        User: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            Product: { select: { id: true, name: true, price: true } },
          },
        },
      },
      orderBy: { updatedAt: 'asc' },
      take: 50, // Process up to 50 carts per run
    });

    if (abandonedCarts.length === 0) {
      return NextResponse.json({ message: 'No abandoned carts found', sent: 0 });
    }

    const emailSettings = await getSiteSettings();
    const siteName = emailSettings('site_name') || 'My Store';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    let sent = 0;
    let failed = 0;

    for (const cart of abandonedCarts) {
      const email = cart.User?.email;
      if (!email) {
        failed++;
        continue;
      }

      const cartTotal = cart.items.reduce(
        (sum, item) => sum + (item.Product?.price || 0) * item.quantity, 0
      );
      const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      const itemNames = cart.items
        .slice(0, 3)
        .map((item) => item.Product?.name || 'Unknown')
        .join(', ');
      const moreItems = cart.items.length > 3 ? ` and ${cart.items.length - 3} more` : '';

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #059669;">You left items in your cart</h1>
          <p>Hi ${cart.User?.name || 'there'},</p>
          <p>We noticed you left some items in your cart at ${siteName}. Don't miss out!</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: 600;">Cart Summary</p>
            <p style="margin: 8px 0 0 0; color: #374151;">${itemNames}${moreItems}</p>
            <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: 700; color: #059669;">Total: ${cartTotal.toFixed(2)}</p>
          </div>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${siteUrl}/cart" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Complete Your Purchase</a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">Your cart items are saved and waiting for you.</p>
        </div>
      `;

      try {
        const success = await sendEmail(email, `You left items in your cart at ${siteName}`, html);
        if (success) {
          sent++;
        } else {
          failed++;
        }
      } catch (err) {
        logError(err, { category: 'email', context: 'Cart abandonment recovery' });
        failed++;
      }
    }

    console.log(`Cart abandonment cron: ${sent} sent, ${failed} failed, ${abandonedCarts.length} total`);

    return NextResponse.json({
      message: 'Cart abandonment recovery completed',
      sent,
      failed,
      total: abandonedCarts.length,
    });
  } catch (error) {
    console.error('Cart abandonment cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
