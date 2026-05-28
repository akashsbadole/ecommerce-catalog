import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');
    const search = searchParams.get('search');
    const slug = searchParams.get('slug');

    const where: Record<string, unknown> = {};

    if (!all) {
      where.isActive = true;
    }

    if (search) {
      where.title = { contains: search };
    }

    if (slug) {
      where.slug = slug;
    }

    const contentPages = await db.contentPage.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ contentPages });
  } catch (error) {
    console.error('Get content pages error:', error);
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
      title,
      slug,
      content,
      heroImage,
      metaTitle,
      metaDescription,
      ogImage,
      isActive,
      sortOrder,
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    const contentPage = await db.contentPage.create({
      data: {
        title,
        slug,
        content: content || '',
        heroImage: heroImage || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        ogImage: ogImage || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json({ contentPage }, { status: 201 });
  } catch (error) {
    console.error('Create content page error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
