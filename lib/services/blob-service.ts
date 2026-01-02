import { put, del, head, list } from '@vercel/blob';

export class BlobService {
  static async exists(path: string): Promise<boolean> {
    try {
      await head(path);
      return true;
    } catch {
      return false;
    }
  }

  static async read(path: string): Promise<string | null> {
    try {
      const response = await fetch(path);
      if (!response.ok) return null;
      return await response.text();
    } catch {
      return null;
    }
  }

  static async write(path: string, data: string): Promise<string> {
    const blob = await put(path, data, {
      access: 'public',
      addRandomSuffix: false,
    });
    return blob.url;
  }

  static async uploadMedia(chatId: string, file: File): Promise<string> {
    const path = `media/${chatId}/${file.name}`;
    const blob = await put(path, file, {
      access: 'public',
      addRandomSuffix: false,
    });
    return blob.url;
  }

  static async deleteBlob(url: string): Promise<void> {
    await del(url);
  }

  static async listMedia(chatId: string): Promise<string[]> {
    const { blobs } = await list({ prefix: `media/${chatId}/` });
    return blobs.map((blob) => blob.url);
  }
}
