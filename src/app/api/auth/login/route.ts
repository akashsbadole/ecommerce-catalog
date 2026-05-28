import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { logActivity } from '@/lib/activity-log';

// Max 5 login attempts per 15 minutes per IP
const LOGIN_RATE_LIMIT = { maxRequests: 5, windowMs: 15 * 60 * 1000, prefix: 'auth-login' };

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(request, LOGIN_RATE_LIMIT);
    if (rateLimitResponse) return rateLimitResponse;
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await authenticateUser(email, password);

    if (!result) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Log successful login
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    logActivity({
      action: 'user.login',
      entity: 'User',
      entityId: result.user.id,
      userId: result.user.id,
      userName: result.user.name,
      ipAddress,
      details: { email: result.user.email, role: result.user.role },
    }).catch(() => {});

    return NextResponse.json(result);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
