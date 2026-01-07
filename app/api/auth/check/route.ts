import { NextRequest, NextResponse } from 'next/server';
import { head } from '@vercel/blob';
import { getStorageService, StorageMode } from '@/lib/services/storage-service';
import { CHATS_BLOB_PATH } from '@/lib/constants/api-constants';

function getStorageMode(request: NextRequest): StorageMode {
  const mode = request.headers.get('storage-mode') || request.nextUrl.searchParams.get('storage-mode');
  return (mode === 'local' ? 'local' : 'blob') as StorageMode;
}

export async function GET(request: NextRequest) {
  try {
    const storageMode = getStorageMode(request);

    if (storageMode === 'local') {
      const storageService = getStorageService('local');
      const exists = await storageService.exists(CHATS_BLOB_PATH);
      return NextResponse.json({ hasData: exists });
    } else {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json({ hasData: false });
      }

      try {
        await head(CHATS_BLOB_PATH, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        return NextResponse.json({ hasData: true });
      } catch (error) {
        return NextResponse.json({ hasData: false });
      }
    }
  } catch (error) {
    return NextResponse.json({ hasData: false });
  }
}
