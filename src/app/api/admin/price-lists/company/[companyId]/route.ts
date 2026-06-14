import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logError } from '@/lib/error-logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> },
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { companyId } = await params;

    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, tier: true, discountRate: true },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const prices = await db.customPrice.findMany({
      where: { companyId },
      include: {
        Product: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            images: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      company,
      prices,
    });
  } catch (error) {
    logError(error, { category: 'api', context: 'Admin Price Lists Company GET' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
