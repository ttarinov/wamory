import { EncryptionService } from './encryption-service';

export class MediaDecryptionService {
  private static decryptedCache = new Map<string, string>();

  /**
   * Decrypts an encrypted media blob URL and returns a blob URL for display
   */
  static async decryptMediaBlob(encryptedBlobUrl: string, encryptionKey: CryptoKey): Promise<string> {
    // Check cache first
    if (this.decryptedCache.has(encryptedBlobUrl)) {
      return this.decryptedCache.get(encryptedBlobUrl)!;
    }

    try {
      // Fetch the encrypted blob
      const response = await fetch(encryptedBlobUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch encrypted media: ${response.status}`);
      }

      // Get the encrypted data as ArrayBuffer
      const encryptedArrayBuffer = await response.arrayBuffer();

      // Convert ArrayBuffer to base64 string in chunks to avoid stack overflow
      const encryptedBytes = new Uint8Array(encryptedArrayBuffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < encryptedBytes.length; i += chunkSize) {
        const chunk = encryptedBytes.subarray(i, Math.min(i + chunkSize, encryptedBytes.length));
        binary += String.fromCharCode(...chunk);
      }
      const encryptedBase64 = btoa(binary);

      // Decrypt the data
      const decryptedBuffer = await EncryptionService.decrypt(encryptedBase64, encryptionKey);

      // Create a blob URL from the decrypted data
      const blob = new Blob([decryptedBuffer]);
      const blobUrl = URL.createObjectURL(blob);

      // Cache the result
      this.decryptedCache.set(encryptedBlobUrl, blobUrl);

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
