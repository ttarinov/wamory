import JSZip from 'jszip';
import type { Chat } from '@/lib/models';
import type { ImportFile } from '@/components/dialogs/import-chats-dialog/types';
import { parseWhatsAppChat } from '@/lib/whatsapp-parser';
import { MediaImportService } from './media-import-service';
import { MnemonicService } from './mnemonic-service';
import { SessionService } from './session-service';
import {
  extractAttachmentPaths,
  remapMessageAttachments,
  findLastValidMessage,
} from '../utils/chat-utils';
import { getFileIdentifier } from '../utils/file-import-utils';

export class ChatImportService {
  /**
   * Extract chats from selected files with progress tracking
   */
  static async extractChatsFromFiles(
    selectedFiles: ImportFile[],
    availableFiles: ImportFile[],
    onProgress?: (message: string, progress: number) => void
  ): Promise<Chat[]> {
    const newChats: Chat[] = [];

    const filesToProcess = availableFiles.filter((file) =>
      selectedFiles.some((selected) => getFileIdentifier(selected) === getFileIdentifier(file))
    );

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];

      onProgress?.(
        `Extracting chat ${i + 1} of ${filesToProcess.length}...`,
        Math.round(((i + 1) / filesToProcess.length) * 100)
      );

      const chatText = await this.loadChatContent(file);
      if (!chatText) continue;

      const chat = parseWhatsAppChat(chatText, file.phoneNumber);
      if (!chat) continue;

      // Process media if available
      const processedChat = await this.processChatWithMedia(chat, file);
      newChats.push(processedChat);
    }

    return newChats;
  }

  /**
   * Load chat text content from various file sources
   */
  static async loadChatContent(file: ImportFile): Promise<string | null> {
    // If content is already loaded
    if (file.content) {
      return file.content;
    }

    // Load from path
    if (file.path) {
      return await this.loadChatFromPath(file);
    }

    // Load from File object
    if (file.file) {
      return await this.loadChatFromFileObject(file.file);
    }

    return null;
  }

  /**
   * Load chat from path (server-side file)
   */
  private static async loadChatFromPath(file: ImportFile): Promise<string | null> {
    if (file.type === 'zip') {
      try {
        const response = await fetch(`/api/read-chat?path=${encodeURIComponent(file.path!)}`);
        if (!response.ok) return null;

        const arrayBuffer = await response.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        const chatFile = zip.file('_chat.txt');

        return chatFile ? await chatFile.async('text') : null;
      } catch (error) {
        console.error('Failed to load chat from zip path:', error);
        return null;
      }
    } else {
      // Text file or folder
      const chatFilePath = file.type === 'folder' ? `${file.path}/_chat.txt` : file.path!;

      try {
        const response = await fetch(`/api/read-chat?path=${encodeURIComponent(chatFilePath)}`);
        return response.ok ? await response.text() : null;
      } catch (error) {
        console.error('Failed to load chat from path:', error);
        return null;
      }
    }
  }

  /**
   * Load chat from File object (client-side file)
   */
  private static async loadChatFromFileObject(file: File): Promise<string | null> {
    if (file.name.endsWith('.zip')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        const chatFile = zip.file('_chat.txt');

        return chatFile ? await chatFile.async('text') : null;
      } catch (error) {
        console.error('Failed to load chat from zip file:', error);
        return null;
      }
    } else if (file.name.endsWith('.txt')) {
      try {
        return await file.text();
      } catch (error) {
        console.error('Failed to load chat from text file:', error);
        return null;
      }
    }

    return null;
  }

  /**
   * Process chat with media handling
   * Tries filesystem copy first, then zip encryption if available
   */
  private static async processChatWithMedia(
    chat: Chat,
    file: ImportFile
  ): Promise<Chat> {
    const attachmentFiles = extractAttachmentPaths(chat);
    if (attachmentFiles.length === 0) return chat;

    // Try filesystem copy if source directory is available
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

    // Try zip encryption if file is available
    if (file.file?.name.endsWith('.zip')) {
      const urlMapping = await this.uploadMediaFromZipFile(
        file.file,
        chat.id,
        attachmentFiles
      );

      if (urlMapping) {
        return this.applyChatMediaMapping(chat, urlMapping);
      }
    }

    // Try zip encryption from path
    if (file.type === 'zip' && file.path) {
      const urlMapping = await this.uploadMediaFromZipPath(
        file.path,
        chat.id,
        attachmentFiles
      );

      if (urlMapping) {
        return this.applyChatMediaMapping(chat, urlMapping);
      }
    }

    // No media processing successful, return original chat
    return chat;
  }

  /**
   * Upload media from zip file
   */
  private static async uploadMediaFromZipFile(
    file: File,
    chatId: string,
    attachmentFiles: string[]
  ): Promise<Record<string, string> | null> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      const mnemonic = SessionService.getSession();
      if (!mnemonic) return null;

      const encryptionKey = await MnemonicService.deriveEncryptionKey(mnemonic);

      return await MediaImportService.uploadEncryptedFromZip(zip, chatId, attachmentFiles, encryptionKey);
    } catch (error) {
      console.error('Failed to upload media from zip file:', error);
      return null;
    }
  }

  /**
   * Upload media from zip path
   */
  private static async uploadMediaFromZipPath(
    path: string,
    chatId: string,
    attachmentFiles: string[]
  ): Promise<Record<string, string> | null> {
    try {
      const response = await fetch(`/api/read-chat?path=${encodeURIComponent(path)}`);
      if (!response.ok) return null;

      const arrayBuffer = await response.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      const mnemonic = SessionService.getSession();
      if (!mnemonic) return null;

      const encryptionKey = await MnemonicService.deriveEncryptionKey(mnemonic);

      return await MediaImportService.uploadEncryptedFromZip(zip, chatId, attachmentFiles, encryptionKey);
    } catch (error) {
      console.error('Failed to upload media from zip path:', error);
      return null;
    }
  }

  /**
   * Apply media URL mapping to chat
   */
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
