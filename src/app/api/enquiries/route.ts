import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { createNotification } from '@/lib/notifications';
import { enquirySchema } from '@/lib/validations';

// Max 10 enquiry submissions per hour per IP (POST only)
const ENQUIRY_RATE_LIMIT = { maxRequests: 10, windowMs: 60 * 60 * 1000, prefix: 'enquiries-post' };

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { subject: { contains: search } },
        { message: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const skip = (Math.max(1, page) - 1) * Math.min(Math.max(1, limit), 100);

    const [enquiries, total] = await Promise.all([
      db.enquiry.findMany({
        where,
        include: {
          Product: { select: { id: true, name: true } },
          User: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Math.min(Math.max(1, limit), 100),
      }),
      db.enquiry.count({ where }),
    ]);

    return NextResponse.json({
      enquiries,
      pagination: {
        page: Math.max(1, page),
        limit: Math.min(Math.max(1, limit), 100),
        total,
        totalPages: Math.ceil(total / Math.min(Math.max(1, limit), 100)),
      },
    });
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

    const result = enquirySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const validatedData = result.data;

    const enquiry = await db.enquiry.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        companyName: validatedData.companyName || null,
        companyEmail: validatedData.companyEmail || null,
        companyPhone: validatedData.companyPhone || null,
        companyAddress: validatedData.companyAddress || null,
        quantity: validatedData.quantity ?? null,
        subject: validatedData.subject,
        message: validatedData.message,
        productId: validatedData.productId || null,
        type: validatedData.type || 'product',
        status: 'new',
        userId: (body as Record<string, unknown>).userId as string | undefined || null,
      },
    });

    // Create broadcast notification for admin users
    try {
      await createNotification({
        title: 'New Enquiry',
        message: `New enquiry from ${validatedData.name}`,
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
