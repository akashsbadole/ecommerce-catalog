import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contentPage = await db.contentPage.findUnique({
      where: { id },
    });

    if (!contentPage) {
      return NextResponse.json(
        { error: 'Content page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ contentPage });
  } catch (error) {
    console.error('Get content page error:', error);
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

    const existing = await db.contentPage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Content page not found' },
        { status: 404 }
      );
    }

    const contentPage = await db.contentPage.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.heroImage !== undefined && {
          heroImage: body.heroImage || null,
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
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.blocks !== undefined && {
          blocks: typeof body.blocks === 'string' ? body.blocks : JSON.stringify(body.blocks),
        }),
      },
    });

    return NextResponse.json({ contentPage });
  } catch (error) {
    console.error('Update content page error:', error);
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

    const existing = await db.contentPage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Content page not found' },
        { status: 404 }
      );
    }

    await db.contentPage.delete({ where: { id } });

    return NextResponse.json({
      message: 'Content page deleted successfully',
    });
  } catch (error) {
    console.error('Delete content page error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
