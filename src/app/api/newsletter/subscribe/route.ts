import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { newsletterSubscribeSchema } from '@/lib/validations';

// Max 3 subscriptions per hour per IP
const SUBSCRIBE_RATE_LIMIT = { maxRequests: 3, windowMs: 60 * 60 * 1000, prefix: 'newsletter-subscribe' };

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(request, SUBSCRIBE_RATE_LIMIT);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();

    const result = newsletterSubscribeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const validatedData = result.data;

    // Check for duplicate
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email: validatedData.email },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 409 }
        );
      }
      // Reactivate previously unsubscribed
      await db.newsletterSubscriber.update({
        where: { email: validatedData.email },
        data: { isActive: true },
      });
      return NextResponse.json({ message: 'Subscription reactivated successfully' });
    }

    await db.newsletterSubscriber.create({
      data: {
        email: validatedData.email,
      },
    });

    return NextResponse.json({ message: 'Subscribed successfully' }, { status: 201 });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
