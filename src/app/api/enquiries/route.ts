import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const enquiries = await db.enquiry.findMany({
      where,
      include: {
        product: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error('Get enquiries error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      companyName,
      companyEmail,
      companyPhone,
      companyAddress,
      quantity,
      subject,
      message,
      productId,
      type,
      userId,
    } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      );
    }

    const enquiry = await db.enquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        companyName: companyName || null,
        companyEmail: companyEmail || null,
        companyPhone: companyPhone || null,
        companyAddress: companyAddress || null,
        quantity: quantity ?? null,
        subject,
        message,
        productId: productId || null,
        type: type || 'product',
        status: 'new',
        userId: userId || null,
      },
    });

    return NextResponse.json({ enquiry }, { status: 201 });
  } catch (error) {
    console.error('Create enquiry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
