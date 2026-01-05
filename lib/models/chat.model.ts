import { Message, StoredMessage, messageToStored, storedToMessage } from './message.model';

export interface Chat {
  id: string;
  phoneNumber: string;
  name?: string;
  avatar?: string;
  messages: Message[];
  lastMessage: Message;
  unreadCount: number;
}

export interface StoredChat {
  phoneNumber: string;
  name?: string;
  avatar?: string;
  lastMessageTimestamp: number;
  createdAt: number;
  updatedAt: number;
}

export function chatToStored(chat: Chat): {
  chatData: StoredChat;
  messages: Record<string, StoredMessage>;
} {
  const now = Date.now();
  return {
    chatData: {
      phoneNumber: chat.phoneNumber,
      name: chat.name,
      avatar: chat.avatar,
      lastMessageTimestamp: chat.lastMessage.timestamp.getTime(),
      createdAt: now,
      updatedAt: now,
    },
    messages: chat.messages.reduce(
      (acc, msg) => {
        acc[msg.id] = messageToStored(msg);
        return acc;
      },
      {} as Record<string, StoredMessage>
    ),
  };
}

export function storedToChat(
  id: string,
  stored: StoredChat,
  storedMessages: Record<string, StoredMessage>
): Chat {
  const messages = Object.entries(storedMessages).map(([msgId, storedMsg]) =>
    storedToMessage(msgId, storedMsg)
  );

  const sortedMessages = messages.sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  const nonSystemMessages = sortedMessages.filter(m => m.type !== 'system');
  const lastMessage = nonSystemMessages.length > 0
    ? nonSystemMessages[nonSystemMessages.length - 1]
    : sortedMessages[sortedMessages.length - 1];
  const unreadCount = messages.filter(
    (msg) => msg.sender === 'client' && !msg.isRead
  ).length;

  return {
    id,
    phoneNumber: stored.phoneNumber,
    name: stored.name,
    avatar: stored.avatar,
    messages: sortedMessages,
    lastMessage,
    unreadCount,
  };
}
