import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logError } from '@/lib/error-logger';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const { action } = body;

    if (!action || !['delete', 'setCompanyDiscount'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "delete" or "setCompanyDiscount"' }, { status: 400 });
    }

    if (action === 'delete') {
      const { ids } = body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: 'ids array is required' }, { status: 400 });
      }

      const result = await db.customPrice.deleteMany({
        where: { id: { in: ids } },
      });

      return NextResponse.json({
        message: `${result.count} custom price(s) deleted successfully`,
        count: result.count,
      });
    }

    if (action === 'setCompanyDiscount') {
      const { companyId, productIds, price } = body;

      if (!companyId) {
        return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
      }
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return NextResponse.json({ error: 'productIds array is required' }, { status: 400 });
      }
      if (price === undefined || typeof price !== 'number' || price < 0) {
        return NextResponse.json({ error: 'Valid price is required' }, { status: 400 });
      }

      const results: { productId: string; action: string; price: number }[] = [];
      for (const productId of productIds) {
        const existing = await db.customPrice.findUnique({
          where: { companyId_productId: { companyId, productId } },
        });

        if (existing) {
          const updated = await db.customPrice.update({
            where: { id: existing.id },
            data: { price },
          });
          results.push({ productId, action: 'updated', price: updated.price });
        } else {
          const created = await db.customPrice.create({
            data: { companyId, productId, price },
          });
          results.push({ productId, action: 'created', price: created.price });
        }
      }

      return NextResponse.json({
        message: `Processed ${results.length} product(s)`,
        results,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logError(error, { category: 'api', context: 'Admin Price Lists Bulk POST' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
