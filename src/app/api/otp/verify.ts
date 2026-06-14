import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { db } from '@/lib/db';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, email, otp } = body;

    if (!otp) {
      return NextResponse.json(
        { error: 'OTP is required' },
        { status: 400 },
      );
    }

    if (!phone && !email) {
      return NextResponse.json(
        { error: 'Phone or email is required' },
        { status: 400 },
      );
    }

    const now = new Date();

    const record = await db.oTP.findFirst({
      where: {
        otp,
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
        expiresAt: { gt: now },
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 },
      );
    }

    await db.oTP.update({
      where: { id: record.id },
      data: { usedAt: now },
    });

    const identifier = email || phone;

    let user = email
      ? await db.user.findUnique({ where: { email } })
      : await db.user.findFirst({ where: { phone: phone || '' } });

    if (!user) {
      user = await db.user.create({
        data: {
          email: email || `${phone}@otp.local`,
          name: email ? email.split('@')[0] : `User ${phone}`,
          password: Math.random().toString(36).slice(2),
          phone: phone || null,
          role: 'buyer',
          isVerified: true,
        },
      });
    }

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(getJwtSecret());

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
