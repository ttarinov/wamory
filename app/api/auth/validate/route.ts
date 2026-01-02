import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { keyHash } = await request.json();

  try {
    const response = await fetch(process.env.BLOB_KEY_HASH_URL || '');
    if (!response.ok) {
      return NextResponse.json({ error: 'No hash found' }, { status: 404 });
    }

    const storedHash = await response.text();
    const isValid = keyHash === storedHash.trim();

    return NextResponse.json({ isValid });
  } catch {
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}
