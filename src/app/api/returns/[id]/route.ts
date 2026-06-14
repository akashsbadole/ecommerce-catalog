import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { resolveUserId } from '@/lib/auth-helpers';

// GET /api/returns/[id] - Get single return details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const returnRequest = await db.return.findFirst({
      where: { id, userId },
      include: {
        Order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
          },
        },
      },
    });

    if (!returnRequest) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 });
    }

    return NextResponse.json({ return: returnRequest });
  } catch (error) {
    console.error('Return GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/returns/[id] - Update return status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const body = await request.json();
    const { status, refundAmount, refundMethod, adminNotes } = body;

    const returnRequest = await db.return.findUnique({
      where: { id },
    });

    if (!returnRequest) {
      return NextResponse.json({ error: 'Return not found' }, { status: 404 });
    }

    const allowedStatuses = ['requested', 'approved', 'picked_up', 'received', 'refunded', 'rejected'];
    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (refundAmount !== undefined) updateData.refundAmount = refundAmount;
    if (refundMethod !== undefined) updateData.refundMethod = refundMethod;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const updatedReturn = await db.return.update({
      where: { id },
      data: updateData,
      include: {
        Order: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
          },
        },
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      return: updatedReturn,
      message: 'Return updated successfully',
    });
  } catch (error) {
    console.error('Return PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
