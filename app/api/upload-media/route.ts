import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { extname } from 'path';
import { createHash } from 'crypto';
import { createErrorResponse, ValidationError } from '@/lib/errors/app-errors';
import { getStorageService, StorageMode } from '@/lib/services/storage-service';

function getStorageMode(request: NextRequest): StorageMode {
  const mode = request.headers.get('storage-mode') || request.nextUrl.searchParams.get('storage-mode');
  return (mode === 'local' ? 'local' : 'blob') as StorageMode;
}

export async function POST(request: NextRequest) {
  try {
    const storageMode = getStorageMode(request);
    const form = await request.formData();
    const chatId = String(form.get('chatId') || '');
    const files = form.getAll('files') as File[];

    if (!chatId || !files.length) {
      return NextResponse.json(createErrorResponse(new ValidationError('Invalid request')), { status: 400 });
    }

    if (storageMode === 'local') {
      const storageService = getStorageService('local');
      const copied: Record<string, string> = {};

      for (const file of files) {
        const originalName = file.name;
        const ext = extname(originalName).toLowerCase();
        const buf = Buffer.from(await file.arrayBuffer());
        const hash = createHash('sha1').update(buf).digest('hex').slice(0, 16);
        const destName = `${hash}${ext || ''}`;

        const url = await storageService.uploadMedia(chatId, buf, destName);
        copied[originalName] = url;
      }

      return NextResponse.json({ copied });
    } else {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json(
          createErrorResponse(new Error('BLOB_READ_WRITE_TOKEN is not configured')),
          { status: 500 }
        );
      }

      const copied: Record<string, string> = {};

      for (const file of files) {
        const originalName = file.name;
        const ext = extname(originalName).toLowerCase();
        const buf = Buffer.from(await file.arrayBuffer());
        const hash = createHash('sha1').update(buf).digest('hex').slice(0, 16);
        const destName = `${hash}${ext || ''}`;

        const blob = await put(`encrypted-media/${chatId}/${destName}`, buf, {
          access: 'public',
          addRandomSuffix: false,
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        copied[originalName] = blob.url;
      }

      return NextResponse.json({ copied });
    }
  } catch (error) {
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}
