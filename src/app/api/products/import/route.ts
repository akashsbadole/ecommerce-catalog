import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type Platform = 'generic' | 'woocommerce' | 'shopify';

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(current.trim());
        current = '';
      } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        row.push(current.trim());
        current = '';
        if (row.length > 0 && row.some(cell => cell !== '')) {
          rows.push(row);
        }
        row = [];
        if (ch === '\r') i++;
      } else {
        current += ch;
      }
    }
  }

  if (current || row.length > 0) {
    row.push(current.trim());
    if (row.some(cell => cell !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

function detectPlatform(headers: string[]): Platform {
  const headerSet = new Set(headers.map(h => h.toLowerCase().trim()));
  const woocommerceHeaders = ['post_title', 'post_name', 'post_status', 'regular_price', 'tax:product_cat'];
  const isWooCommerce = woocommerceHeaders.some(h => headerSet.has(h));
  const shopifyHeaders = ['handle', 'title', 'variant price'];
  const isShopify = shopifyHeaders.some(h => headerSet.has(h));
  if (isWooCommerce) return 'woocommerce';
  if (isShopify) return 'shopify';
  return 'generic';
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function getOrCreateCategory(categoryName: string): Promise<string | null> {
  if (!categoryName || categoryName.trim() === '') return null;
  const trimmed = categoryName.trim();
  const slug = generateSlug(trimmed);
  let category = await db.category.findFirst({
    where: {
      OR: [
        { name: { equals: trimmed, mode: 'insensitive' } },
        { slug: { equals: slug, mode: 'insensitive' } }
      ]
    }
  });
  if (category) return category.id;
  category = await db.category.create({
    data: { name: trimmed, slug, isActive: true }
  });
  return category.id;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const platformParam = formData.get('platform') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Only CSV files are accepted' }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length < 2) {
      return NextResponse.json({ error: 'CSV must have a header row and at least one data row' }, { status: 400 });
    }

    const headers = rows[0].map(h => h.trim());
    const detectedPlatform: Platform = platformParam === 'auto' || !platformParam 
      ? detectPlatform(headers)
      : (platformParam as Platform);
    
    const errors: string[] = [];
    let imported = 0;

    const shopifyProducts = new Map<string, { 
      name: string; 
      slug: string; 
      description: string; 
      sku: string; 
      price: string; 
      comparePrice: string;
      category: string;
      stock: string;
      images: string[];
      seoTitle: string;
      seoDescription: string;
    }>();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0 || row.every(cell => cell === '')) continue;

      const getValue = (field: string) => {
        const idx = headers.findIndex(h => h.toLowerCase().trim() === field.toLowerCase());
        return idx >= 0 && idx < row.length ? row[idx] : '';
      };

      if (detectedPlatform === 'woocommerce') {
        const name = getValue('post_title');
        if (!name) {
          errors.push(`Row ${i}: Missing product name (post_title)`);
          continue;
        }

        const priceStr = getValue('regular_price');
        if (!priceStr) {
          errors.push(`Row ${i}: Missing regular price`);
          continue;
        }

        const price = parseFloat(priceStr);
        if (isNaN(price)) {
          errors.push(`Row ${i}: Invalid price`);
          continue;
        }

        const slug = getValue('post_name') || generateSlug(name);
        const postStatus = getValue('post_status')?.toLowerCase();
        const isActive = postStatus === 'publish';

        const imagesStr = getValue('images') || getValue('Images');
        const images = imagesStr ? imagesStr.split(/[,|]/).map((s: string) => s.trim()).filter(Boolean) : [];

        const categoryName = getValue('tax:product_cat');
        const categoryId = await getOrCreateCategory(categoryName);

        const data = {
          name,
          slug,
          description: getValue('description') || getValue('Description') || null,
          shortDescription: getValue('shortDescription') || getValue('Short description') || null,
          price,
          comparePrice: parseFloat(getValue('sale_price')) || null,
          wholesalePrice: parseFloat(getValue('wholesale_price')) || null,
          minOrderQty: parseInt(getValue('minOrderQty')) || 1,
          sku: getValue('sku') || null,
          images: JSON.stringify(images),
          categoryId,
          whatsappNumber: null,
          isFeatured: false,
          isActive,
          sortOrder: parseInt(getValue('sortOrder')) || 0,
          stock: parseInt(getValue('stock')) || 0,
          lowStockThreshold: parseInt(getValue('lowStockThreshold')) || 10,
          specifications: null,
          metaTitle: null,
          metaDescription: null,
        };

        try {
          const existing = await db.product.findUnique({ where: { slug } });
          if (existing) {
            const uniqueSlug = `${slug}--`;
            data.slug = uniqueSlug;
          }
          await db.product.create({ data });
          imported++;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          errors.push(`Row ${i}: ${msg}`);
        }
      } else if (detectedPlatform === 'shopify') {
        const handle = getValue('Handle');
        const title = getValue('Title');
        if (!handle && !title) continue;

        const rowPrice = getValue('Variant Price');
        const rowSku = getValue('Variant SKU');
        const rowImage = getValue('Image Src');

        if (shopifyProducts.has(handle)) {
          const existing = shopifyProducts.get(handle)!;
          if (rowImage && !existing.images.includes(rowImage)) {
            existing.images.push(rowImage);
          }
        } else {
          shopifyProducts.set(handle, {
            name: title || handle,
            slug: handle,
            description: getValue('Body (HTML)') || '',
            sku: rowSku || '',
            price: rowPrice || '',
            comparePrice: getValue('Variant Compare At Price') || '',
            category: getValue('Type') || '',
            stock: getValue('Variant Inventory Qty') || '0',
            images: rowImage ? [rowImage] : [],
            seoTitle: getValue('SEO Title') || '',
            seoDescription: getValue('SEO Description') || ''
          });
        }
      } else {
        const name = getValue('name');
        if (!name) {
          errors.push(`Row ${i}: Missing product name`);
          continue;
        }

        const price = parseFloat(getValue('price'));
        if (isNaN(price)) {
          errors.push(`Row ${i}: Invalid price`);
          continue;
        }

        const slug = getValue('slug') || generateSlug(name);
        const categoryId = getValue('categoryid') || null;

        const imagesStr = getValue('images') || getValue('Images');
        const images = imagesStr ? imagesStr.split(/[,|]/).map((s: string) => s.trim()).filter(Boolean) : [];

        const data = {
          name,
          slug,
          description: getValue('description') || null,
          shortDescription: getValue('shortDescription') || null,
          price,
          comparePrice: parseFloat(getValue('comparePrice')) || null,
          wholesalePrice: parseFloat(getValue('wholesalePrice')) || null,
          minOrderQty: parseInt(getValue('minOrderQty')) || 1,
          sku: getValue('sku') || null,
          images: JSON.stringify(images),
          categoryId,
          whatsappNumber: getValue('whatsappNumber') || null,
          isFeatured: getValue('isFeatured')?.toLowerCase() === 'true',
          isActive: getValue('isActive')?.toLowerCase() !== 'false',
          sortOrder: parseInt(getValue('sortOrder')) || 0,
          stock: parseInt(getValue('stock')) || 0,
          lowStockThreshold: parseInt(getValue('lowStockThreshold')) || 10,
          specifications: null,
          metaTitle: null,
          metaDescription: null,
        };

        try {
          const existing = await db.product.findUnique({ where: { slug } });
          if (existing) {
            const uniqueSlug = `${slug}--`;
            data.slug = uniqueSlug;
          }
          await db.product.create({ data });
          imported++;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          errors.push(`Row ${i}: ${msg}`);
        }
      }
    }

    if (detectedPlatform === 'shopify') {
      for (const [, product] of shopifyProducts) {
        if (!product.name || product.price === '') continue;

        const price = parseFloat(product.price);
        if (isNaN(price)) continue;

        const categoryId = await getOrCreateCategory(product.category);

        const data = {
          name: product.name,
          slug: product.slug || generateSlug(product.name),
          description: product.description || null,
          shortDescription: null,
          price,
          comparePrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
          wholesalePrice: null,
          minOrderQty: 1,
          sku: product.sku || null,
          images: JSON.stringify(product.images),
          categoryId,
          whatsappNumber: null,
          isFeatured: false,
          isActive: true,
          sortOrder: 0,
          stock: parseInt(product.stock) || 0,
          lowStockThreshold: 10,
          specifications: null,
          metaTitle: product.seoTitle || null,
          metaDescription: product.seoDescription || null,
        };

        try {
          const existing = await db.product.findUnique({ where: { slug: data.slug } });
          if (existing) {
            const uniqueSlug = `${data.slug}--`;
            data.slug = uniqueSlug;
          }
          await db.product.create({ data });
          imported++;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          errors.push(`Product ${product.slug}: ${msg}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      errors,
      platform: detectedPlatform
    });
  } catch (error) {
    console.error('Import products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}