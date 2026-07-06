import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const reqUserId = request.headers.get('x-user-id');
    const reqUserRole = request.headers.get('x-user-role');
    const { id } = await params;

    const quote = await db.quote.findUnique({
      where: { id },
      include: {
        Enquiry: {
          include: { Product: true }
        },
        Company: true,
        User: { select: { id: true, name: true, email: true } }
      }
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Authorization: only admin/clerk can view quotes
    if (reqUserRole !== 'admin' && reqUserRole !== 'clerk') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ quote });
  } catch (error) {
    console.error('Get quote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const reqUserId = request.headers.get('x-user-id');
    const reqUserRole = request.headers.get('x-user-role');
    const { id } = await params;
    const body = await request.json();
    const { status, items, totalAmount, notes, validUntil } = body;

    const quote = await db.quote.findUnique({ where: { id } });
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (reqUserRole !== 'admin' && reqUserRole !== 'clerk') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data: any = {};

    if (status) data.status = status;
    if (items) data.items = JSON.stringify(items);
    if (totalAmount !== undefined) data.totalAmount = totalAmount;
    if (notes !== undefined) data.notes = notes;
    if (validUntil) data.validUntil = new Date(validUntil);

    const updatedQuote = await db.quote.update({
      where: { id },
      data
    });

    return NextResponse.json({ quote: updatedQuote });
  } catch (error) {
    console.error('Update quote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const reqUserRole = request.headers.get('x-user-role');
    if (reqUserRole !== 'admin' && reqUserRole !== 'clerk') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { id } = await params;
    await db.quote.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete quote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
