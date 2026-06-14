import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logError } from '@/lib/error-logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    const price = await db.customPrice.findUnique({
      where: { id },
      include: {
        Company: { select: { id: true, name: true, tier: true } },
        Product: { select: { id: true, name: true, sku: true, price: true } },
      },
    });

    if (!price) {
      return NextResponse.json({ error: 'Custom price not found' }, { status: 404 });
    }

    return NextResponse.json({ price });
  } catch (error) {
    logError(error, { category: 'api', context: 'Admin Price List GET' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const body = await request.json();
    const { price } = body;

    if (price === undefined || typeof price !== 'number' || price < 0) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
    }

    const existing = await db.customPrice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Custom price not found' }, { status: 404 });
    }

    const updated = await db.customPrice.update({
      where: { id },
      data: { price },
      include: {
        Company: { select: { id: true, name: true } },
        Product: { select: { id: true, name: true, sku: true } },
      },
    });

    return NextResponse.json({ price: updated, message: 'Custom price updated successfully' });
  } catch (error) {
    logError(error, { category: 'api', context: 'Admin Price List PUT' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    const existing = await db.customPrice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Custom price not found' }, { status: 404 });
    }

    await db.customPrice.delete({ where: { id } });

    return NextResponse.json({ message: 'Custom price deleted successfully' });
  } catch (error) {
    logError(error, { category: 'api', context: 'Admin Price List DELETE' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
