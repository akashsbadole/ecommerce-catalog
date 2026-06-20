import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { put } from '@vercel/blob';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAdminAuth } from '@/lib/admin-auth';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];
const MAX_FILES_PER_REQUEST = 20;

const UPLOAD_RATE_LIMIT = { maxRequests: 30, windowMs: 60 * 60 * 1000, prefix: 'upload' };

function isVercelBlobConfigured(): boolean {
  return !!(process.env.BLOB_READ_WRITE_TOKEN);
}

async function uploadToBlob(file: File, folder: string): Promise<{ url: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
  const pathname = folder === '/' ? filename : `${folder}/${filename}`;
  const blob = await put(pathname, buffer, {
    access: 'public',
    contentType: file.type,
  });
  return { url: blob.url };
}

async function uploadToLocal(file: File, folder: string): Promise<{ url: string }> {
  const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
  const safeFolder = folder.replace(/\.\./g, '').replace(/^\/+/, '').replace(/\/+$/, '') || '/';
  const targetDir = path.join(UPLOAD_DIR, safeFolder);
  await mkdir(targetDir, { recursive: true });

  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
  const filepath = path.join(targetDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  const url = `/uploads${safeFolder === '/' ? '' : `/${safeFolder}`}/${filename}`;
  return { url };
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;
    const rateLimitResponse = checkRateLimit(request, UPLOAD_RATE_LIMIT);
    if (rateLimitResponse) return rateLimitResponse;

    const formData = await request.formData();
    const folder = (formData.get('folder') as string) || '/';
    const files = [
      ...(formData.getAll('files') as File[]),
      ...(formData.getAll('file') as File[]),
    ];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json({ error: `Too many files (max ${MAX_FILES_PER_REQUEST})` }, { status: 400 });
    }

    const useBlob = isVercelBlobConfigured();
    const safeFolder = folder.replace(/\.\./g, '').replace(/^\/+/, '').replace(/\/+$/, '') || '/';

    const results: Array<{ filename: string; id?: string; url?: string; size?: number; error?: string }> = [];

    for (const file of files) {
      try {
        if (file.size > MAX_FILE_SIZE) {
          results.push({ filename: file.name, error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` });
          continue;
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
          results.push({ filename: file.name, error: `File type not allowed. Allowed: images, PDF, CSV, Excel` });
          continue;
        }

        const { url } = useBlob
          ? await uploadToBlob(file, safeFolder)
          : await uploadToLocal(file, safeFolder);

        const media = await db.media.create({
          data: {
            filename: path.basename(url),
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            url,
            folder: safeFolder,
          },
        });

        results.push({ filename: file.name, id: media.id, url, size: file.size });
      } catch (error) {
        console.error('Upload error for file:', file.name, error);
        results.push({ filename: file.name, error: 'Upload failed' });
      }
    }

    const firstSuccess = results.find(r => r.url);
    return NextResponse.json({
      files: results,
      url: firstSuccess?.url,
      id: firstSuccess?.id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
