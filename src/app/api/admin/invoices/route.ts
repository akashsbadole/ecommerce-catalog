import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { generateInvoiceNumber } from '@/lib/pdf-generator';

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { billingName: { contains: search, mode: 'insensitive' } },
        { User: { name: { contains: search, mode: 'insensitive' } } },
        { User: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const scopedWhere = { ...where, ...(storeId ? { storeId } : {}) };

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where: scopedWhere,
        include: {
          User: { select: { id: true, name: true, email: true } },
          Company: { select: { id: true, name: true } },
          Order: { select: { id: true, orderNumber: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.invoice.count({ where: scopedWhere }),
    ]);

    return NextResponse.json({
      invoices,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin Invoices GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const {
      orderId, userId, companyId, items,
      subtotal, shippingCost, discount, tax, taxRate, total,
      currency, gstNumber, gstType, notes,
      billingName, billingEmail, billingAddress, dueDate,
    } = body;

    if (!userId || !items?.length || subtotal === undefined || total === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, items, subtotal, total' },
        { status: 400 }
      );
    }

    const invoiceNumber = await generateInvoiceNumber();

    let invoiceData: Record<string, unknown> = {
      invoiceNumber,
      userId,
      companyId: companyId || null,
      subtotal,
      shippingCost: shippingCost || 0,
      discount: discount || 0,
      tax: tax || 0,
      taxRate: taxRate || 0,
      total,
      currency: currency || 'USD',
      gstNumber: gstNumber || null,
      gstType: gstType || null,
      notes: notes || null,
      billingName: billingName || null,
      billingEmail: billingEmail || null,
      billingAddress: billingAddress || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'sent',
      ...(storeId ? { storeId } : {}),
    };

    let invoiceItems = items;

    if (orderId) {
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      invoiceData.orderId = orderId;
      if (!invoiceData.billingName) invoiceData.billingName = order.billingName || order.shippingName;
      if (!invoiceData.billingEmail) invoiceData.billingEmail = order.billingEmail || order.shippingEmail;
      if (!invoiceData.billingAddress) invoiceData.billingAddress = order.billingAddress || order.shippingAddress;
      if (!invoiceData.gstNumber) invoiceData.gstNumber = order.gstNumber;
      if (!invoiceData.currency) invoiceData.currency = order.currency;

      if (!invoiceItems?.length) {
        invoiceItems = order.items.map((oi) => ({
          name: oi.name,
          sku: oi.sku,
          price: oi.price,
          quantity: oi.quantity,
          hsnCode: null,
          gstRate: 0,
          gstAmount: 0,
        }));
      }
    }

    const invoice = await db.invoice.create({
      data: {
        ...invoiceData as any,
        items: {
          create: invoiceItems.map((item: any) => ({
            name: item.name,
            sku: item.sku || null,
            hsnCode: item.hsnCode || null,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
            gstRate: item.gstRate || 0,
            gstAmount: item.gstAmount || ((item.gstRate || 0) * item.price * item.quantity) / 100,
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
    console.error('Admin Invoices POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
