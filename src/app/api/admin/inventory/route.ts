import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logError } from '@/lib/error-logger';

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (productId) where.productId = productId;

    const [inventory, total] = await Promise.all([
      db.inventory.findMany({
        where,
        include: {
          Product: {
            select: { id: true, name: true, sku: true, images: true },
          },
          Warehouse: {
            select: { id: true, name: true, location: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.inventory.count({ where }),
    ]);

    return NextResponse.json({
      inventory,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logError(error, { category: 'api', context: 'Admin Inventory GET' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { productId, variantId, warehouseId, stock } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    if (!warehouseId) {
      return NextResponse.json({ error: 'Warehouse ID is required' }, { status: 400 });
    }
    if (stock === undefined || typeof stock !== 'number') {
      return NextResponse.json({ error: 'Stock must be a number' }, { status: 400 });
    }

    if (storeId) {
      const warehouse = await db.warehouse.findFirst({
        where: { id: warehouseId, storeId },
      });
      if (!warehouse) {
        return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
      }
    }

    const inventory = await db.inventory.upsert({
      where: {
        productId_variantId_warehouseId: {
          productId,
          variantId: variantId || '',
          warehouseId,
        },
      },
      update: { stock },
      create: {
        productId,
        variantId: variantId || undefined,
        warehouseId,
        stock,
      },
      include: {
        Product: {
          select: { id: true, name: true, sku: true },
        },
        Warehouse: {
          select: { id: true, name: true },
        },
      },
    });

    const isNew = stock === body.stock && !body.isUpdate;
    return NextResponse.json(
      { inventory, message: inventory.updatedAt ? 'Inventory updated successfully' : 'Inventory created successfully' },
      { status: 201 },
    );
  } catch (error) {
    logError(error, { category: 'api', context: 'Admin Inventory POST' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
