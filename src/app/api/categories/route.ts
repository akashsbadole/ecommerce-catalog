import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');
    const where: Record<string, unknown> = {};
    if (!all) {
      where.isActive = true;
    }

    const categories = await db.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: all ? { _count: { select: { products: true } } } : undefined,
    });

    return NextResponse.json({ categories });
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
    const { name, slug, description, image, sortOrder, isActive, metaTitle, metaDescription } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
