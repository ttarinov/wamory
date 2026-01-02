import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const chatId = formData.get('chatId') as string;

  if (!file || !chatId) {
    return NextResponse.json({ error: 'Missing file or chatId' }, { status: 400 });
  }

  const path = `media/${chatId}/${file.name}`;
  const blob = await put(path, file, {
    access: 'public',
    addRandomSuffix: false,
  });

  return NextResponse.json({ url: blob.url });
}
