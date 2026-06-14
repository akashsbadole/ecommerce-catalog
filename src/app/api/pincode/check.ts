import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pincode, storeId: bodyStoreId } = body;

    if (!pincode) {
      return NextResponse.json(
        { error: 'Pincode is required' },
        { status: 400 },
      );
    }

    const storeId = bodyStoreId || getStoreId(request);

    const service = await db.pincodeService.findFirst({
      where: {
        pincode: String(pincode),
        isActive: true,
        ...(storeId ? { storeId } : {}),
      },
    });

    if (!service) {
      return NextResponse.json({
        serviceable: false,
        message: 'Delivery is not available for this pincode',
      });
    }

    return NextResponse.json({
      serviceable: service.isServiceable,
      deliveryDays: service.deliveryDays,
      shippingCost: service.shippingCost,
      codAvailable: service.codAvailable,
    });
  } catch (error) {
    console.error('Pincode check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
