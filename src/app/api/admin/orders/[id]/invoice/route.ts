import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { generateInvoiceNumber } from '@/lib/pdf-generator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const storeId = getStoreId(request);
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: true,
        User: { select: { id: true, companyId: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const existingInvoice = await db.invoice.findFirst({
      where: { orderId: id },
    });

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice already exists for this order', invoice: existingInvoice },
        { status: 409 }
      );
    }

    const company = order.User?.companyId
      ? await db.company.findUnique({ where: { id: order.User.companyId } })
      : null;

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        storeId: storeId || order.storeId,
        orderId: order.id,
        userId: order.userId,
        companyId: order.User?.companyId || null,
        status: 'sent',
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        discount: 0,
        tax: order.tax,
        taxRate: 0,
        total: order.total,
        currency: order.currency,
        gstNumber: order.gstNumber || company?.gstNumber || null,
        gstType: order.gstNumber ? 'intra' : null,
        billingName: order.billingName || order.shippingName,
        billingEmail: order.billingEmail || order.shippingEmail,
        billingAddress: order.billingAddress || order.shippingAddress,
        companyName: company?.name || null,
        companyAddress: company?.address || null,
        companyTaxId: company?.taxId || null,
        items: {
          create: order.items.map((oi) => ({
            name: oi.name,
            sku: oi.sku,
            price: oi.price,
            quantity: oi.quantity,
            total: oi.total,
            hsnCode: null,
            gstRate: 0,
            gstAmount: 0,
          })),
        },
      },
      include: {
        User: { select: { id: true, name: true, email: true } },
        items: true,
      },
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error('Order Invoice POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
