import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');
    const search = searchParams.get('search');
    const folder = searchParams.get('folder') || '/';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { originalName: { contains: search } },
        { alt: { contains: search } },
      ];
    }
    if (folder && folder !== '/') {
      where.folder = folder;
    }

    const [media, total] = await Promise.all([
      db.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.media.count({ where }),
    ]);

    return NextResponse.json({ media, total, page, limit });
  } catch (error) {
    console.error('Get media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, alt, folder } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    const media = await db.media.update({
      where: { id },
      data: { ...(alt !== undefined && { alt }), ...(folder !== undefined && { folder }) },
    });
    return NextResponse.json({ media });
  } catch (error) {
    console.error('Update media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
