import { NextRequest, NextResponse } from 'next/server';
import { head, list } from '@vercel/blob';

export async function POST(request: NextRequest) {
  const { keyHash } = await request.json();
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'BLOB_READ_WRITE_TOKEN is not configured' }, { status: 500 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    let storedHash: string;

    if (process.env.BLOB_KEY_HASH_URL) {
      const response = await fetch(process.env.BLOB_KEY_HASH_URL);
      if (!response.ok) {
        return NextResponse.json({ error: 'No hash found' }, { status: 404 });
      }
      storedHash = await response.text();
    } else {
      try {
        await head('key-hash.txt', { token });
        const { blobs } = await list({ 
          prefix: 'key-hash.txt',
          token 
        });
        const keyHashBlob = blobs.find(b => b.pathname === 'key-hash.txt');
        if (keyHashBlob) {
          const response = await fetch(keyHashBlob.url);
          if (response.ok) {
            storedHash = await response.text();
          } else {
            return NextResponse.json({ error: 'No hash found' }, { status: 404 });
          }
        } else {
          return NextResponse.json({ error: 'No hash found' }, { status: 404 });
        }
      } catch (error) {
        return NextResponse.json({ error: 'No hash found' }, { status: 404 });
      }
    }

    const isValid = keyHash === storedHash.trim();

    return NextResponse.json({ isValid });
  } catch (error) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}
