import type JSZip from 'jszip';
import { EncryptionService } from './encryption-service';
import { findZipEntry } from '../utils/chat-utils';

export class MediaImportService {
  /**
   * Copy media files from filesystem directory
   * Uses the /api/copy-media endpoint
   */
  static async copyFromFilesystem(
    sourceDir: string,
    chatId: string,
    files: string[]
  ): Promise<Record<string, string> | null> {
    if (files.length === 0) return null;

    try {
      const response = await fetch('/api/copy-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceDir,
          chatId,
          files,
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return (data?.copied || {}) as Record<string, string>;
    } catch (error) {
      console.error('Failed to copy media from filesystem:', error);
      return null;
    }
  }

  /**
   * Upload encrypted media from ZIP archive
   * Extracts files from zip, encrypts them, and uploads via /api/upload-media
   */
  static async uploadEncryptedFromZip(
    zip: JSZip,
    chatId: string,
    files: string[],
    encryptionKey: CryptoKey,
    storageMode: 'blob' | 'local' = 'blob'
  ): Promise<Record<string, string> | null> {
    if (files.length === 0) return null;

    try {
      const form = new FormData();
      form.append('chatId', chatId);

      const toUpload: string[] = [];

      for (const fileName of files) {
        const entry = findZipEntry(zip, fileName);
        if (!entry) continue;

        const bytes = await entry.async('uint8array');

        // Encrypt the media
        const encryptedBase64 = await EncryptionService.encrypt(bytes, encryptionKey);
        const encryptedBytes = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
        const encryptedBlob = new Blob([encryptedBytes], {
          type: 'application/octet-stream',
        });

        form.append('files', encryptedBlob, fileName);
        toUpload.push(fileName);
      }

      if (toUpload.length === 0) return null;

      const response = await fetch('/api/upload-media', {
        method: 'POST',
        headers: {
          'storage-mode': storageMode,
        },
        body: form,
      });

      if (!response.ok) return null;

      const data = await response.json();
      return (data?.copied || {}) as Record<string, string>;
    } catch (error) {
      console.error('Failed to upload encrypted media from zip:', error);
      return null;
    }
  }
}
