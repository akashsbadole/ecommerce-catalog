import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

// Max 20 uploads per hour per IP (POST only)
const UPLOAD_RATE_LIMIT = { maxRequests: 20, windowMs: 60 * 60 * 1000, prefix: 'upload-post' };

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const SIZES = {
  thumbnail: 200,
  small: 400,
  medium: 800,
  large: 1200,
};

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
  };
  return map[mimeType] || '.jpg';
}

async function ensureUploadsDir() {
  if (!existsSync(UPLOADS_DIR)) {
    await mkdir(UPLOADS_DIR, { recursive: true });
  }
}

async function processImage(
  buffer: Buffer,
  originalName: string,
  mimeType: string
) {
  await ensureUploadsDir();

  const timestamp = Date.now();
  const random = uuidv4().slice(0, 8);
  const ext = getExtension(mimeType);
  const filename = `${timestamp}-${random}${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);
  const url = `/uploads/${filename}`;

  // Get original dimensions
  let metadata: Partial<sharp.Metadata> = {};
  let width: number | null = null;
  let height: number | null = null;

  if (mimeType !== 'image/svg+xml') {
    const image = sharp(buffer);
    metadata = await image.metadata();
    width = metadata.width || null;
    height = metadata.height || null;
  }

  // Save original file
  await writeFile(filePath, buffer);

  // Generate thumbnails for raster images (skip SVG and GIF)
  const thumbnails: Record<string, string> = {};

  if (mimeType !== 'image/svg+xml' && mimeType !== 'image/gif' && width && height) {
    for (const [sizeName, maxSize] of Object.entries(SIZES)) {
      try {
        const thumbFilename = `${timestamp}-${random}-${sizeName}${ext}`;
        const thumbPath = path.join(UPLOADS_DIR, thumbFilename);
        const thumbUrl = `/uploads/${thumbFilename}`;

        await sharp(buffer)
          .rotate() // auto-strip EXIF, auto-orient
          .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true })
          .toFile(thumbPath);

        thumbnails[sizeName] = thumbUrl;
      } catch (err) {
        console.error(`Failed to create ${sizeName} thumbnail:`, err);
      }
    }

    // Generate WebP version for non-SVG, non-GIF images (JPEG, PNG)
    if (mimeType === 'image/jpeg' || mimeType === 'image/png') {
      try {
        const webpFilename = `${timestamp}-${random}.webp`;
        const webpPath = path.join(UPLOADS_DIR, webpFilename);
        const webpUrl = `/uploads/${webpFilename}`;

        await sharp(buffer)
          .rotate() // auto-strip EXIF, auto-orient
          .webp({ quality: 80 })
          .toFile(webpPath);

        thumbnails['webp'] = webpUrl;
      } catch (err) {
        console.error('Failed to create WebP version:', err);
      }
    }
  }

  // Save to database
  const media = await db.media.create({
    data: {
      filename,
      originalName,
      mimeType,
      size: buffer.length,
      width,
      height,
      url,
      thumbnails: JSON.stringify(thumbnails),
    },
  });

  return media;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = checkRateLimit(request, UPLOAD_RATE_LIMIT);
    if (rateLimitResponse) return rateLimitResponse;
    const formData = await request.formData();
    const files: File[] = [];

    // Support both single file and multiple files
    const singleFile = formData.get('file');
    const multiFiles = formData.getAll('files');

    if (singleFile && singleFile instanceof File) {
      files.push(singleFile);
    }
    for (const f of multiFiles) {
      if (f instanceof File) {
        files.push(f);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const results: Awaited<ReturnType<typeof processImage>>[] = [];

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed: jpeg, png, gif, webp, svg` },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum: 10MB` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const media = await processImage(buffer, file.name, file.type);
      results.push(media);
    }

    if (results.length === 1) {
      return NextResponse.json({
        url: results[0].url,
        media: results[0],
        thumbnails: JSON.parse(results[0].thumbnails),
      });
    }

    return NextResponse.json({
      media: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, alt, folder } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const media = await db.media.findUnique({ where: { id } });
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const updated = await db.media.update({
      where: { id },
      data: {
        ...(alt !== undefined && { alt }),
        ...(folder !== undefined && { folder }),
      },
    });

    return NextResponse.json({ media: updated });
  } catch (error) {
    console.error('Update media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const media = await db.media.findUnique({ where: { id } });
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete physical files
    const filesToDelete = [media.url];
    try {
      const thumbs = JSON.parse(media.thumbnails);
      filesToDelete.push(...(Object.values(thumbs) as string[]));
    } catch {}

    for (const filePath of filesToDelete) {
      try {
        const fullPath = path.join(process.cwd(), 'public', filePath);
        const { unlink } = await import('fs/promises');
        await unlink(fullPath);
      } catch {
        // File may not exist, ignore
      }
    }

    await db.media.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
