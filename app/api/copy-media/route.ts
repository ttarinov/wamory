import { NextRequest, NextResponse } from 'next/server';
import { copyFile, mkdir, readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { basename, extname, join, resolve } from 'path';
import { createHash } from 'crypto';
import { isPathInBase } from '@/lib/utils/path-security';

async function isDirectory(path: string) {
  try {
    const s = await stat(path);
    return s.isDirectory();
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sourceDir = String(body?.sourceDir || '');
    const chatId = String(body?.chatId || '');
    const files = Array.isArray(body?.files) ? body.files.map(String) : [];

    if (!sourceDir || !chatId || files.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const rawBase = resolve(join(process.cwd(), 'data', 'raw'));

    if (!isPathInBase(sourceDir, rawBase)) {
      return NextResponse.json({ error: 'Invalid sourceDir' }, { status: 403 });
    }

    const resolvedSource = resolve(sourceDir);

    if (!(await isDirectory(resolvedSource))) {
      return NextResponse.json({ error: 'sourceDir not found' }, { status: 404 });
    }

    const targetDir = join(process.cwd(), 'data', 'media', chatId);
    await mkdir(targetDir, { recursive: true });

    const copied: Record<string, string> = {};
    const skipped: string[] = [];

    for (const requested of files) {
      const name = basename(requested);
      const src = join(resolvedSource, name);
      if (!existsSync(src)) {
        skipped.push(requested);
        continue;
      }

      const ext = extname(name).toLowerCase();
      const buf = await readFile(src);
      const hash = createHash('sha1').update(buf).digest('hex').slice(0, 16);
      const destName = `${hash}${ext || ''}`;
      const dest = join(targetDir, destName);

      if (!existsSync(dest)) {
        await copyFile(src, dest);
      }

      copied[requested] = `/api/media/${chatId}/${destName}`;
    }

    return NextResponse.json({ copied, skipped });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to copy media' },
      { status: 500 }
    );
  }
}


