import { put, del, head, list } from '@vercel/blob';

export class BlobStorageService {
  async exists(path: string): Promise<boolean> {
    try {
      await head(path);
      return true;
    } catch {
      return false;
    }
  }

  async read(path: string): Promise<string | null> {
    try {
      const response = await fetch(path);
      if (!response.ok) return null;
      return await response.text();
    } catch {
      return null;
    }
  }

  async write(path: string, data: string): Promise<string> {
    const blob = await put(path, data, {
      access: 'public',
      addRandomSuffix: false,
    });
    return blob.url;
  }

  async uploadMedia(chatId: string, file: File | Buffer, filename: string): Promise<string> {
    const path = `encrypted-media/${chatId}/${filename}`;
    const blob = await put(path, file, {
      access: 'public',
      addRandomSuffix: false,
    });
    return blob.url;
  }

  async deleteFile(path: string): Promise<void> {
    await del(path);
  }

  async listMedia(chatId: string): Promise<string[]> {
    const { blobs } = await list({ prefix: `encrypted-media/${chatId}/` });
    return blobs.map((blob) => blob.url);
  }
}
