import { Chat, StoredDatabase, chatToStored, storedToChat } from '@/lib/models';
import { MnemonicService } from '@/lib/services/mnemonic-service';
import { EncryptionService } from '@/lib/services/encryption-service';

export class ChatStorage {
  static async loadChats(): Promise<Chat[]> {
    const mnemonic = sessionStorage.getItem('mnemonic');
    if (!mnemonic) {
      throw new Error('No mnemonic found');
    }

    const key = await MnemonicService.deriveEncryptionKey(mnemonic);
    const res = await fetch('/api/chats');
    const { data } = await res.json();

    if (!data) {
      return [];
    }

    const decrypted = await EncryptionService.decrypt(data, key);
    const stored: StoredDatabase = JSON.parse(decrypted);

    return Object.entries(stored.chats).map(([id, chat]) =>
      storedToChat(id, chat, stored.messages[id] || {})
    );
  }

  static async saveChats(chats: Chat[]): Promise<void> {
    const mnemonic = sessionStorage.getItem('mnemonic');
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

    await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: encrypted }),
    });
  }

  static async addChats(newChats: Chat[]): Promise<void> {
    const existing = await this.loadChats();
    const existingIds = new Set(existing.map((c) => c.id));
    const toAdd = newChats.filter((c) => !existingIds.has(c.id));
    const all = [...existing, ...toAdd];
    await this.saveChats(all);
  }
}
