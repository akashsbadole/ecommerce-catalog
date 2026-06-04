import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveUserId } from '@/lib/auth-helpers';
import { getGlobalSetting } from '@/lib/settings';
import crypto from 'crypto';

// POST /api/payment/razorpay - Create Razorpay order
export async function POST(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, currency = 'USD', orderId } = body;

    // Get Razorpay settings
    const [keyIdValue, keySecretValue, enabledValue] = await Promise.all([
      getGlobalSetting('payment_razorpay_key_id'),
      getGlobalSetting('payment_razorpay_key_secret'),
      getGlobalSetting('payment_razorpay_enabled'),
    ]);

    if (enabledValue !== 'true') {
      return NextResponse.json({ error: 'Razorpay is not enabled' }, { status: 400 });
    }

    const keyId = keyIdValue;
    const keySecret = keySecretValue;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 400 });
    }

    // If orderId provided, verify the order exists and belongs to user
    if (orderId) {
      const order = await db.order.findFirst({
        where: { id: orderId, userId },
      });
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
    }

    // Create Razorpay order via API
    const razorpayOrder = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Razorpay expects paise
        currency,
        receipt: orderId || `user_${userId}_${Date.now()}`,
      }),
    });

    if (!razorpayOrder.ok) {
      const error = await razorpayOrder.json();
      console.error('Razorpay order creation failed:', error);
      return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
    }

    const orderData = await razorpayOrder.json();

    return NextResponse.json({
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      keyId,
    });
  } catch (error) {
    console.error('Razorpay POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/payment/razorpay/verify - Verify payment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

    // Get Razorpay secret
    const keySecretValue = await getGlobalSetting('payment_razorpay_key_secret');
    const keySecret = keySecretValue;

    if (!keySecret) {
      return NextResponse.json({ error: 'Razorpay not configured' }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Update order status
    if (orderId) {
      await db.order.update({
        where: { id: orderId },
        data: {
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentMethod: 'razorpay',
          notes: `Razorpay Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id}`,
        },
      });
    }

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
