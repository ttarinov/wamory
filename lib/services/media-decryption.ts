import { EncryptionService } from './encryption-service';

export class MediaDecryptionService {
  private static decryptedCache = new Map<string, string>();

  /**
   * Decrypts an encrypted media blob URL or local file path and returns a blob URL for display
   */
  static async decryptMediaBlob(encryptedUrl: string, encryptionKey: CryptoKey): Promise<string> {
    if (this.decryptedCache.has(encryptedUrl)) {
      return this.decryptedCache.get(encryptedUrl)!;
    }

    try {
      const isLocalPath = encryptedUrl.startsWith('/api/media/');
      const fetchUrl = isLocalPath ? encryptedUrl : encryptedUrl;

      const response = await fetch(fetchUrl);
      if (!response.ok) {
        console.error('Failed to fetch media:', {
          url: encryptedUrl,
          status: response.status,
          statusText: response.statusText,
          isLocalPath,
        });
        throw new Error(`Failed to fetch encrypted media: ${response.status} ${response.statusText}`);
      }

      const encryptedArrayBuffer = await response.arrayBuffer();

      const encryptedBytes = new Uint8Array(encryptedArrayBuffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < encryptedBytes.length; i += chunkSize) {
        const chunk = encryptedBytes.subarray(i, Math.min(i + chunkSize, encryptedBytes.length));
        binary += String.fromCharCode(...chunk);
      }
      const encryptedBase64 = btoa(binary);

      const decryptedBuffer = await EncryptionService.decrypt(encryptedBase64, encryptionKey);

      const blob = new Blob([decryptedBuffer]);
      const blobUrl = URL.createObjectURL(blob);

      this.decryptedCache.set(encryptedUrl, blobUrl);

      return blobUrl;
    } catch (error) {
      console.error('Media decryption failed:', error);
      throw new Error('Failed to decrypt media');
    }
  }

  /**
   * Clears the decrypted media cache
   */
  static clearCache(): void {
    // Revoke all blob URLs to free memory
    for (const blobUrl of this.decryptedCache.values()) {
      URL.revokeObjectURL(blobUrl);
    }
    this.decryptedCache.clear();
  }

  /**
   * Removes a specific decrypted media from cache
   */
  static removeFromCache(encryptedBlobUrl: string): void {
    const blobUrl = this.decryptedCache.get(encryptedBlobUrl);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      this.decryptedCache.delete(encryptedBlobUrl);
    }
  }

  /**
   * Gets cache size for debugging
   */
  static getCacheSize(): number {
    return this.decryptedCache.size;
  }
}
