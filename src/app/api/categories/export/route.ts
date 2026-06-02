import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_request: NextRequest) {
  try {
    const categories = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const headers = ['name', 'slug', 'description', 'isActive', 'sortOrder'];

    function escapeCSVField(val: any): string {
      const str = val === null || val === undefined ? '' : String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }

    const rows = categories.map((c) => [
      escapeCSVField(c.name),
      escapeCSVField(c.slug),
      escapeCSVField(c.description),
      escapeCSVField(c.isActive),
      escapeCSVField(c.sortOrder),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="categories-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
