import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, getSiteSettings } from '@/lib/email';
import { logError } from '@/lib/error-logger';

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

    const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const quotes = await db.quote.findMany({
      where: {
        status: { in: ['draft', 'sent'] },
        createdAt: { lt: cutoffDate },
        recoveryEmailSent: false,
      },
      include: {
        User: { select: { id: true, name: true, email: true } },
        Company: { select: { id: true, name: true } },
      },
      take: 30,
      orderBy: { createdAt: 'asc' },
    });

    if (quotes.length === 0) {
      return NextResponse.json({ message: 'No abandoned quotes found', processed: 0 });
    }

    const emailSettings = await getSiteSettings();
    const siteName = emailSettings('site_name') || 'My Store';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const quote of quotes) {
      const email = quote.User?.email;
      if (!email) {
        skipped++;
        await db.quote.update({
          where: { id: quote.id },
          data: { recoveryEmailSent: true },
        });
        continue;
      }

      const companyName = quote.Company?.name || '';
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #059669;">Your Quote is Still Available</h1>
          <p>Hi ${quote.User?.name || 'there'},</p>
          <p>We noticed you haven't responded to your quote from ${siteName}.</p>
          ${companyName ? `<p><strong>Company:</strong> ${companyName}</p>` : ''}
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: 600;">Quote #${quote.quoteNumber}</p>
            <p style="margin: 8px 0 0 0; color: #374151;">Status: ${quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}</p>
            <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: 700; color: #059669;">Total: ${quote.currency} ${quote.total.toFixed(2)}</p>
          </div>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${siteUrl}/portal/quotes/${quote.id}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">View Your Quote</a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">If you have any questions, feel free to reply to this email or contact our team.</p>
        </div>
      `;

      try {
        const success = await sendEmail(
          email,
          `Your quote from ${siteName} is still available - #${quote.quoteNumber}`,
          html,
        );

        await db.quote.update({
          where: { id: quote.id },
          data: { recoveryEmailSent: true },
        });

        if (success) {
          sent++;
        } else {
          failed++;
        }
      } catch (err) {
        logError(err, { category: 'email', context: `Quote abandonment recovery for quote ${quote.id}` });
        failed++;
      }
    }

    console.log(
      `Quote abandonment cron: ${sent} sent, ${failed} failed, ${skipped} skipped, ${quotes.length} total`,
    );

    return NextResponse.json({
      message: 'Quote abandonment recovery completed',
      sent,
      failed,
      skipped,
      total: quotes.length,
    });
  } catch (error) {
    logError(error, { category: 'api', context: 'Cron quote-abandonment GET' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
