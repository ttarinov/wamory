import { NextResponse } from 'next/server';
import { head } from '@vercel/blob';

export async function GET() {
  try {
    await head('key-hash.txt');
    return NextResponse.json({ hasData: true });
  } catch {
    return NextResponse.json({ hasData: false });
  }
}
