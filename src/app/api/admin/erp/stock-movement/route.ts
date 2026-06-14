import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      Product: {
        isActive: true,
        deletedAt: null,
      },
    };

    if (productId) {
      where.productId = productId;
    }

    const [inventoryItems, total] = await Promise.all([
      db.inventory.findMany({
        where,
        include: {
          Product: {
            select: {
              id: true,
              name: true,
              sku: true,
              stock: true,
              lowStockThreshold: true,
            },
          },
          Warehouse: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.inventory.count({ where }),
    ]);

    const items = inventoryItems
      .filter((item) => item.Product !== null)
      .map((item) => ({
        productId: item.Product!.id,
        productName: item.Product!.name,
        productSku: item.Product!.sku,
        currentStock: item.stock,
        lowStockThreshold: item.Product!.lowStockThreshold,
        warehouse: item.Warehouse
          ? {
              id: item.Warehouse.id,
              name: item.Warehouse.name,
              location: item.Warehouse.location,
            }
          : null,
        lastUpdated: item.updatedAt.toISOString(),
      }));

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('ERP Stock Movement GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
