'use client';

import { Message } from "@/lib/models";
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/date-utils';
import { Check, CheckCheck } from 'lucide-react';

interface MessageContentProps {
  message: Message;
  isUser: boolean;
}

export function MessageContent({ message, isUser }: MessageContentProps) {
  return (
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
  );
}
