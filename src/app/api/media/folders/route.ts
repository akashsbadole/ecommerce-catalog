import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const folders = await db.media.findMany({
      select: { folder: true },
      distinct: ['folder'],
      orderBy: { folder: 'asc' },
    });

    const folderList = folders
      .map(f => f.folder)
      .filter((f): f is string => f !== null && f !== '');

    return NextResponse.json({ folders: folderList });
  } catch (error) {
    console.error('List folders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { folder } = await request.json();

    if (!folder || typeof folder !== 'string') {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

    const sanitized = folder.trim().replace(/[^a-zA-Z0-9_\-\/ ]/g, '');
    if (!sanitized.startsWith('/')) {
      return NextResponse.json({ error: 'Folder must start with /' }, { status: 400 });
    }

    // Check if folder already exists
    const existing = await db.media.findFirst({
      where: { folder: sanitized },
      select: { folder: true },
    });

    return NextResponse.json({
      folder: sanitized,
      alreadyExists: !!existing,
      message: existing ? 'Folder already exists' : 'Folder ready for use',
    });
  } catch (error) {
    console.error('Create folder error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
