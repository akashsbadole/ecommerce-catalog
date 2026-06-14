import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, email } = body;

    if (!phone && !email) {
      return NextResponse.json(
        { error: 'Phone or email is required' },
        { status: 400 },
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.oTP.create({
      data: {
        phone: phone || null,
        email: email || null,
        otp,
        expiresAt,
      },
    });

    if (email) {
      const subject = 'Your Verification Code';
      const html = `<p>Your one-time password (OTP) is:</p><h2>${otp}</h2><p>This code expires in 10 minutes.</p>`;
      await sendEmail(email, subject, html);
    }

    return NextResponse.json({
      message: 'OTP sent successfully',
      ...(process.env.NODE_ENV !== 'production' && { otp }),
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
