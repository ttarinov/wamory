'use client';

import { formatTime } from '@/lib/date-utils';
import { Check, CheckCheck } from 'lucide-react';

interface MessageTimestampProps {
  timestamp: number;
  isUser: boolean;
  isRead?: boolean;
}

export function MessageTimestamp({ timestamp, isUser, isRead }: MessageTimestampProps) {
  return (
    <div className="absolute bottom-0 right-0 flex items-center gap-1 rounded-tl-lg bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
      <span>{formatTime(timestamp)}</span>
      {isUser && (
        <div>
          {isRead ? (
            <CheckCheck className="h-3 w-3" />
          ) : (
            <Check className="h-3 w-3" />
          )}
        </div>
      )}
    </div>
  );
}
