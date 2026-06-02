import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await db.category.findUnique({
      where: { id },
    });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ category });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check slug uniqueness if slug is being updated
    if (body.slug !== undefined && body.slug !== existing.slug) {
      const slugExists = await db.category.findFirst({
        where: { slug: body.slug, NOT: { id } },
      });
      if (slugExists) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
      }
    }

    const category = await db.category.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.metaTitle !== undefined && {
          metaTitle: body.metaTitle || null,
        }),
        ...(body.metaDescription !== undefined && {
          metaDescription: body.metaDescription || null,
        }),
        ...(body.customSchema !== undefined && {
          customSchema: body.customSchema || null,
        }),
        ...(body.parentId !== undefined && {
          parentId: body.parentId || null,
        }),
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Update category error:', error);
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
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has products
    const productCount = await db.product.count({
      where: { categoryId: id, deletedAt: null },
    });

    if (permanent) {
      // Only allow permanent delete if no active products
      if (productCount > 0) {
        return NextResponse.json(
          { error: `Cannot permanently delete category with ${productCount} active products. Remove or reassign products first.` },
          { status: 400 }
        );
      }
      await db.category.delete({ where: { id } });
      return NextResponse.json({ message: 'Category permanently deleted' });
    }

    // Soft delete - just mark as inactive (Category model doesn't have deletedAt)
    // Since Category doesn't have soft delete, we'll deactivate it
    await db.category.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      message: 'Category deactivated successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
