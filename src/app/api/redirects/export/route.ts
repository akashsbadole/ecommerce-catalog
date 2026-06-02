import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_request: NextRequest) {
  try {
    const redirects = await db.redirect.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['from', 'to', 'type', 'isActive'];

    function escapeCSVField(val: any): string {
      const str = val === null || val === undefined ? '' : String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }

    const rows = redirects.map((r) => [
      escapeCSVField(r.from),
      escapeCSVField(r.to),
      escapeCSVField(r.type),
      escapeCSVField(r.isActive),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="redirects-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export redirects error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
