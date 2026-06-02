import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = (formData.get('folder') as string) || '/';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Ensure upload directory exists
    const targetDir = path.join(UPLOAD_DIR, folder);
    await mkdir(targetDir, { recursive: true });

    const results: Array<{ filename: string; id?: string; url?: string; size?: number; error?: string }> = [];

    for (const file of files) {
      try {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          results.push({ filename: file.name, error: 'File too large (max 10MB)' });
          continue;
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
          results.push({ filename: file.name, error: 'File type not allowed' });
          continue;
        }

        // Generate unique filename
        const ext = path.extname(file.name);
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        const filepath = path.join(targetDir, filename);

        // Write file
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filepath, buffer);

        // Save to database
        const url = `/uploads${folder === '/' ? '' : folder}/${filename}`;
        const media = await db.media.create({
          data: {
            filename,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            url,
            folder,
          },
        });

        results.push({ filename: file.name, id: media.id, url, size: file.size });
      } catch (error) {
        results.push({ filename: file.name, error: 'Upload failed' });
      }
    }

    return NextResponse.json({ files: results });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
