import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.shortDescription !== undefined && {
          shortDescription: body.shortDescription,
        }),
        ...(body.price !== undefined && {
          price: parseFloat(body.price),
        }),
        ...(body.comparePrice !== undefined && {
          comparePrice: body.comparePrice
            ? parseFloat(body.comparePrice)
            : null,
        }),
        ...(body.wholesalePrice !== undefined && {
          wholesalePrice: body.wholesalePrice
            ? parseFloat(body.wholesalePrice)
            : null,
        }),
        ...(body.minOrderQty !== undefined && {
          minOrderQty: body.minOrderQty,
        }),
        ...(body.sku !== undefined && { sku: body.sku }),
        ...(body.images !== undefined && {
          images:
            typeof body.images === 'string'
              ? body.images
              : JSON.stringify(body.images),
        }),
        ...(body.categoryId !== undefined && {
          categoryId: body.categoryId || null,
        }),
        ...(body.isFeatured !== undefined && {
          isFeatured: body.isFeatured,
        }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.specifications !== undefined && {
          specifications: body.specifications
            ? typeof body.specifications === 'string'
              ? body.specifications
              : JSON.stringify(body.specifications)
            : null,
        }),
        ...(body.metaTitle !== undefined && {
          metaTitle: body.metaTitle || null,
        }),
        ...(body.metaDescription !== undefined && {
          metaDescription: body.metaDescription || null,
        }),
      },
      include: { category: true },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await db.product.delete({ where: { id } });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
