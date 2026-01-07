import type { Chat } from '@/lib/models';
import type { ImportFile } from '@/components/dialogs/import-chats-dialog/types';
import { parseWhatsAppChat } from '@/lib/whatsapp-parser';
import { MediaImportService } from './media-import-service';
import { MnemonicService } from './mnemonic-service';
import { SessionService } from './session-service';
import { FileLoaderService } from './file-loader-service';
import {
  extractAttachmentPaths,
  remapMessageAttachments,
  findLastValidMessage,
} from '../utils/chat-utils';
import { getFileIdentifier } from '../utils/file-import-utils';
import JSZip from 'jszip';

export class ChatImportService {
  private static readonly BATCH_SIZE = 50;
  private static readonly MAX_CONCURRENT = 5;

  static async extractChatsFromFiles(
    selectedFiles: ImportFile[],
    availableFiles: ImportFile[],
    onProgress?: (message: string, progress: number) => void,
    storageMode: 'blob' | 'local' = 'blob'
  ): Promise<Chat[]> {
    const selectedIdentifiers = new Set(selectedFiles.map(f => getFileIdentifier(f)));
    const filesToProcess = availableFiles.filter((file) =>
      selectedIdentifiers.has(getFileIdentifier(file))
    );

    if (filesToProcess.length === 0) {
      return [];
    }

    if (filesToProcess.length <= this.BATCH_SIZE) {
      return await this.processFilesInParallel(filesToProcess, onProgress, storageMode);
    }

    return await this.processFilesInBatches(filesToProcess, onProgress, storageMode);
  }

  private static async processFilesInBatches(
    filesToProcess: ImportFile[],
    onProgress?: (message: string, progress: number) => void,
    storageMode: 'blob' | 'local' = 'blob'
  ): Promise<Chat[]> {
    const newChats: Chat[] = [];
    const totalBatches = Math.ceil(filesToProcess.length / this.BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * this.BATCH_SIZE;
      const endIndex = Math.min(startIndex + this.BATCH_SIZE, filesToProcess.length);
      const batch = filesToProcess.slice(startIndex, endIndex);

      onProgress?.(
        `Processing batch ${batchIndex + 1} of ${totalBatches} (${batch.length} files)...`,
        Math.round((startIndex / filesToProcess.length) * 100)
      );

      const batchChats = await this.processFilesInParallel(batch, (message, progress) => {
        const batchProgress = (startIndex + (progress / 100) * batch.length) / filesToProcess.length;
        onProgress?.(message, Math.round(batchProgress * 100));
      }, storageMode);

      newChats.push(...batchChats);
    }

    return newChats;
  }

  private static async processFilesInParallel(
    files: ImportFile[],
    onProgress?: (message: string, progress: number) => void,
    storageMode: 'blob' | 'local' = 'blob'
  ): Promise<Chat[]> {
    const results: Chat[] = [];
    let completed = 0;

    const processFile = async (file: ImportFile, index: number): Promise<Chat | null> => {
      try {
        const chatText = await FileLoaderService.loadChatContent(file);
        if (!chatText) return null;

        const chat = parseWhatsAppChat(chatText, file.phoneNumber);
        if (!chat) return null;

        const processedChat = await this.processChatWithMedia(chat, file, storageMode);
        
        completed++;
        onProgress?.(
          `Extracted ${completed} of ${files.length} chats...`,
          Math.round((completed / files.length) * 100)
        );

        return processedChat;
      } catch (error) {
        completed++;
        return null;
      }
    };

    const chunks: ImportFile[][] = [];
    for (let i = 0; i < files.length; i += this.MAX_CONCURRENT) {
      chunks.push(files.slice(i, i + this.MAX_CONCURRENT));
    }

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map((file, idx) => processFile(file, idx))
      );
      
      const validChats = chunkResults.filter((chat): chat is Chat => chat !== null);
      results.push(...validChats);
    }

    return results;
  }

  private static async processChatWithMedia(
    chat: Chat,
    file: ImportFile,
    storageMode: 'blob' | 'local' = 'blob'
  ): Promise<Chat> {
    const attachmentFiles = extractAttachmentPaths(chat);
    if (attachmentFiles.length === 0) return chat;

    if (file.type === 'folder' && file.path) {
      const urlMapping = await MediaImportService.copyFromFilesystem(
        file.path,
        chat.id,
        attachmentFiles
      );

      if (urlMapping) {
        return this.applyChatMediaMapping(chat, urlMapping);
      }
    }

    if (file.file?.name.endsWith('.zip')) {
      const urlMapping = await this.uploadMediaFromZipFile(
        file.file,
        chat.id,
        attachmentFiles,
        storageMode
      );

      if (urlMapping) {
        return this.applyChatMediaMapping(chat, urlMapping);
      }
    }

    if (file.type === 'zip' && file.path) {
      const urlMapping = await this.uploadMediaFromZipPath(
        file.path,
        chat.id,
        attachmentFiles,
        storageMode
      );

      if (urlMapping) {
        return this.applyChatMediaMapping(chat, urlMapping);
      }
    }

    return chat;
  }

  private static async uploadMediaFromZipFile(
    file: File,
    chatId: string,
    attachmentFiles: string[],
    storageMode: 'blob' | 'local' = 'blob'
  ): Promise<Record<string, string> | null> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      const mnemonic = SessionService.getSession();
      if (!mnemonic) return null;

      const encryptionKey = await MnemonicService.deriveEncryptionKey(mnemonic);

      return await MediaImportService.uploadEncryptedFromZip(zip, chatId, attachmentFiles, encryptionKey, storageMode);
    } catch (error) {
      return null;
    }
  }

  private static async uploadMediaFromZipPath(
    path: string,
    chatId: string,
    attachmentFiles: string[],
    storageMode: 'blob' | 'local' = 'blob'
  ): Promise<Record<string, string> | null> {
    try {
      const response = await fetch(`/api/read-chat?path=${encodeURIComponent(path)}`);
      if (!response.ok) return null;

      const arrayBuffer = await response.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      const mnemonic = SessionService.getSession();
      if (!mnemonic) return null;

      const encryptionKey = await MnemonicService.deriveEncryptionKey(mnemonic);

      return await MediaImportService.uploadEncryptedFromZip(zip, chatId, attachmentFiles, encryptionKey, storageMode);
    } catch (error) {
      return null;
    }
  }

  private static applyChatMediaMapping(chat: Chat, urlMapping: Record<string, string>): Chat {
    const updatedMessages = remapMessageAttachments(chat.messages, urlMapping);
    const updatedLastMessage = findLastValidMessage(updatedMessages, chat.lastMessage);

    return {
      ...chat,
      messages: updatedMessages,
      lastMessage: updatedLastMessage,
    };
  }
}
