import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function GET() {
  try {
    const url = process.env.BLOB_CHATS_URL;
    if (!url) {
      return NextResponse.json({ data: null });
    }

    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ data: null });
    }

    const encryptedData = await response.text();
    return NextResponse.json({ data: encryptedData });
  } catch {
    return NextResponse.json({ data: null });
  }
}

export async function POST(request: NextRequest) {
  const { data, keyHash } = await request.json();

  if (!data) {
    return NextResponse.json({ error: 'No data provided' }, { status: 400 });
  }

  const chatsBlob = await put('chats.json.enc', data, {
    access: 'public',
    addRandomSuffix: false,
  });

  if (keyHash) {
    await put('key-hash.txt', keyHash, {
      access: 'public',
      addRandomSuffix: false,
    });
  }

  return NextResponse.json({ success: true, url: chatsBlob.url });
}
