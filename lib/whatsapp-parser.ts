import { Chat, Message } from "@/lib/models";
import { generateKey } from './key-generator';
import { isImage, isAudio } from './utils/media';

interface ParsedMessage {
  timestamp: Date;
  sender: string;
  content: string;
  isAttachment: boolean;
  attachmentPath?: string;
}

function parseWhatsAppDateTime(dateStr: string, timeStr: string): Date | null {
  try {
    const [month, day, year] = dateStr.split('/').map(Number);
    const fullYear = year < 100 ? 2000 + year : year;

    // Handle Unicode whitespace (including narrow no-break space \u202F)
    const timeParts = timeStr.split(/\s+/);
    const [hours, minutes, seconds = 0] = timeParts[0].split(':').map(Number);
    const period = timeParts[1]?.trim();

    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;

    const date = new Date(fullYear, month - 1, day, hour24, minutes, seconds);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

function identifySenders(messages: ParsedMessage[]): {
  clientSender: string;
  userSender: string;
} {
  const senderCounts = messages.reduce(
    (acc, msg) => {
      acc[msg.sender] = (acc[msg.sender] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const senders = Object.keys(senderCounts);
  let clientSender = senders[0];
  let userSender = senders[1] || senders[0];

  const unsavedSender = senders.find((s) => s.startsWith('~'));
  if (unsavedSender) {
    clientSender = unsavedSender;
    userSender = senders.find((s) => s !== unsavedSender) || unsavedSender;
  }

  return { clientSender, userSender };
}

export function parseWhatsAppChat(
  chatText: string,
  phoneNumber: string
): Chat | null {
  const lines = chatText.split(/\r?\n/);
  const messages: ParsedMessage[] = [];
  let currentMessage: ParsedMessage | null = null;

  const messageRegex =
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s+(?:AM|PM))\]\s+([^:]+):\s*(.*)$/;

  for (let line of lines) {
    line = line.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim();

    if (!line) continue;

    const match = line.match(messageRegex);
    if (match) {
      if (currentMessage) {
        messages.push(currentMessage);
      }

      const [, date, time, sender, content] = match;

      const timestamp = parseWhatsAppDateTime(date, time);
      if (!timestamp) {
        continue;
      }

      const cleanContent = content.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim();

      const attachmentMatch = cleanContent.match(/<attached:\s*(.+)>/);
      if (attachmentMatch) {
        currentMessage = {
          timestamp,
          sender: sender.trim(),
          content: `📎 ${attachmentMatch[1]}`,
          isAttachment: true,
          attachmentPath: attachmentMatch[1],
        };
      } else {
        currentMessage = {
          timestamp,
          sender: sender.trim(),
          content: cleanContent,
          isAttachment: false,
        };
      }
    } else {
      if (currentMessage && !currentMessage.isAttachment) {
        currentMessage.content += '\n' + line;
      }
    }
  }

  if (currentMessage) {
    messages.push(currentMessage);
  }

  const validMessages = messages.filter(msg => {
    const hasContent = !!msg.content.trim();
    const hasValidTimestamp = !!msg.timestamp && !isNaN(msg.timestamp.getTime());
    if (!hasContent) return false;
    if (!hasValidTimestamp) {
      return false;
    }
    return true;
  });

  if (validMessages.length === 0) {
    return null;
  }

  const { clientSender, userSender } = identifySenders(validMessages);

  const isSystemMessage = (content: string): boolean => {
    const systemPattern = /secure service from Meta to manage this chat/i;
    return systemPattern.test(content);
  };

  const chatMessages: Message[] = validMessages.map((msg) => {
    if (isSystemMessage(msg.content)) {
      return {
        id: generateKey(),
        timestamp: msg.timestamp,
        sender: 'system',
        senderName: 'System',
        content: msg.content,
        type: 'system',
        isRead: true,
      };
    }

    const isClient = msg.sender === clientSender;
    let type: Message['type'] = 'text';
    
    if (msg.isAttachment && msg.attachmentPath) {
      if (isImage(msg.attachmentPath)) {
        type = 'image';
      } else if (isAudio(msg.attachmentPath)) {
        type = 'audio';
      } else {
        type = 'attachment';
      }
    }

    return {
      id: generateKey(),
      timestamp: msg.timestamp,
      sender: isClient ? 'client' : 'user',
      senderName: msg.sender.replace(/^~/, ''),
      content: msg.content,
      type,
      attachmentUrl: msg.attachmentPath,
      isRead: true,
    };
  });

  const sortedMessages = chatMessages.sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  const nonSystemMessages = sortedMessages.filter(m => m.type !== 'system');
  const lastMessage = nonSystemMessages.length > 0 
    ? nonSystemMessages[nonSystemMessages.length - 1]
    : sortedMessages[sortedMessages.length - 1];
  const unreadCount = 0;

  const clientName = clientSender.replace(/^~/, '').trim();

  return {
    id: generateKey('chat_'),
    phoneNumber,
    name: clientName !== phoneNumber ? clientName : undefined,
    messages: sortedMessages,
    lastMessage,
    unreadCount,
  };
}
