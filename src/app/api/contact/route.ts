import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEnquiryNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message, productId } = body;

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
        subject,
        message,
        productId: productId || null,
        type: 'contact',
        status: 'new',
      },
    });

    // Try to send email notification — return success even if email fails
    try {
      await sendEnquiryNotification({
        name,
        email,
        subject,
        message,
        type: 'contact',
      });
    } catch {
      console.log('Email notification failed, enquiry still saved');
    }

    return NextResponse.json(
      { enquiry, message: 'Your message has been sent successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
