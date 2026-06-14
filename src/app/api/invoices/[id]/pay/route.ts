import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveUserId } from '@/lib/auth-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const isOwner = invoice.userId === userId;
    const isCompanyInvoice = user?.companyId && invoice.companyId === user.companyId;

    if (!isOwner && !isCompanyInvoice) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await db.invoice.update({
      where: { id },
      data: { status: 'paid', paidAt: new Date() },
      include: { items: true },
    });

    return NextResponse.json({ invoice: updated });
  } catch (error) {
    console.error('Invoice Pay POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
