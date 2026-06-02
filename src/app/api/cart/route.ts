import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth-edge';

function getUserId(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return verifyToken(token).then(p => p?.userId ?? null) as unknown as string | null;
}

async function resolveUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);
  return payload?.userId ?? null;
}

// GET /api/cart - Get current user's cart
export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            Product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                comparePrice: true,
                images: true,
                stock: true,
                isActive: true,
                minOrderQty: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ cart: null, items: [], total: 0, itemCount: 0 });
    }

    const total = cart.items.reduce((sum, item) => {
      return sum + item.Product.price * item.quantity;
    }, 0);

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({ cart, items: cart.items, total, itemCount });
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, variantId, quantity } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const qty = Math.max(1, parseInt(quantity) || 1);

    // Verify product exists and is active
    const product = await db.product.findUnique({
      where: { id: productId, isActive: true, deletedAt: null },
      select: { id: true, stock: true, minOrderQty: true, isActive: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found or unavailable' }, { status: 404 });
    }

    if (product.stock < qty) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    // Get or create cart
    let cart = await db.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await db.cart.create({ data: { userId } });
    }

    // Check if item already exists in cart
    const existingItem = await db.cartItem.findUnique({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
        },
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + qty;
      if (newQty > product.stock) {
        return NextResponse.json({ error: 'Cannot add more than available stock' }, { status: 400 });
      }
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity: qty,
        },
      });
    }

    // Return updated cart
    const updatedCart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            Product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                comparePrice: true,
                images: true,
                stock: true,
                isActive: true,
                minOrderQty: true,
              },
            },
          },
        },
      },
    });

    const total = updatedCart?.items.reduce((sum, item) => sum + item.Product.price * item.quantity, 0) || 0;
    const itemCount = updatedCart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return NextResponse.json({ cart: updatedCart, items: updatedCart?.items || [], total, itemCount });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/cart - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const cart = await db.cart.findUnique({ where: { userId } });
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const cartItem = await db.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { Product: { select: { stock: true } } },
    });

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    const qty = parseInt(quantity);
    if (qty <= 0) {
      // Remove item if quantity is 0 or negative
      await db.cartItem.delete({ where: { id: itemId } });
    } else {
      if (qty > cartItem.Product.stock) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
      }
      await db.cartItem.update({
        where: { id: itemId },
        data: { quantity: qty },
      });
    }

    // Return updated cart
    const updatedCart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            Product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                comparePrice: true,
                images: true,
                stock: true,
                isActive: true,
                minOrderQty: true,
              },
            },
          },
        },
      },
    });

    const total = updatedCart?.items.reduce((sum, item) => sum + item.Product.price * item.quantity, 0) || 0;
    const itemCount = updatedCart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return NextResponse.json({ cart: updatedCart, items: updatedCart?.items || [], total, itemCount });
  } catch (error) {
    console.error('Cart PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cart - Clear cart or remove specific item
export async function DELETE(request: NextRequest) {
  try {
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    const cart = await db.cart.findUnique({ where: { userId } });
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    if (itemId) {
      // Remove specific item
      await db.cartItem.deleteMany({
        where: { id: itemId, cartId: cart.id },
      });
    } else {
      // Clear entire cart
      await db.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
