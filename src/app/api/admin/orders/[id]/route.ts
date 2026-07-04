import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getStoreId } from '@/lib/store-db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);

    const { id } = params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    const order = await db.order.update({
      where: { id, ...(storeId ? { storeId } : {}) },
      data: {
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Admin update order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
