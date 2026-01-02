'use client';

import { Message } from "@/lib/models";
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/date-utils';
import { Check, CheckCheck } from 'lucide-react';
import Image from 'next/image';

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
      {hasMedia ? (
        <div className="relative max-w-[70%] overflow-hidden rounded-lg">
          <Image
            src={message.attachmentUrl!}
            alt="Attachment"
            width={300}
            height={300}
            className="h-auto w-full max-w-[300px] object-cover"
          />
          <div className="absolute bottom-0 right-0 flex items-center gap-1 rounded-tl-lg bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
            <span>{formatTime(message.timestamp)}</span>
            {isUser && (
              <div>
                {message.isRead ? (
                  <CheckCheck className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'max-w-[70%] rounded-lg px-3 py-2',
            isUser
              ? 'bg-whatsapp-outgoing text-whatsapp-outgoing-foreground'
              : 'bg-card text-foreground'
          )}
        >
          {message.content && (
            <p className="whitespace-pre-wrap wrap-break-word text-sm">
              {message.content}
            </p>
          )}

          <div
            className={cn(
              'mt-1 flex items-center justify-end gap-1 text-xs',
              isUser ? 'text-whatsapp-outgoing-foreground/70' : 'text-muted-foreground'
            )}
          >
            <span>{formatTime(message.timestamp)}</span>
            {isUser && (
              <div>
                {message.isRead ? (
                  <CheckCheck className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
