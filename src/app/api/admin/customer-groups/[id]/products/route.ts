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
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Customer group not found' },
        { status: 404 },
      );
    }

    const visibilities = await db.productVisibility.findMany({
      where: { groupId: id, isVisible: true },
      include: {
        Product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            comparePrice: true,
            wholesalePrice: true,
            images: true,
            sku: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json({ products: visibilities });
  } catch (error) {
    console.error('Get customer group products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(
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
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Customer group not found' },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { productId, isVisible } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 },
      );
    }

    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 },
      );
    }

    const visibility = await db.productVisibility.upsert({
      where: {
        productId_groupId: {
          productId,
          groupId: id,
        },
      },
      update: {
        isVisible: isVisible !== undefined ? isVisible : true,
      },
      create: {
        productId,
        groupId: id,
        isVisible: isVisible !== undefined ? isVisible : true,
      },
    });

    return NextResponse.json({
      visibility,
      message: 'Product visibility updated successfully',
    });
  } catch (error) {
    console.error('Set product visibility error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
