import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { extname } from 'path';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'BLOB_READ_WRITE_TOKEN is not configured' },
        { status: 500 }
      );
    }

    const form = await request.formData();
    const chatId = String(form.get('chatId') || '');
    const files = form.getAll('files') as File[];

    if (!chatId || !files.length) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
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
  } catch (error) {
    console.error('Upload media error:', error);
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
  }
}
