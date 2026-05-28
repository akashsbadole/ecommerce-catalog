import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    const redirect = await db.redirect.findUnique({
      where: { from: path },
      select: { from: true, to: true, type: true, isActive: true },
    });

    if (redirect && redirect.isActive) {
      return NextResponse.json({
        found: true,
        from: redirect.from,
        to: redirect.to,
        type: redirect.type,
      });
    }

    return NextResponse.json({ found: false }, { status: 200 });
  } catch (error) {
    console.error('Redirect check error:', error);
    return NextResponse.json({ found: false }, { status: 200 });
  }
}
