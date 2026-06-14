import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Verify bundle exists
    const bundle = await db.productBundle.findUnique({ where: { id } });
    if (!bundle) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      );
    }

    // Verify product exists
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product is already in the bundle
    const existingItem = await db.productBundleItem.findUnique({
      where: { bundleId_productId: { bundleId: id, productId } },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: 'This product is already in the bundle' },
        { status: 409 }
      );
    }

    const item = await db.productBundleItem.create({
      data: {
        bundleId: id,
        productId,
        quantity: quantity ?? 1,
      },
      include: {
        Product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Add bundle item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const productId = searchParams.get('productId');

    // Verify bundle exists
    const bundle = await db.productBundle.findUnique({ where: { id } });
    if (!bundle) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      );
    }

    if (itemId) {
      // Delete by item ID
      const existingItem = await db.productBundleItem.findUnique({ where: { id: itemId } });
      if (!existingItem || existingItem.bundleId !== id) {
        return NextResponse.json(
          { error: 'Bundle item not found' },
          { status: 404 }
        );
      }

      await db.productBundleItem.delete({ where: { id: itemId } });
      return NextResponse.json({ message: 'Item removed from bundle' });
    }

    if (productId) {
      // Delete by product ID
      const existingItem = await db.productBundleItem.findUnique({
        where: { bundleId_productId: { bundleId: id, productId } },
      });
      if (!existingItem) {
        return NextResponse.json(
          { error: 'Product not found in this bundle' },
          { status: 404 }
        );
      }

      await db.productBundleItem.delete({
        where: { bundleId_productId: { bundleId: id, productId } },
      });
      return NextResponse.json({ message: 'Item removed from bundle' });
    }

    return NextResponse.json(
      { error: 'itemId or productId query parameter is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Remove bundle item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
