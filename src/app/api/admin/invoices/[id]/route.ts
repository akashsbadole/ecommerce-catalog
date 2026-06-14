import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        User: { select: { id: true, name: true, email: true } },
        Company: true,
        Order: { select: { id: true, orderNumber: true, status: true } },
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Admin Invoice GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const body = await request.json();

    const existing = await db.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const {
      items, subtotal, shippingCost, discount, tax, taxRate, total,
      currency, gstNumber, gstType, notes,
      billingName, billingEmail, billingAddress,
      companyName, companyAddress, companyTaxId,
      dueDate, status, paidAt,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (subtotal !== undefined) updateData.subtotal = subtotal;
    if (shippingCost !== undefined) updateData.shippingCost = shippingCost;
    if (discount !== undefined) updateData.discount = discount;
    if (tax !== undefined) updateData.tax = tax;
    if (taxRate !== undefined) updateData.taxRate = taxRate;
    if (total !== undefined) updateData.total = total;
    if (currency !== undefined) updateData.currency = currency;
    if (gstNumber !== undefined) updateData.gstNumber = gstNumber;
    if (gstType !== undefined) updateData.gstType = gstType;
    if (notes !== undefined) updateData.notes = notes;
    if (billingName !== undefined) updateData.billingName = billingName;
    if (billingEmail !== undefined) updateData.billingEmail = billingEmail;
    if (billingAddress !== undefined) updateData.billingAddress = billingAddress;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (companyAddress !== undefined) updateData.companyAddress = companyAddress;
    if (companyTaxId !== undefined) updateData.companyTaxId = companyTaxId;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (status !== undefined) updateData.status = status;
    if (paidAt !== undefined) updateData.paidAt = paidAt ? new Date(paidAt) : null;

    if (items && items.length) {
      await db.invoiceItem.deleteMany({ where: { invoiceId: id } });

      await db.invoiceItem.createMany({
        data: items.map((item: any) => ({
          invoiceId: id,
          name: item.name,
          sku: item.sku || null,
          hsnCode: item.hsnCode || null,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
          gstRate: item.gstRate || 0,
          gstAmount: item.gstAmount || ((item.gstRate || 0) * item.price * item.quantity) / 100,
        })),
      });
    }

    const invoice = await db.invoice.update({
      where: { id },
      data: updateData,
      include: {
        User: { select: { id: true, name: true, email: true } },
        Company: true,
        Order: { select: { id: true, orderNumber: true } },
        items: true,
      },
    });

    return NextResponse.json({ invoice, message: 'Invoice updated successfully' });
  } catch (error) {
    console.error('Admin Invoice PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    const existing = await db.invoice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    await db.invoice.delete({ where: { id } });

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Admin Invoice DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
