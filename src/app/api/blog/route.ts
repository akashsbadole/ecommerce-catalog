import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity-log';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');
    const published = searchParams.get('published');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const where: Record<string, unknown> = {};

    if (published === 'true') {
      where.isPublished = true;
    } else if (!all) {
      where.isPublished = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }

    if (tag) {
      where.tags = { contains: tag };
    }

    const [blogPosts, total] = await Promise.all([
      db.blogPost.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          coverImage: true,
          authorId: true,
          metaTitle: true,
          metaDescription: true,
          ogImage: true,
          tags: true,
          isPublished: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          author: { select: { id: true, name: true, email: true } },
        },
        orderBy: published === 'true' || !all
          ? { publishedAt: 'desc' }
          : { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      blogPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
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
      excerpt,
      content,
      coverImage,
      authorId,
      metaTitle,
      metaDescription,
      ogImage,
      tags,
      isPublished,
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }

    const blogPost = await db.blogPost.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content: content || '',
        coverImage: coverImage || null,
        authorId: authorId || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        ogImage: ogImage || null,
        tags: tags ? JSON.stringify(tags) : null,
        isPublished: isPublished ?? false,
        publishedAt: isPublished ? new Date() : null,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    // Log blog creation
    const userId = request.headers.get('x-user-id') || undefined;
    const userName = request.headers.get('x-user-email') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    logActivity({
      action: 'blog.create',
      entity: 'Blog',
      entityId: blogPost.id,
      userId,
      userName,
      ipAddress,
      details: { title: blogPost.title, isPublished: blogPost.isPublished },
    }).catch(() => {});

    return NextResponse.json({ blogPost }, { status: 201 });
  } catch (error) {
    console.error('Create blog post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
