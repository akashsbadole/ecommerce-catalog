import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateInvoiceHtml } from '@/lib/pdf-generator';
import { getSiteSettings } from '@/lib/email';
import { resolveUserId } from '@/lib/auth-helpers';

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

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const isOwner = invoice.userId === userId;
    const isCompanyInvoice = user?.companyId && invoice.companyId === user.companyId;

    if (!isOwner && !isCompanyInvoice) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const getSetting = await getSiteSettings();
    const siteName = getSetting('site_name') || 'Store';
    const siteLogo = getSetting('site_logo') || '';

    const invoiceWithItems = {
      ...invoice,
      createdAt: invoice.createdAt.toISOString(),
      dueDate: invoice.dueDate?.toISOString() || null,
      paidAt: invoice.paidAt?.toISOString() || null,
      items: invoice.items.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        hsnCode: item.hsnCode,
        price: item.price,
        quantity: item.quantity,
        total: item.total,
        gstRate: item.gstRate,
        gstAmount: item.gstAmount,
      })),
    };

    const html = generateInvoiceHtml(invoiceWithItems, siteName, siteLogo);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.html"`,
      },
    });
  } catch (error) {
    console.error('Invoice PDF GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
