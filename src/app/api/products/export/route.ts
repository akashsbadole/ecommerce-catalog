import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_request: NextRequest) {
  try {
    const products = await db.product.findMany({
      where: { deletedAt: null },
      include: { category: true },
      orderBy: { sortOrder: 'asc' },
    });

    const headers = [
      'name',
      'slug',
      'description',
      'shortDescription',
      'price',
      'comparePrice',
      'wholesalePrice',
      'minOrderQty',
      'sku',
      'categoryId',
      'categoryName',
      'isFeatured',
      'isActive',
      'sortOrder',
      'stock',
      'lowStockThreshold',
      'whatsappNumber',
    ];

    function escapeCSVField(val: string | number | boolean | null | undefined): string {
      const str = val === null || val === undefined ? '' : String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }

    const rows = products.map((p) => [
      escapeCSVField(p.name),
      escapeCSVField(p.slug),
      escapeCSVField(p.description),
      escapeCSVField(p.shortDescription),
      escapeCSVField(p.price),
      escapeCSVField(p.comparePrice),
      escapeCSVField(p.wholesalePrice),
      escapeCSVField(p.minOrderQty),
      escapeCSVField(p.sku),
      escapeCSVField(p.categoryId),
      escapeCSVField(p.category?.name || ''),
      escapeCSVField(p.isFeatured),
      escapeCSVField(p.isActive),
      escapeCSVField(p.sortOrder),
      escapeCSVField(p.stock),
      escapeCSVField(p.lowStockThreshold),
      escapeCSVField(p.whatsappNumber),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
