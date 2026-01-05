import * as bip39 from 'bip39';
import { MNEMONIC_STRENGTH_12, MNEMONIC_STRENGTH_24, PBKDF2_SALT, PBKDF2_ITERATIONS, AES_KEY_LENGTH } from '@/lib/constants/crypto-constants';

export class MnemonicService {
  static generate(wordCount: 12 | 24 = 12): string {
    const strength = wordCount === 12 ? MNEMONIC_STRENGTH_12 : MNEMONIC_STRENGTH_24;
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
        salt: new TextEncoder().encode(PBKDF2_SALT),
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: AES_KEY_LENGTH },
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
