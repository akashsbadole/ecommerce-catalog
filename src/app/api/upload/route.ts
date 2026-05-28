import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

const SIZES = {
  thumbnail: { width: 200, height: 200, fit: 'cover' as const },
  small: { width: 400, height: 400, fit: 'inside' as const },
  medium: { width: 800, height: 800, fit: 'inside' as const },
  large: { width: 1200, height: 1200, fit: 'inside' as const },
};

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir();
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const results = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        results.push({ name: file.name, error: 'Only images are supported' });
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        results.push({ name: file.name, error: 'File too large (max 10MB)' });
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = path.extname(file.name) || '.jpg';
      const uniqueName = `${uuidv4()}${ext}`;
      const filePath = path.join(UPLOAD_DIR, uniqueName);

      await writeFile(filePath, buffer);

      // Get image metadata
      const metadata = await sharp(buffer).metadata();
      const thumbnails: Record<string, string> = {};

      // Generate resized versions
      for (const [sizeName, sizeConfig] of Object.entries(SIZES)) {
        const thumbName = `${uuidv4()}_${sizeName}${ext}`;
        const thumbPath = path.join(UPLOAD_DIR, thumbName);
        await sharp(buffer)
          .resize(sizeConfig)
          .toFile(thumbPath);
        thumbnails[sizeName] = `/uploads/${thumbName}`;
      }

      // Save to database
      const media = await db.media.create({
        data: {
          filename: uniqueName,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          width: metadata.width || null,
          height: metadata.height || null,
          url: `/uploads/${uniqueName}`,
          thumbnails: JSON.stringify(thumbnails),
        },
      });

      results.push({
        id: media.id,
        name: file.name,
        url: `/uploads/${uniqueName}`,
        thumbnails,
        size: file.size,
        width: metadata.width,
        height: metadata.height,
      });
    }

    return NextResponse.json({ files: results }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
