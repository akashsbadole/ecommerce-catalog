import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const [
      totalRevenueResult,
      pendingOrdersCount,
      creditOutstandingResult,
      recentOrders,
      topCompanies,
    ] = await Promise.all([
      db.order.aggregate({
        _sum: { total: true },
        where: { status: 'delivered' },
      }),
      db.order.count({
        where: { status: { in: ['pending', 'processing', 'shipped'] } },
      }),
      db.company.aggregate({
        _sum: { creditUsed: true },
        where: { creditUsed: { gt: 0 } },
      }),
      db.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          currency: true,
          createdAt: true,
          User: {
            select: { name: true, email: true },
          },
        },
      }),
      db.company.findMany({
        where: { creditUsed: { gt: 0 } },
        orderBy: { creditUsed: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          creditLimit: true,
          creditUsed: true,
          creditTerms: true,
          tier: true,
        },
      }),
    ]);

    const lowStockProducts = await db.product.count({
      where: {
        isActive: true,
        deletedAt: null,
        stock: { lte: 10 },
      },
    });

    return NextResponse.json({
      totalRevenue: totalRevenueResult._sum.total ?? 0,
      pendingOrders: pendingOrdersCount,
      lowStockProducts,
      creditOutstanding: creditOutstandingResult._sum.creditUsed ?? 0,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total,
        currency: order.currency,
        createdAt: order.createdAt.toISOString(),
        userName: order.User?.name ?? null,
        userEmail: order.User?.email ?? null,
      })),
      topCompanies,
    });
  } catch (error) {
    console.error('ERP Overview GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
