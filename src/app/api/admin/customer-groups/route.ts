import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId, scopedWhere } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const scoped = scopedWhere(where, storeId);

    const groups = await db.customerGroup.findMany({
      where: scoped,
      include: {
        _count: { select: { members: true, products: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Get customer groups error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const body = await request.json();
    const { name, description, isActive } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 },
      );
    }

    const group = await db.customerGroup.create({
      data: {
        name: name.trim(),
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
        ...(storeId ? { storeId } : {}),
      },
    });

    return NextResponse.json(
      { group, message: 'Customer group created successfully' },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create customer group error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
