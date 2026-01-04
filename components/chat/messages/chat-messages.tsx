'use client';

import { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from "@/lib/models";
import { MessageBubble } from './message-bubble';
import { ChatDateLabel } from './date-label';
import { formatDate } from '@/lib/date-utils';
import { useMediaDecryption } from '@/contexts/media-decryption-context';

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const { decryptMedia } = useMediaDecryption();

  useEffect(() => {
    const mediaUrls = messages
      .filter((m) => (m.type === 'image' || m.type === 'attachment' || m.type === 'audio') && m.attachmentUrl)
      .map((m) => m.attachmentUrl!);

    mediaUrls.forEach((url) => {
      decryptMedia(url);
    });
  }, [messages, decryptMedia]);

  const groupedMessages = messages.reduce((acc, message) => {
    const dateKey = formatDate(message.timestamp);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(message);
    return acc;
  }, {} as Record<string, Message[]>);

  return (
    <div className="flex-1 overflow-hidden bg-muted/30 pb-32">
      <ScrollArea className="h-full">
        <div className="space-y-6 p-4">
          {Object.entries(groupedMessages).map(([dateKey, msgs]) => {
            const firstMessageDate = msgs[0]?.timestamp;
            return (
              <div key={dateKey} className="space-y-3">
                <ChatDateLabel date={firstMessageDate} messagesCount={msgs.length} />
                <div className="space-y-2">
                  {msgs.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
