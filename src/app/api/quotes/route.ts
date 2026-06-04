import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth-edge';

async function resolveUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);
  return payload?.userId ?? null;
}

function generateQuoteNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `QT-${date}-${random}`;
}

// GET /api/quotes - Get user's quotes
export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (status) {
      where.status = status;
    }

    const [quotes, total] = await Promise.all([
      db.quote.findMany({
        where,
        include: {
          items: {
            select: {
              id: true,
              productId: true,
              name: true,
              sku: true,
              price: true,
              quantity: true,
              total: true,
              images: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.quote.count({ where }),
    ]);

    return NextResponse.json({
      quotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Quotes GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/quotes - Create quote from items
export async function POST(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, notes, validUntil, currency } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    }

    // Validate and build quote items
    const quoteItems: Array<{
      productId: string;
      name: string;
      sku: string | null;
      price: number;
      quantity: number;
      total: number;
      images: string;
    }> = [];
    let subtotal = 0;

    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price) {
        return NextResponse.json(
          { error: 'Each item must have productId, quantity, and price' },
          { status: 400 }
        );
      }

      const product = await db.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          sku: true,
          images: true,
          isActive: true,
          deletedAt: true,
        },
      });

      if (!product || !product.isActive || product.deletedAt) {
        return NextResponse.json(
          { error: `Product "${item.productId}" not found or unavailable` },
          { status: 400 }
        );
      }

      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      quoteItems.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: item.price,
        quantity: item.quantity,
        total: itemTotal,
        images: product.images,
      });
    }

    // Tax calculation from site settings
    const taxSettings = await db.siteSetting.findUnique({ where: { key: 'tax_rate' } });
    const taxRate = parseFloat(taxSettings?.value || '0');
    const tax = Math.round(subtotal * taxRate * 100) / 100;

    const total = subtotal + tax;

    const quote = await db.quote.create({
      data: {
        quoteNumber: generateQuoteNumber(),
        userId,
        status: 'draft',
        subtotal,
        tax,
        total,
        currency: currency || 'USD',
        validUntil: validUntil ? new Date(validUntil) : null,
        notes: notes || null,
        items: {
          create: quoteItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      quote,
      message: 'Quote created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Quote POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
