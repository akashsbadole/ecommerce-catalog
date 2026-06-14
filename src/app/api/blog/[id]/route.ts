import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeBlocksForStorage } from '@/lib/page-blocks';

async function resolveBlogPost(idOrSlug: string) {
  return db.blogPost.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
    },
    include: { User: { select: { id: true, name: true, email: true } } },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blogPost = await resolveBlogPost(id);

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
    let blocks: string | undefined;

    if (body.blocks !== undefined) {
      try {
        blocks = normalizeBlocksForStorage(body.blocks);
      } catch {
        return NextResponse.json(
          { error: 'Blocks must be an array or a valid JSON string' },
          { status: 400 }
        );
      }
    }

    const existing = await resolveBlogPost(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Check slug uniqueness if slug is being updated
    if (body.slug !== undefined && body.slug !== existing.slug) {
      const slugExists = await db.blogPost.findFirst({
        where: { slug: body.slug, NOT: { id: existing.id } },
      });
      if (slugExists) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
      }
    }

    // If publishing for the first time, set publishedAt
    let publishedAt: Date | null | undefined = undefined;
    if (body.isPublished === true && !existing.publishedAt) {
      publishedAt = new Date();
    } else if (body.isPublished === false) {
      publishedAt = null;
    }

    const blogPost = await db.blogPost.update({
      where: { id: existing.id },
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
        ...(blocks !== undefined && { blocks }),
        ...(body.tags !== undefined && {
          tags: body.tags ? JSON.stringify(body.tags) : null,
        }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        ...(publishedAt !== undefined && { publishedAt }),
      },
      include: { User: { select: { id: true, name: true, email: true } } },
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await resolveBlogPost(id);
    if (!existing) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    if (body.restore) {
      const blogPost = await db.blogPost.update({
        where: { id: existing.id },
        data: { deletedAt: null },
        include: { User: { select: { id: true, name: true, email: true } } },
      });
      return NextResponse.json({ blogPost });
    }

    return NextResponse.json({ error: 'No valid action specified' }, { status: 400 });
  } catch (error) {
    console.error('Patch blog post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    const existing = await resolveBlogPost(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    if (permanent) {
      await db.blogPost.delete({ where: { id: existing.id } });
      return NextResponse.json({ message: 'Blog post permanently deleted' });
    }

    await db.blogPost.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      message: 'Blog post moved to trash',
    });
  } catch (error) {
    console.error('Delete blog post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
