import { Chat, Message } from "@/lib/models";

type SerializedMessage = Omit<Message, 'timestamp'> & {
  timestamp: string | number | Date;
};

type SerializedChat = Omit<Chat, 'messages' | 'lastMessage'> & {
  messages: SerializedMessage[];
  lastMessage: SerializedMessage;
};

function reviveMessage(message: SerializedMessage): Message {
  const timestamp =
    message.timestamp instanceof Date
      ? message.timestamp
      : new Date(message.timestamp);

  return {
    ...message,
    timestamp,
  };
}

export function reviveChats(chats: SerializedChat[]): Chat[] {
  return (chats || []).map((chat) => {
    const messages = (chat.messages || []).map(reviveMessage);
    const lastMessageFromPayload = chat.lastMessage
      ? reviveMessage(chat.lastMessage)
      : messages[messages.length - 1];

    const lastMessage =
      messages.find((m) => m.id === lastMessageFromPayload?.id) ||
      lastMessageFromPayload ||
      messages[messages.length - 1];

    return {
      ...chat,
      messages,
      lastMessage,
    };
  });
}


