import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const blogPost = await db.blogPost.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    if (!blogPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ blogPost });
  } catch (error) {
    console.error('Get blog post error:', error);
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

    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // If publishing for the first time, set publishedAt
    let publishedAt: Date | null | undefined = undefined;
    if (body.isPublished === true && !existing.publishedAt) {
      publishedAt = new Date();
    } else if (body.isPublished === false) {
      publishedAt = null;
    }

    const blogPost = await db.blogPost.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.excerpt !== undefined && {
          excerpt: body.excerpt || null,
        }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.coverImage !== undefined && {
          coverImage: body.coverImage || null,
        }),
        ...(body.authorId !== undefined && {
          authorId: body.authorId || null,
        }),
        ...(body.metaTitle !== undefined && {
          metaTitle: body.metaTitle || null,
        }),
        ...(body.metaDescription !== undefined && {
          metaDescription: body.metaDescription || null,
        }),
        ...(body.ogImage !== undefined && {
          ogImage: body.ogImage || null,
        }),
        ...(body.tags !== undefined && {
          tags: body.tags ? JSON.stringify(body.tags) : null,
        }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        ...(publishedAt !== undefined && { publishedAt }),
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ blogPost });
  } catch (error) {
    console.error('Update blog post error:', error);
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

    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    await db.blogPost.delete({ where: { id } });

    return NextResponse.json({
      message: 'Blog post deleted successfully',
    });
  } catch (error) {
    console.error('Delete blog post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
