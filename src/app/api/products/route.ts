import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const featured = searchParams.get('featured');

    const all = searchParams.get('all');
    const where: Record<string, unknown> = {};

    if (!all) {
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
    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      comparePrice,
      wholesalePrice,
      minOrderQty,
      sku,
      images,
      categoryId,
      isFeatured,
      isActive,
      sortOrder,
      specifications,
      metaTitle,
      metaDescription,
    } = body;

    if (!name || !slug || price === undefined) {
      return NextResponse.json(
        { error: 'Name, slug, and price are required' },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        name,
        slug,
        description: description || null,
        shortDescription: shortDescription || null,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : null,
        minOrderQty: minOrderQty ?? 1,
        sku: sku || null,
        images: typeof images === 'string' ? images : JSON.stringify(images || []),
        categoryId: categoryId || null,
        isFeatured: isFeatured ?? false,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
        specifications: specifications
          ? typeof specifications === 'string'
            ? specifications
            : JSON.stringify(specifications)
          : null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      },
      include: { category: true },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
