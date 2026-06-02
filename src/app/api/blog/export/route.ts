import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_request: NextRequest) {
  try {
    const posts = await db.blogPost.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['title', 'slug', 'excerpt', 'content', 'isPublished', 'createdAt'];

    function escapeCSVField(val: any): string {
      const str = val === null || val === undefined ? '' : String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }

    const rows = posts.map((p) => [
      escapeCSVField(p.title),
      escapeCSVField(p.slug),
      escapeCSVField(p.excerpt),
      escapeCSVField(p.content),
      escapeCSVField(p.isPublished),
      escapeCSVField(p.createdAt.toISOString()),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="blog-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export blog error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
