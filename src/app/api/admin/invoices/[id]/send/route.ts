import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { sendInvoiceEmail } from '@/lib/invoice-email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (!invoice.billingEmail) {
      return NextResponse.json(
        { error: 'Invoice has no billing email address' },
        { status: 400 }
      );
    }

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

    const sent = await sendInvoiceEmail(invoiceWithItems);

    if (sent) {
      await db.invoice.update({
        where: { id },
        data: { status: 'sent' },
      });
    }

    return NextResponse.json({
      sent,
      message: sent ? 'Invoice sent successfully' : 'Failed to send invoice',
    });
  } catch (error) {
    console.error('Admin Invoice Send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
