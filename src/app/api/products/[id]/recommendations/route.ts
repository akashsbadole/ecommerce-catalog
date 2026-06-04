import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 12);
    const storeId = getStoreId(request);

    const product = await db.product.findUnique({
      where: { id },
      select: { id: true, categoryId: true, price: true, name: true },
    });

    if (!product) {
      return NextResponse.json({ products: [] });
    }

    const storeFilter = storeId ? { storeId } : {};
    const excludeIds = [id];

    // Strategy 1: Products frequently bought together
    let alsoBoughtIds: string[] = [];
    try {
      const ordersWithProduct = await db.orderItem.findMany({
        where: { productId: id },
        select: { orderId: true },
      });

      if (ordersWithProduct.length > 0) {
        const orderIds = ordersWithProduct.map(o => o.orderId);
        const coOccurring = await db.$queryRawUnsafe(
          `SELECT "productId", COUNT(*) as cnt
           FROM "OrderItem"
           WHERE "orderId" = ANY($1)
           AND "productId" != $2
           GROUP BY "productId"
           ORDER BY cnt DESC
           LIMIT 10`,
          orderIds, id
        );
        alsoBoughtIds = (coOccurring as any[]).map(r => r.productId);
      }
    } catch {
      // ignore if query fails
    }

    // Strategy 2: Same category products
    let sameCategoryIds: string[] = [];
    if (product.categoryId) {
      const sameCategory = await db.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { notIn: excludeIds },
          isActive: true,
          deletedAt: null,
          ...storeFilter,
        },
        select: { id: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      sameCategoryIds = sameCategory.map(p => p.id);
    }

    // Strategy 3: Similar price range products (±30%)
    let similarPriceIds: string[] = [];
    try {
      const priceMin = product.price * 0.7;
      const priceMax = product.price * 1.3;
      const similarPrice = await db.product.findMany({
        where: {
          price: { gte: priceMin, lte: priceMax },
          id: { notIn: excludeIds },
          isActive: true,
          deletedAt: null,
          ...storeFilter,
        },
        select: { id: true },
        take: 10,
      });
      similarPriceIds = similarPrice.map(p => p.id);
    } catch {
      // ignore
    }

    // Merge and deduplicate, prioritizing: also-bought > same-category > similar-price
    const seen = new Set<string>();
    const mergedIds: string[] = [];
    for (const list of [alsoBoughtIds, sameCategoryIds, similarPriceIds]) {
      for (const pid of list) {
        if (!seen.has(pid) && !excludeIds.includes(pid)) {
          seen.add(pid);
          mergedIds.push(pid);
        }
      }
    }

    const finalIds = mergedIds.slice(0, limit);
    if (finalIds.length === 0) {
      return NextResponse.json({ products: [] });
    }

    const products = await db.product.findMany({
      where: {
        id: { in: finalIds },
        isActive: true,
        deletedAt: null,
      },
      include: { Category: { select: { id: true, name: true } } },
    });

    // Maintain priority order
    const ordered = finalIds.map(pid => products.find(p => p.id === pid)).filter(Boolean);

    return NextResponse.json({ products: ordered });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json({ products: [] });
  }
}
