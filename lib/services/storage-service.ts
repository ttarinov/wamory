export type StorageMode = 'blob' | 'local';

export interface StorageService {
  read(path: string): Promise<string | null>;
  write(path: string, data: string): Promise<string>;
  exists(path: string): Promise<boolean>;
  uploadMedia(chatId: string, file: File | Buffer, filename: string): Promise<string>;
  deleteFile(path: string): Promise<void>;
  listMedia(chatId: string): Promise<string[]>;
  deleteAll?(): Promise<void>;
}

export function getStorageService(mode: StorageMode): StorageService {
  if (mode === 'local') {
    const { LocalStorageService } = require('./storage/local-storage-service');
    return new LocalStorageService();
  } else {
    const { BlobStorageService } = require('./storage/blob-storage-service');
    return new BlobStorageService();
  }
}
