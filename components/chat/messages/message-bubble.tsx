'use client';

import { Message } from "@/lib/models";
import { cn } from '@/lib/utils';
import { MessageMedia } from './message-media';
import { MessageContent } from './message-content';
import { MessageTimestamp } from './message-timestamp';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const hasMedia = (message.type === 'image' || message.type === 'attachment') && message.attachmentUrl;

  return (
    <div
      className={cn(
        'flex w-full gap-2',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {hasMedia && message.attachmentUrl ? (
        <div className="relative max-w-[70%] overflow-hidden rounded-lg">
          <MessageMedia encryptedUrl={message.attachmentUrl} alt="Attachment" />
          <MessageTimestamp
            timestamp={message.timestamp.getTime()}
            isUser={isUser}
            isRead={message.isRead}
          />
        </div>
      ) : (
        <MessageContent message={message} isUser={isUser} />
      )}
    </div>
  );
}
