import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { generatePayUHash, PAYU_CONFIG } from '@/lib/payments/payu';
import { requireAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const storeId = getStoreId(request);
    const body = await request.json();
    const { items, customer, paymentMethod, couponCode } = body;

    // Validate request
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Fetch product data from DB to prevent price tampering
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await db.product.findMany({
        where: { id: { in: productIds } }
    });

    // Calculate totals on server
    let calculatedSubtotal = 0;
    const orderItemsData = items.map((item: any) => {
        const dbProduct = dbProducts.find(p => p.id === item.productId);
        if (!dbProduct) throw new Error(`Product ${item.productId} not found`);

        const price = dbProduct.price;
        const total = price * item.quantity;
        calculatedSubtotal += total;

        return {
            productId: item.productId,
            variantId: item.variantId,
            name: dbProduct.name,
            quantity: item.quantity,
            price: price,
            total: total
        };
    });

    let calculatedTotal = calculatedSubtotal;
    let discount = 0;

    // Apply coupon if provided
    if (couponCode) {
        const coupon = await db.coupon.findFirst({
            where: { storeId, code: couponCode.toUpperCase(), isActive: true }
        });
        if (coupon) {
            if (coupon.discountType === 'percentage') {
                discount = (calculatedSubtotal * coupon.discountValue) / 100;
            } else {
                discount = Math.min(coupon.discountValue, calculatedSubtotal);
            }
            calculatedTotal = Math.max(0, calculatedSubtotal - discount);

            // Increment usage
            await db.coupon.update({
                where: { id: coupon.id },
                data: { usageCount: { increment: 1 } }
            });
        }
    }

    // Create order in transaction
    const order = await db.$transaction(async (tx) => {
      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          storeId,
          userId: auth.success ? auth.payload.userId : null,
          totalAmount: calculatedTotal,
          subtotal: calculatedSubtotal,
          discount: discount,
          couponCode: couponCode || null,
          paymentMethod,
          paymentStatus: 'unpaid',
          status: 'pending',
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          shippingAddress: JSON.stringify({
            address: customer.address,
            city: customer.city,
            state: customer.state,
            zipCode: customer.zipCode,
          }),
          notes: customer.notes,
        },
      });

      // 2. Create order items
      await Promise.all(
        orderItemsData.map((itemData: any) =>
          tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              ...itemData
            },
          })
        )
      );

      return newOrder;
    });

    // Handle Payment Integration (PayU)
    if (paymentMethod === 'payu') {
       const payuKey = process.env.PAYU_MERCHANT_KEY || 'test_key';
       const payuSalt = process.env.PAYU_MERCHANT_SALT || 'test_salt';
       const isProd = process.env.NODE_ENV === 'production';
       const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

       const paymentData = {
         key: payuKey,
         txnid: order.id,
         amount: order.totalAmount.toFixed(2),
         productinfo: `Order ${order.id}`,
         firstname: customer.name,
         email: customer.email,
         phone: customer.phone,
         surl: `${baseUrl}/api/payments/payu/callback`,
         furl: `${baseUrl}/api/payments/payu/callback`,
         salt: payuSalt,
       };

       const hash = generatePayUHash(paymentData);

       return NextResponse.json({
         orderId: order.id,
         paymentUrl: isProd ? PAYU_CONFIG.PROD_URL : PAYU_CONFIG.TEST_URL,
         paymentParams: {
           ...paymentData,
           hash,
           salt: undefined, // Don't send salt to client
         }
       });
    }

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
    try {
        const auth = await requireAuth(request);
        if (!auth.success) return auth.response;

        const storeId = getStoreId(request);
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (orderId) {
            const order = await db.order.findUnique({
                where: { id: orderId, userId: auth.payload.userId },
                include: { items: true }
            });
            return NextResponse.json({ order });
        }

        const orders = await db.order.findMany({
            where: { storeId, userId: auth.payload.userId },
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: { Product: { select: { images: true, slug: true } } }
                }
            }
        });
        return NextResponse.json({ orders });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
