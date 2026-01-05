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
  static async extractChatsFromFiles(
    selectedFiles: ImportFile[],
    availableFiles: ImportFile[],
    onProgress?: (message: string, progress: number) => void
  ): Promise<Chat[]> {
    const newChats: Chat[] = [];

    const selectedIdentifiers = new Set(selectedFiles.map(f => getFileIdentifier(f)));
    const filesToProcess = availableFiles.filter((file) =>
      selectedIdentifiers.has(getFileIdentifier(file))
    );

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];

      onProgress?.(
        `Extracting chat ${i + 1} of ${filesToProcess.length}...`,
        Math.round(((i + 1) / filesToProcess.length) * 100)
      );

      const chatText = await FileLoaderService.loadChatContent(file);
      if (!chatText) continue;

      const chat = parseWhatsAppChat(chatText, file.phoneNumber);
      if (!chat) continue;

      const processedChat = await this.processChatWithMedia(chat, file);
      newChats.push(processedChat);
    }

    return newChats;
  }

  private static async processChatWithMedia(
    chat: Chat,
    file: ImportFile
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
        attachmentFiles
      );

      if (urlMapping) {
        return this.applyChatMediaMapping(chat, urlMapping);
      }
    }

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

    return chat;
  }

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
      return null;
    }
  }

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
