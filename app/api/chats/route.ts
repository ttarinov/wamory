import { NextRequest, NextResponse } from 'next/server';
import { put, head, list } from '@vercel/blob';
import { CHATS_BLOB_PATH, MAX_RETRIES, RETRY_DELAY_MS } from '@/lib/constants/api-constants';
import { createErrorResponse, ValidationError } from '@/lib/errors/app-errors';
import { getStorageService, StorageMode } from '@/lib/services/storage-service';

function getStorageMode(request: NextRequest): StorageMode {
  const mode = request.headers.get('storage-mode') || request.nextUrl.searchParams.get('storage-mode');
  return (mode === 'local' ? 'local' : 'blob') as StorageMode;
}

async function fetchBlobData(url: string, retries = MAX_RETRIES): Promise<string | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
      }
      
      const response = await fetch(url);
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      if (attempt === retries - 1) {
        return null;
      }
    }
  }
  return null;
}

async function findChatsBlob(): Promise<{ url: string; downloadUrl?: string } | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return null;
  }

  try {
    const { blobs } = await list({
      prefix: CHATS_BLOB_PATH,
      token,
    });

    const chatsBlob = blobs.find(b => b.pathname === CHATS_BLOB_PATH);
    if (chatsBlob) {
      return {
        url: chatsBlob.url,
        downloadUrl: chatsBlob.downloadUrl,
      };
    }

    const blobInfo = await head(CHATS_BLOB_PATH, { token });
    return {
      url: blobInfo.url,
      downloadUrl: blobInfo.downloadUrl,
    };
  } catch {
    return null;
  }
}

async function getChatsDataBlob(): Promise<string | null> {
  if (process.env.BLOB_CHATS_URL) {
    return await fetchBlobData(process.env.BLOB_CHATS_URL);
  }

  const blobInfo = await findChatsBlob();
  if (!blobInfo) {
    return null;
  }

  const url = blobInfo.downloadUrl || blobInfo.url;
  return await fetchBlobData(url);
}

export async function GET(request: NextRequest) {
  try {
    const storageMode = getStorageMode(request);
    
    if (storageMode === 'local') {
      const storageService = getStorageService('local');
      const data = await storageService.read(CHATS_BLOB_PATH);
      return NextResponse.json({ data });
    } else {
      const data = await getChatsDataBlob();
      return NextResponse.json({ data });
    }
  } catch (error) {
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const storageMode = getStorageMode(request);
    const { data } = await request.json();

    if (data === undefined || data === null) {
      return NextResponse.json(createErrorResponse(new ValidationError('No data provided')), { status: 400 });
    }

    if (!data || data.trim() === '') {
      return NextResponse.json(createErrorResponse(new ValidationError('Data cannot be empty')), { status: 400 });
    }

    if (storageMode === 'local') {
      const storageService = getStorageService('local');
      const url = await storageService.write(CHATS_BLOB_PATH, data);
      return NextResponse.json({ success: true, url });
    } else {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json(
          createErrorResponse(new Error('BLOB_READ_WRITE_TOKEN is not configured. Please set it in your .env.local file. See README.md for instructions.')),
          { status: 500 }
        );
      }

      const chatsBlob = await put(CHATS_BLOB_PATH, data, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return NextResponse.json({ success: true, url: chatsBlob.url });
    }
  } catch (error) {
    return NextResponse.json(createErrorResponse(error), { status: 500 });
  }
}
