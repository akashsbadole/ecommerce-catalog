import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { id } = await params;

    const group = await db.customerGroup.findFirst({
      where: {
        id,
        ...(storeId ? { storeId } : {}),
      },
      include: {
        members: {
          include: {
            User: { select: { id: true, name: true, email: true } },
            Company: { select: { id: true, name: true } },
          },
        },
        products: {
          include: {
            Product: { select: { id: true, name: true, slug: true, price: true, images: true } },
          },
        },
        _count: { select: { members: true, products: true } },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Customer group not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ group });
  } catch (error) {
    console.error('Get customer group error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { id } = await params;

    const existing = await db.customerGroup.findFirst({
      where: {
        id,
        ...(storeId ? { storeId } : {}),
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Customer group not found' },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { name, description, isActive } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name cannot be empty' },
          { status: 400 },
        );
      }
      updateData.name = name.trim();
    }
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const group = await db.customerGroup.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      group,
      message: 'Customer group updated successfully',
    });
  } catch (error) {
    console.error('Update customer group error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { id } = await params;

    const existing = await db.customerGroup.findFirst({
      where: {
        id,
        ...(storeId ? { storeId } : {}),
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Customer group not found' },
        { status: 404 },
      );
    }

    await db.customerGroup.delete({ where: { id } });

    return NextResponse.json({
      message: 'Customer group deleted successfully',
    });
  } catch (error) {
    console.error('Delete customer group error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
