import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { extractPhoneFromFilename } from '@/lib/utils/phone';

interface ImportFile {
  path: string;
  name: string;
  type: 'zip' | 'folder' | 'file';
  phoneNumber: string;
}

export async function GET() {
  try {
    const dataRawPath = join(process.cwd(), 'data', 'raw');

    if (!existsSync(dataRawPath)) {
      return NextResponse.json({ files: [] });
    }

    const entries = await readdir(dataRawPath);
    const files: ImportFile[] = [];

    for (const entry of entries) {
      const fullPath = join(dataRawPath, entry);
      const stats = await stat(fullPath);

      if (entry.startsWith('.')) continue;

      const phoneNumber = extractPhoneFromFilename(entry);
      if (!phoneNumber) continue;

      if (entry.endsWith('.zip')) {
        files.push({
          path: fullPath,
          name: entry,
          type: 'zip',
          phoneNumber,
        });
      } else if (stats.isDirectory()) {
        // Check if _chat.txt exists in this folder
        const chatFilePath = join(fullPath, '_chat.txt');
        if (existsSync(chatFilePath)) {
          files.push({
            path: fullPath,
            name: entry,
            type: 'folder',
            phoneNumber,
          });
        }
      }
    }

    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to scan chats directory' },
      { status: 500 }
    );
  }
}
