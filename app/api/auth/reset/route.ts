import { NextRequest, NextResponse } from 'next/server';
import { del, head } from '@vercel/blob';
import { getStorageService, StorageMode } from '@/lib/services/storage-service';
import { CHATS_BLOB_PATH } from '@/lib/constants/api-constants';

function getStorageMode(request: NextRequest): StorageMode {
  const mode = request.headers.get('storage-mode') || request.nextUrl.searchParams.get('storage-mode');
  return (mode === 'local' ? 'local' : 'blob') as StorageMode;
}

export async function POST(request: NextRequest) {
  try {
    const storageMode = getStorageMode(request);

    if (storageMode === 'local') {
      const storageService = getStorageService('local');
      if (storageService.deleteAll) {
        await storageService.deleteAll();
      } else {
        await storageService.deleteFile(CHATS_BLOB_PATH);
      }
      return NextResponse.json({ success: true });
    } else {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json(
          { error: 'BLOB_READ_WRITE_TOKEN is not configured' },
          { status: 500 }
        );
      }

      const token = process.env.BLOB_READ_WRITE_TOKEN;

      try {
        await head(CHATS_BLOB_PATH, { token });
        await del(CHATS_BLOB_PATH, { token });
      } catch (error) {
      }

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Error resetting data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reset data' },
      { status: 500 }
    );
  }
}
