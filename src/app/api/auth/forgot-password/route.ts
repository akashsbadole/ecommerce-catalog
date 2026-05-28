import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

// Max 5 requests per 15 minutes per IP
const RESET_RATE_LIMIT = { maxRequests: 5, windowMs: 15 * 60 * 1000, prefix: 'forgot-password-post' };

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(request, RESET_RATE_LIMIT);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Always return success to avoid revealing if email exists
    // But only create token if user actually exists
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (user && user.isActive) {
      // Generate a random token
      const token = crypto.randomBytes(32).toString('hex');

      // Delete any existing unused tokens for this user
      await db.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
      });

      // Create new reset token with 1 hour expiry
      await db.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      // In a production app, you would send an email here with the reset link
      // For now, the token is stored and can be verified via /api/auth/reset-password
      console.log(`Password reset token for ${email}: ${token}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    // Still return success to avoid leaking information
    return NextResponse.json({ success: true });
  }
}
