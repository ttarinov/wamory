import { NextResponse } from 'next/server';
import { head } from '@vercel/blob';

export async function GET() {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ hasData: false });
    }

    await head('chats.json.enc', {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.json({ hasData: true });
  } catch (error) {
    return NextResponse.json({ hasData: false });
  }
}
