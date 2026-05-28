import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { ids, action } = await request.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !action) {
      return NextResponse.json({ error: 'ids and action required' }, { status: 400 });
    }
    switch (action) {
      case 'publish':
        await db.product.updateMany({ where: { id: { in: ids } }, data: { isActive: true } });
        break;
      case 'unpublish':
        await db.product.updateMany({ where: { id: { in: ids } }, data: { isActive: false } });
        break;
      case 'delete':
        await db.product.deleteMany({ where: { id: { in: ids } } });
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
