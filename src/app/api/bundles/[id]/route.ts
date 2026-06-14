import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const bundle = await db.productBundle.findUnique({
      where: { id },
      include: {
        items: {
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
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!bundle) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ bundle });
  } catch (error) {
    console.error('Get bundle error:', error);
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
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const body = await request.json();

    const existing = await db.productBundle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      );
    }

    // Check slug uniqueness if slug is being changed
    if (body.slug !== undefined && body.slug !== existing.slug) {
      const slugExists = await db.productBundle.findFirst({
        where: { slug: body.slug, NOT: { id: existing.id } },
      });
      if (slugExists) {
        return NextResponse.json({ error: 'A bundle with this slug already exists' }, { status: 409 });
      }
    }

    const bundle = await db.productBundle.update({
      where: { id: existing.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && {
          slug: body.slug.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, ''),
        }),
        ...(body.description !== undefined && { description: body.description || null }),
        ...(body.discountPercent !== undefined && { discountPercent: parseFloat(body.discountPercent) }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
      include: {
        items: {
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
        },
      },
    });

    return NextResponse.json({ bundle });
  } catch (error) {
    console.error('Update bundle error:', error);
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

    const existing = await db.productBundle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      );
    }

    // Items are deleted via cascade (onDelete: Cascade in ProductBundleItem)
    await db.productBundle.delete({ where: { id } });

    return NextResponse.json({
      message: 'Bundle deleted successfully',
    });
  } catch (error) {
    console.error('Delete bundle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
