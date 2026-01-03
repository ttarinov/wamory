import { NextRequest, NextResponse } from 'next/server';
import { put, head, list } from '@vercel/blob';

const CHATS_BLOB_PATH = 'chats.json.enc';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 200;

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

async function getChatsData(): Promise<string | null> {
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
    const data = await getChatsData();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ data: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error: 'BLOB_READ_WRITE_TOKEN is not configured. Please set it in your .env.local file. See README.md for instructions.',
        },
        { status: 500 }
      );
    }

    const { data, keyHash } = await request.json();

    if (data === undefined || data === null) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    if (!data || data.trim() === '') {
      return NextResponse.json({ error: 'Data cannot be empty' }, { status: 400 });
    }

    const chatsBlob = await put(CHATS_BLOB_PATH, data, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (keyHash) {
      await put('key-hash.txt', keyHash, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    }

    return NextResponse.json({ success: true, url: chatsBlob.url });
  } catch (error) {
    console.error('Error saving chats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save chats' },
      { status: 500 }
    );
  }
}
