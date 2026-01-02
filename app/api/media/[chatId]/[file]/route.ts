import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { extname, join, resolve } from 'path';

function contentTypeFromExt(ext: string) {
  switch (ext.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ chatId: string; file: string }> }
) {
  const { chatId, file } = await params;

  const base = resolve(join(process.cwd(), 'data', 'media'));
  const target = resolve(join(base, chatId, file));

  if (!target.startsWith(base)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
  }

  if (!existsSync(target)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const buf = await readFile(target);
  const ext = extname(file);

  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': contentTypeFromExt(ext),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}



