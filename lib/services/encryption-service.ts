export class EncryptionService {
  static async encrypt(data: string | ArrayBuffer | Uint8Array, key: CryptoKey): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12));

    let encoded: BufferSource;
    if (typeof data === 'string') {
      encoded = new TextEncoder().encode(data) as BufferSource;
    } else {
      encoded = data as BufferSource;
    }

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64 in chunks to avoid stack overflow with large arrays
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < combined.length; i += chunkSize) {
      const chunk = combined.subarray(i, Math.min(i + chunkSize, combined.length));
      binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
  }

  static async decrypt(encryptedData: string, key: CryptoKey): Promise<ArrayBuffer> {
    const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return decrypted;
  }

  static async decryptToString(encryptedData: string, key: CryptoKey): Promise<string> {
    const decrypted = await this.decrypt(encryptedData, key);
    return new TextDecoder().decode(decrypted);
  }
}
