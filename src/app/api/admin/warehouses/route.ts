import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId, scopedWhere, scopedCreateData } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logError } from '@/lib/error-logger';

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const scoped = scopedWhere(where, storeId);

    const [warehouses, total] = await Promise.all([
      db.warehouse.findMany({
        where: scoped,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.warehouse.count({ where: scoped }),
    ]);

    return NextResponse.json({
      warehouses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logError(error, { category: 'api', context: 'Admin Warehouses GET' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { name, location, isActive } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const data = scopedCreateData(
      {
        name: name.trim(),
        location: location || null,
        isActive: isActive !== undefined ? isActive : true,
      },
      storeId,
    );

    const warehouse = await db.warehouse.create({ data: data as any });

    return NextResponse.json({ warehouse, message: 'Warehouse created successfully' }, { status: 201 });
  } catch (error) {
    logError(error, { category: 'api', context: 'Admin Warehouses POST' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
