import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { z } from 'zod';

const menuSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  location: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  items: z.array(z.object({
    id: z.string().optional(),
    parentId: z.string().nullable().optional(),
    label: z.string().min(1),
    url: z.string().optional().nullable(),
    page: z.string().optional().nullable(),
    slug: z.string().optional().nullable(),
    sortOrder: z.number().optional(),
    isActive: z.boolean().optional(),
    openInNewTab: z.boolean().optional(),
  })).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');
    const location = searchParams.get('location');

    const where: Record<string, unknown> = {};

    if (!all) {
      where.isActive = true;
    }

    if (location) {
      where.location = location;
    }

    if (storeId) {
      where.storeId = storeId;
    }

    const menus = await db.menu.findMany({
      where,
      include: {
        items: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ menus });
  } catch (error) {
    console.error('Get menus error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const body = await request.json();
    const result = menuSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const validatedData = result.data;

    const storeId = getStoreId(request);

    // Check slug uniqueness per store
    const existingSlug = await db.menu.findFirst({
      where: { slug: validatedData.slug, ...(storeId ? { storeId } : {}) },
    });
    if (existingSlug) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
    }

    const { items, ...menuData } = validatedData;

    const menu = await db.menu.create({
      data: {
        ...menuData,
        isActive: validatedData.isActive ?? true,
        ...(storeId ? { storeId } : {}),
        items: items?.length ? {
          create: items.map((item, index) => ({
            ...item,
            sortOrder: item.sortOrder ?? index,
            isActive: item.isActive ?? true,
            openInNewTab: item.openInNewTab ?? false,
          })),
        } : undefined,
      },
      include: { items: true },
    });

    revalidatePath('/', 'layout');
    return NextResponse.json({ menu }, { status: 201 });
  } catch (error) {
    console.error('Create menu error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}