import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';
import { categorySchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');
    const includeDeleted = searchParams.get('includeDeleted');
    const where: Record<string, unknown> = {};

    // Always exclude soft-deleted unless explicitly requested
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (!all) {
      where.isActive = true;
    }

    const categories = await db.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: all ? { _count: { select: { Product: true } } } : undefined,
    });

    const response = NextResponse.json({ categories });

    // Cache public category listings for 10 minutes
    if (!includeDeleted) {
      response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    }

    return response;
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = categorySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const validatedData = result.data;

    // Check slug uniqueness (excluding soft-deleted)
    const existingSlug = await db.category.findFirst({
      where: { slug: validatedData.slug, deletedAt: null },
    });
    if (existingSlug) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
    }

    const category = await db.category.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        image: validatedData.image || null,
        sortOrder: validatedData.sortOrder ?? 0,
        isActive: validatedData.isActive ?? true,
        metaTitle: validatedData.metaTitle || null,
        metaDescription: validatedData.metaDescription || null,
        customSchema: (validatedData as Record<string, unknown>).customSchema as string || null,
        parentId: body.parentId || null,
      },
    });

    // Log category creation
    const userId = request.headers.get('x-user-id') || undefined;
    const userName = request.headers.get('x-user-email') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    logActivity({
      action: 'category.create',
      entity: 'Category',
      entityId: category.id,
      userId,
      userName,
      ipAddress,
      details: { name: category.name },
    }).catch(() => {});

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
