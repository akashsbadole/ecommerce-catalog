import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';
import { productSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const featured = searchParams.get('featured');
    const ids = searchParams.get('ids');
    const trashed = searchParams.get('trashed');

    const all = searchParams.get('all');
    const where: Record<string, unknown> = {};

    // Handle trashed filtering
    if (trashed === 'true') {
      where.deletedAt = { not: null };
    } else if (all !== 'true' || trashed === 'false') {
      where.deletedAt = null;
    }

    if (!all && trashed !== 'true') {
      where.isActive = true;
    }

    if (search) {
      where.name = { contains: search };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (featured !== null && featured !== undefined) {
      where.isFeatured = featured === 'true';
    }

    // Handle fetching specific products by IDs
    if (ids) {
      const idList = ids.split(',').filter(Boolean);
      if (idList.length > 0) {
        where.id = { in: idList };
      }
    }

    const products = await db.product.findMany({
      where,
      include: { category: true },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = productSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const validatedData = result.data;

    // Check slug uniqueness
    const existingSlug = await db.product.findUnique({ where: { slug: validatedData.slug } });
    if (existingSlug) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
    }

    const product = await db.product.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        shortDescription: validatedData.shortDescription || null,
        price: validatedData.price,
        comparePrice: validatedData.comparePrice || null,
        wholesalePrice: validatedData.wholesalePrice || null,
        minOrderQty: validatedData.minOrderQty ?? 1,
        sku: validatedData.sku || null,
        images: typeof body.images === 'string' ? body.images : JSON.stringify(body.images || []),
        categoryId: validatedData.categoryId || null,
        whatsappNumber: validatedData.whatsappNumber || null,
        isFeatured: validatedData.isFeatured ?? false,
        isActive: validatedData.isActive ?? true,
        sortOrder: validatedData.sortOrder ?? 0,
        specifications: validatedData.specifications
          ? typeof validatedData.specifications === 'string'
            ? validatedData.specifications
            : JSON.stringify(validatedData.specifications)
          : null,
        metaTitle: validatedData.metaTitle || null,
        metaDescription: validatedData.metaDescription || null,
        stock: typeof body.stock === 'number' ? body.stock : (parseInt(body.stock) || 0),
        lowStockThreshold: typeof body.lowStockThreshold === 'number' ? body.lowStockThreshold : (parseInt(body.lowStockThreshold) || 10),
        relatedProductIds: typeof body.relatedProductIds === 'string' ? body.relatedProductIds : '[]',
      },
      include: { category: true },
    });

    // Log product creation
    const userId = request.headers.get('x-user-id') || undefined;
    const userName = request.headers.get('x-user-email') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    logActivity({
      action: 'product.create',
      entity: 'Product',
      entityId: product.id,
      userId,
      userName,
      ipAddress,
      details: { name: product.name, price: product.price },
    }).catch(() => {});

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
