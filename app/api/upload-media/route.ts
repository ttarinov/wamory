import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import { join, resolve, extname } from 'path';
import { createHash } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const chatId = String(form.get('chatId') || '');
    const files = form.getAll('files') as File[];

    if (!chatId || !files.length) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const base = resolve(join(process.cwd(), 'data', 'media'));
    const targetDir = join(base, chatId);
    await mkdir(targetDir, { recursive: true });

    const copied: Record<string, string> = {};

    for (const file of files) {
      const originalName = file.name;
      const ext = extname(originalName).toLowerCase();
      const buf = Buffer.from(await file.arrayBuffer());
      const hash = createHash('sha1').update(buf).digest('hex').slice(0, 16);
      const destName = `${hash}${ext || ''}`;
      const dest = join(targetDir, destName);

      await writeFile(dest, buf);
      copied[originalName] = `/api/media/${chatId}/${destName}`;
    }

    return NextResponse.json({ copied });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
  }
}



