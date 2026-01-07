import { Chat, StoredDatabase, chatToStored, storedToChat } from '@/lib/models';
import { MnemonicService } from '@/lib/services/mnemonic-service';
import { EncryptionService } from '@/lib/services/encryption-service';
import { SessionService } from '@/lib/services/session-service';
import { StorageMode } from '@/lib/services/storage-service';

export class ChatStorage {
  static async loadChats(storageMode: StorageMode = 'blob'): Promise<Chat[]> {
    const mnemonic = SessionService.getSession();
    if (!mnemonic) {
      throw new Error('No mnemonic found');
    }

    const key = await MnemonicService.deriveEncryptionKey(mnemonic);
    const res = await fetch('/api/chats', {
      headers: {
        'storage-mode': storageMode,
      },
    });
    const { data } = await res.json();

    if (!data) {
      return [];
    }

    const decrypted = await EncryptionService.decryptToString(data, key);
    const stored: StoredDatabase = JSON.parse(decrypted);

    return Object.entries(stored.chats).map(([id, chat]) =>
      storedToChat(id, chat, stored.messages[id] || {})
    );
  }

  static async saveChats(chats: Chat[], storageMode: StorageMode = 'blob'): Promise<void> {
    const mnemonic = SessionService.getSession();
    if (!mnemonic) {
      throw new Error('No mnemonic found');
    }

    const stored: StoredDatabase = {
      chats: {},
      messages: {},
    };

    chats.forEach((chat) => {
      const { chatData, messages } = chatToStored(chat);
      stored.chats[chat.id] = chatData;
      stored.messages[chat.id] = messages;
    });

    const key = await MnemonicService.deriveEncryptionKey(mnemonic);
    const json = JSON.stringify(stored);
    const encrypted = await EncryptionService.encrypt(json, key);

    const response = await fetch('/api/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'storage-mode': storageMode,
      },
      body: JSON.stringify({ data: encrypted }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to save chats: ${response.statusText}`);
    }

    const responseData = await response.json().catch(() => ({}));
    if (responseData.url) {
      sessionStorage.setItem('blobChatsUrl', responseData.url);
    }
  }

  static async addChats(newChats: Chat[], storageMode: StorageMode = 'blob'): Promise<void> {
    const existing = await this.loadChats(storageMode);
    const existingIds = new Set(existing.map((c) => c.id));
    const toAdd = newChats.filter((c) => !existingIds.has(c.id));
    const all = [...existing, ...toAdd];
    await this.saveChats(all, storageMode);
  }
}
