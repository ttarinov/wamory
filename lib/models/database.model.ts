import { Chat } from './chat.model';
import { StoredChat } from './chat.model';
import { StoredMessage } from './message.model';

export interface ChatData {
  chats: Chat[];
}

export interface StoredDatabase {
  chats: Record<string, StoredChat>;
  messages: Record<string, Record<string, StoredMessage>>;
}
