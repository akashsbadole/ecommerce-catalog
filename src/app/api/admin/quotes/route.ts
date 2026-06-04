import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth-edge';
import { getStoreId } from '@/lib/store-db';

// GET /api/admin/quotes - List all quotes (admin only)
export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { quoteNumber: { contains: search, mode: 'insensitive' } },
        { User: { name: { contains: search, mode: 'insensitive' } } },
        { User: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const scopedWhere = { ...where, ...(storeId ? { storeId } : {}) };

    const [quotes, total] = await Promise.all([
      db.quote.findMany({
        where: scopedWhere,
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            select: {
              id: true,
              productId: true,
              name: true,
              sku: true,
              price: true,
              quantity: true,
              total: true,
              images: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.quote.count({ where: scopedWhere }),
    ]);

    return NextResponse.json({
      quotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin Quotes GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
