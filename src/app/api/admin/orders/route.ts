import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';

// GET /api/admin/orders - List all orders (admin only)
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
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { User: { name: { contains: search, mode: 'insensitive' } } },
        { User: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const scopedWhere = { ...where, ...(storeId ? { storeId } : {}) };

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where: scopedWhere,
        include: {
          User: {
            select: { id: true, name: true, email: true },
          },
          items: {
            select: {
              id: true, name: true, sku: true, price: true,
              quantity: true, total: true, images: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({ where: scopedWhere }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin Orders GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
