'use client';

import { Message } from "@/lib/models";
import { cn } from '@/lib/utils';
import { MessageMedia } from './message-media';
import { MessageContent } from './message-content';
import { MessageAudio } from './message-audio';
import { MessageSystem } from './message-system';
import { MessageTimestamp } from './message-timestamp';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const hasMedia = (message.type === 'image' || message.type === 'attachment') && message.attachmentUrl;
  const isAudio = message.type === 'audio' && message.attachmentUrl;
  const isSystem = message.type === 'system';

  if (isSystem) {
    return <MessageSystem message={message} />;
  }

  return (
    <div
      className={cn(
        'flex w-full gap-2',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {isAudio ? (
        <MessageAudio message={message} isUser={isUser} />
      ) : hasMedia && message.attachmentUrl ? (
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
