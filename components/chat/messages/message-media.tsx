'use client';

import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useMediaDecryption } from '@/contexts/media-decryption-context';
import { useEffect } from 'react';

interface MessageMediaProps {
  encryptedUrl: string;
  alt: string;
}

export function MessageMedia({ encryptedUrl, alt }: MessageMediaProps) {
  const { getDecryptedUrl, isDecrypting, decryptMedia } = useMediaDecryption();

  const decryptedUrl = getDecryptedUrl(encryptedUrl);
  const decrypting = isDecrypting(encryptedUrl);

  useEffect(() => {
    if (!decryptedUrl && !decrypting) {
      decryptMedia(encryptedUrl);
    }
  }, [encryptedUrl, decryptedUrl, decrypting, decryptMedia]);

  if (decrypting || !decryptedUrl) {
    return (
      <div className="flex items-center justify-center w-[300px] h-[200px] bg-muted rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Image
      src={decryptedUrl}
      alt={alt}
      width={300}
      height={300}
      className="h-auto w-full max-w-[300px] object-cover"
    />
  );
}
