import { NextResponse } from 'next/server';
import { del, head } from '@vercel/blob';

export async function POST() {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'BLOB_READ_WRITE_TOKEN is not configured' },
        { status: 500 }
      );
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;

    try {
      await head('chats.json.enc', { token });
      await del('chats.json.enc', { token });
    } catch (error) {
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reset data' },
      { status: 500 }
    );
  }
}
