import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

// GET /api/admin/backup - Export all data as JSON
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const [
      products,
      categories,
      orders,
      users,
      blogPosts,
      enquiries,
      banners,
      contentPages,
      media,
      redirects,
      settings,
    ] = await Promise.all([
      db.product.findMany({ orderBy: { createdAt: 'desc' } }),
      db.category.findMany({ orderBy: { sortOrder: 'asc' } }),
      db.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } }),
      db.user.findMany({ select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true } }),
      db.blogPost.findMany({ orderBy: { createdAt: 'desc' } }),
      db.enquiry.findMany({ orderBy: { createdAt: 'desc' } }),
      db.banner.findMany({ orderBy: { sortOrder: 'asc' } }),
      db.contentPage.findMany({ orderBy: { createdAt: 'desc' } }),
      db.media.findMany({ orderBy: { createdAt: 'desc' } }),
      db.redirect.findMany(),
      db.siteSetting.findMany(),
    ]);

    // Filter sensitive settings from backup
    const SENSITIVE_KEYS = ['smtp_pass', 'smtp_user', 'smtp_password', 'payment_razorpay_key_secret', 'jwt_secret', 'api_key', 'secret_key'];
    const filteredSettings = settings.filter(s => !SENSITIVE_KEYS.some(k => s.key.toLowerCase().includes(k)));

    const backup = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      data: {
        products,
        categories,
        orders,
        users,
        blogPosts,
        enquiries,
        banners,
        contentPages,
        media,
        redirects,
        settings: filteredSettings,
      },
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error('Backup GET error:', error);
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 });
  }
}

// POST /api/admin/backup - Restore from JSON backup
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.json')) {
      return NextResponse.json({ error: 'File must be a JSON backup' }, { status: 400 });
    }

    const text = await file.text();
    let backup;
    try {
      backup = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON file' }, { status: 400 });
    }

    if (!backup.data) {
      return NextResponse.json({ error: 'Invalid backup format' }, { status: 400 });
    }

    const { data } = backup;
    const results: Record<string, number> = {};

    // Restore each collection
    if (data.settings) {
      for (const setting of data.settings) {
        const existing = await db.siteSetting.findFirst({
          where: { storeId: null, key: setting.key },
        });
        if (existing) {
          await db.siteSetting.update({
            where: { id: existing.id },
            data: { value: setting.value },
          });
        } else {
          await db.siteSetting.create({
            data: { key: setting.key, value: setting.value },
          });
        }
      }
      results.settings = data.settings.length;
    }

    if (data.categories) {
      for (const cat of data.categories) {
        const { id, createdAt, updatedAt, ...catData } = cat;
        await db.category.upsert({
          where: { id },
          update: catData,
          create: catData,
        });
      }
      results.categories = data.categories.length;
    }

    return NextResponse.json({
      success: true,
      restored: results,
      message: 'Backup restored successfully',
    });
  } catch (error) {
    console.error('Backup POST error:', error);
    return NextResponse.json({ error: 'Restore failed' }, { status: 500 });
  }
}
