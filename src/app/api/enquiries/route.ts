import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { createNotification } from '@/lib/notifications';

// Max 10 enquiry submissions per hour per IP (POST only)
const ENQUIRY_RATE_LIMIT = { maxRequests: 10, windowMs: 60 * 60 * 1000, prefix: 'enquiries-post' };

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
    // Rate limiting
    const rateLimitResponse = checkRateLimit(request, ENQUIRY_RATE_LIMIT);
    if (rateLimitResponse) return rateLimitResponse;
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

    // Create broadcast notification for admin users
    try {
      await createNotification({
        title: 'New Enquiry',
        message: `New enquiry from ${name}`,
        type: 'info',
        link: 'enquiries',
      });
    } catch {
      // Don't fail the enquiry creation if notification fails
    }

    return NextResponse.json({ enquiry }, { status: 201 });
  } catch (error) {
    console.error('Create enquiry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
