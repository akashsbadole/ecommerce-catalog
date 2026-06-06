import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash, generateToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendEmail, getSiteSettings } from '@/lib/email';
import crypto from 'crypto';

const REGISTER_RATE_LIMIT = { maxRequests: 3, windowMs: 15 * 60 * 1000, prefix: 'auth-register' };

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = checkRateLimit(request, REGISTER_RATE_LIMIT);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { name, email, password, companyName, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'customer',
        isVerified: false,
        companyName: companyName || null,
        phone: phone || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        isVerified: true,
      },
    });

    // Create verification token and send email
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await db.emailVerificationToken.create({
        data: { userId: user.id, token, expiresAt },
      });

      const emailSettings = await getSiteSettings();
      const siteName = emailSettings('site_name') || 'Store';
      const siteUrl = emailSettings('seo_canonical_url') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const verifyUrl = `${siteUrl}/auth/verify-email?token=${token}`;

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #059669;">Welcome to ${siteName}!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Verify Email Address</a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">This link will expire in 24 hours.</p>
        </div>
      `;

      await sendEmail(user.email, `Verify your email - ${siteName}`, html);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    const authToken = await generateToken({ id: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({
      user,
      token: authToken,
      requiresVerification: true,
    }, { status: 201 });
    response.cookies.set('user_token', authToken, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
