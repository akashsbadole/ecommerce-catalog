import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash, generateToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

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

    const token = await generateToken({ id: user.id, email: user.email, role: user.role });

    const response = NextResponse.json({ user, token }, { status: 201 });
    response.cookies.set('user_token', token, {
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
