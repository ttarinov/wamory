'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode, useRef } from 'react';
import { MediaDecryptionService } from '@/lib/services/media-decryption';
import { MnemonicService } from '@/lib/services/mnemonic-service';
import { SessionService } from '@/lib/services/session-service';

interface MediaDecryptionContextValue {
  getDecryptedUrl: (encryptedUrl: string) => string | null;
  isDecrypting: (encryptedUrl: string) => boolean;
  decryptMedia: (encryptedUrl: string) => Promise<void>;
}

const MediaDecryptionContext = createContext<MediaDecryptionContextValue | null>(null);

export function MediaDecryptionProvider({ children }: { children: ReactNode }) {
  const [decryptedUrls, setDecryptedUrls] = useState<Map<string, string>>(new Map());
  const [decryptingUrls, setDecryptingUrls] = useState<Set<string>>(new Set());
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);

  // Use refs to hold latest values without causing re-renders
  const decryptedUrlsRef = useRef(decryptedUrls);
  const decryptingUrlsRef = useRef(decryptingUrls);

  useEffect(() => {
    decryptedUrlsRef.current = decryptedUrls;
  }, [decryptedUrls]);

  useEffect(() => {
    decryptingUrlsRef.current = decryptingUrls;
  }, [decryptingUrls]);

  useEffect(() => {
    const initKey = async () => {
      const mnemonic = SessionService.getSession();
      if (mnemonic) {
        const key = await MnemonicService.deriveEncryptionKey(mnemonic);
        setEncryptionKey(key);
      }
    };
    initKey();
  }, []);

  const decryptMedia = useCallback(async (encryptedUrl: string) => {
    if (!encryptionKey) return;

    // Check if already decrypted or decrypting
    if (decryptedUrlsRef.current.has(encryptedUrl) || decryptingUrlsRef.current.has(encryptedUrl)) {
      return;
    }

    setDecryptingUrls((prev) => new Set(prev).add(encryptedUrl));

    try {
      const blobUrl = await MediaDecryptionService.decryptMediaBlob(encryptedUrl, encryptionKey);
      setDecryptedUrls((prev) => {
        const next = new Map(prev);
        next.set(encryptedUrl, blobUrl);
        return next;
      });
    } catch (error) {
      console.error('Failed to decrypt media:', error);
    } finally {
      setDecryptingUrls((prev) => {
        const next = new Set(prev);
        next.delete(encryptedUrl);
        return next;
      });
    }
  }, [encryptionKey]);

  // Stable functions that don't change on every render
  const getDecryptedUrl = useCallback((encryptedUrl: string): string | null => {
    return decryptedUrlsRef.current.get(encryptedUrl) || null;
  }, []);

  const isDecrypting = useCallback((encryptedUrl: string): boolean => {
    return decryptingUrlsRef.current.has(encryptedUrl);
  }, []);

  const value = useMemo(() => ({
    getDecryptedUrl,
    isDecrypting,
    decryptMedia,
  }), [getDecryptedUrl, isDecrypting, decryptMedia]);

  return (
    <MediaDecryptionContext.Provider value={value}>
      {children}
    </MediaDecryptionContext.Provider>
  );
}

export function useMediaDecryption() {
  const context = useContext(MediaDecryptionContext);
  if (!context) {
    throw new Error('useMediaDecryption must be used within MediaDecryptionProvider');
  }
  return context;
}
