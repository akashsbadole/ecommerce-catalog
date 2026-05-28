import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { ids, action } = await request.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !action) {
      return NextResponse.json({ error: 'ids and action required' }, { status: 400 });
    }

    const role = request.headers.get('x-user-role');

    switch (action) {
      case 'activate':
        await db.category.updateMany({ where: { id: { in: ids } }, data: { isActive: true } });
        break;
      case 'deactivate':
        await db.category.updateMany({ where: { id: { in: ids } }, data: { isActive: false } });
        break;
      case 'delete':
        if (role !== 'admin') {
          return NextResponse.json({ error: 'Only admin can bulk delete categories' }, { status: 403 });
        }
        await db.category.deleteMany({ where: { id: { in: ids } } });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const count = ids.length;
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('Bulk category operation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
