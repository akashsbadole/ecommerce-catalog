import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId, scopedWhere } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const storeId = getStoreId(request);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where = scopedWhere({}, storeId);

    const [bundles, total] = await Promise.all([
      db.productBundle.findMany({
        where,
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
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      db.productBundle.count({ where }),
    ]);

    return NextResponse.json({
      bundles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get bundles error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { name, slug, description, discountPercent, isActive, sortOrder, items } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Bundle name is required' },
        { status: 400 }
      );
    }

    // Auto-generate slug from name if not provided
    const bundleSlug = slug
      ? slug.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '')
      : name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');

    // Check slug uniqueness
    const existingSlug = await db.productBundle.findUnique({
      where: { slug: bundleSlug },
    });
    if (existingSlug) {
      return NextResponse.json({ error: 'A bundle with this slug already exists' }, { status: 409 });
    }

    const storeId = getStoreId(request);

    // Validate items if provided
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (!item.productId) {
          return NextResponse.json(
            { error: 'Each bundle item must have a productId' },
            { status: 400 }
          );
        }
        const product = await db.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          return NextResponse.json(
            { error: `Product not found: ${item.productId}` },
            { status: 404 }
          );
        }
      }
    }

    const bundle = await db.productBundle.create({
      data: {
        name,
        slug: bundleSlug,
        description: description || null,
        discountPercent: discountPercent ?? 0,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
        ...(storeId ? { storeId } : {}),
        ...(items && Array.isArray(items) && items.length > 0
          ? {
              items: {
                create: items.map((item: { productId: string; quantity?: number }) => ({
                  productId: item.productId,
                  quantity: item.quantity ?? 1,
                })),
              },
            }
          : {}),
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

    return NextResponse.json({ bundle }, { status: 201 });
  } catch (error) {
    console.error('Create bundle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
