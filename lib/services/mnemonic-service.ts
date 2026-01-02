import * as bip39 from 'bip39';

export class MnemonicService {
  static generate(wordCount: 12 | 24 = 12): string {
    const strength = wordCount === 12 ? 128 : 256;
    return bip39.generateMnemonic(strength);
  }

  static validate(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  static async deriveEncryptionKey(mnemonic: string): Promise<CryptoKey> {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      seed.slice(0, 32),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('wa-history-salt'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  static async getKeyHash(mnemonic: string): Promise<string> {
    const key = await this.deriveEncryptionKey(mnemonic);
    const exported = await crypto.subtle.exportKey('raw', key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', exported);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
