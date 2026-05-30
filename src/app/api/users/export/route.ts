import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_request: NextRequest) {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['name', 'email', 'role', 'isActive', 'createdAt'];

    function escapeCSVField(val: any): string {
      const str = val === null || val === undefined ? '' : String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }

    const rows = users.map((u) => [
      escapeCSVField(u.name),
      escapeCSVField(u.email),
      escapeCSVField(u.role),
      escapeCSVField(u.isActive),
      escapeCSVField(u.createdAt.toISOString()),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
