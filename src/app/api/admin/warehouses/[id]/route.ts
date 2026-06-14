import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logError } from '@/lib/error-logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const storeId = getStoreId(request);
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    const warehouse = await db.warehouse.findFirst({
      where: {
        id,
        ...(storeId ? { storeId } : {}),
      },
      include: {
        Inventory: {
          include: {
            Product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
    });

    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    return NextResponse.json({ warehouse });
  } catch (error) {
    logError(error, { category: 'api', context: 'Admin Warehouse GET' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const storeId = getStoreId(request);
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    const existing = await db.warehouse.findFirst({
      where: {
        id,
        ...(storeId ? { storeId } : {}),
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, location, isActive } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
      }
      updateData.name = name.trim();
    }
    if (location !== undefined) updateData.location = location;
    if (isActive !== undefined) updateData.isActive = isActive;

    const warehouse = await db.warehouse.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ warehouse, message: 'Warehouse updated successfully' });
  } catch (error) {
    logError(error, { category: 'api', context: 'Admin Warehouse PUT' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const storeId = getStoreId(request);
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    const existing = await db.warehouse.findFirst({
      where: {
        id,
        ...(storeId ? { storeId } : {}),
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    const orderCount = await db.order.count({ where: { warehouseId: id } });
    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete warehouse with assigned orders' },
        { status: 400 },
      );
    }

    const inventoryCount = await db.inventory.count({ where: { warehouseId: id } });
    if (inventoryCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete warehouse with assigned inventory' },
        { status: 400 },
      );
    }

    await db.warehouse.delete({ where: { id } });

    return NextResponse.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    logError(error, { category: 'api', context: 'Admin Warehouse DELETE' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
