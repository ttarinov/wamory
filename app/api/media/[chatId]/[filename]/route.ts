import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join, extname } from 'path';

const MEDIA_DIR = join(process.cwd(), 'data', 'media');

function sanitizePath(segment: string): string {
  return segment.replace(/\.\./g, '').replace(/[^a-zA-Z0-9._-]/g, '');
}

function getMimeType(filename: string): string {
  const ext = extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.wav': 'audio/wav',
    '.pdf': 'application/pdf',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string; filename: string }> }
) {
  try {
    const resolvedParams = await params;
    const decodedChatId = decodeURIComponent(resolvedParams.chatId);
    const decodedFilename = decodeURIComponent(resolvedParams.filename);
    
    const chatId = sanitizePath(decodedChatId);
    const filename = sanitizePath(decodedFilename);
    
    if (!chatId || !filename) {
      console.error('Invalid chatId or filename:', { chatId, filename, decodedChatId, decodedFilename });
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }
    
    const filePath = join(MEDIA_DIR, chatId, filename);
    
    try {
      await fs.access(filePath);
    } catch (accessError) {
      console.error('File not found at path:', filePath, 'Error:', accessError);
      const dirContents = await fs.readdir(join(MEDIA_DIR, chatId)).catch(() => []);
      console.error('Directory contents:', dirContents);
      return NextResponse.json(
        { error: 'File not found', path: filePath },
        { status: 404 }
      );
    }
    
    const fileBuffer = await fs.readFile(filePath);
    const mimeType = getMimeType(filename);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Media route error:', error);
    return NextResponse.json(
      { error: 'File not found', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 404 }
    );
  }
}
