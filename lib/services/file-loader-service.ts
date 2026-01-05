import JSZip from 'jszip';
import type { ImportFile } from '@/components/dialogs/import-chats-dialog/types';
import { INTERNAL_CHAT_FILE } from '@/lib/constants/file-constants';

export class FileLoaderService {
  static async loadChatContent(file: ImportFile): Promise<string | null> {
    if (file.content) {
      return file.content;
    }

    if (file.path) {
      return await this.loadChatFromPath(file);
    }

    if (file.file) {
      return await this.loadChatFromFileObject(file.file);
    }

    return null;
  }

  private static async loadChatFromPath(file: ImportFile): Promise<string | null> {
    if (file.type === 'zip') {
      try {
        const response = await fetch(`/api/read-chat?path=${encodeURIComponent(file.path!)}`);
        if (!response.ok) return null;

        const arrayBuffer = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        const chatFile = zip.file(INTERNAL_CHAT_FILE);

        return chatFile ? await chatFile.async('text') : null;
      } catch (error) {
        return null;
      }
    } else {
      const chatFilePath = file.type === 'folder' ? `${file.path}/${INTERNAL_CHAT_FILE}` : file.path!;

      try {
        const response = await fetch(`/api/read-chat?path=${encodeURIComponent(chatFilePath)}`);
        return response.ok ? await response.text() : null;
      } catch (error) {
        return null;
      }
    }
  }

  private static async loadChatFromFileObject(file: File): Promise<string | null> {
    if (file.name.endsWith('.zip')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        const chatFile = zip.file(INTERNAL_CHAT_FILE);

        return chatFile ? await chatFile.async('text') : null;
      } catch (error) {
        return null;
      }
    } else if (file.name.endsWith('.txt')) {
      try {
        return await file.text();
      } catch (error) {
        return null;
      }
    }

    return null;
  }
}

