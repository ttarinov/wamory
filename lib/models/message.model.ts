export interface Message {
  id: string;
  timestamp: Date;
  sender: 'user' | 'client' | 'system';
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'attachment' | 'system';
  attachmentUrl?: string;
  isRead?: boolean;
}

export interface StoredMessage {
  timestamp: number;
  sender: 'user' | 'client' | 'system';
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'attachment' | 'system';
  attachmentUrl?: string;
  isRead?: boolean;
}

export function messageToStored(message: Message): StoredMessage {
  return {
    timestamp: message.timestamp.getTime(),
    sender: message.sender,
    senderName: message.senderName,
    content: message.content,
    type: message.type,
    attachmentUrl: message.attachmentUrl,
    isRead: message.isRead,
  };
}

export function storedToMessage(id: string, stored: StoredMessage): Message {
  return {
    id,
    timestamp: new Date(stored.timestamp),
    sender: stored.sender,
    senderName: stored.senderName,
    content: stored.content,
    type: stored.type,
    attachmentUrl: stored.attachmentUrl,
    isRead: stored.isRead,
  };
}
