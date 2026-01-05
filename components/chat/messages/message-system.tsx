'use client';

import { Message } from "@/lib/models";

interface MessageSystemProps {
  message: Message;
}

export function MessageSystem({ message }: MessageSystemProps) {
  return (
    <div className="flex w-full justify-center py-2">
      <div className="max-w-[80%] rounded-lg bg-blue-100 px-3 py-1.5 text-center dark:bg-blue-900/30">
        <p className="text-xs text-blue-900 dark:text-blue-100">
          {message.content}
        </p>
      </div>
    </div>
  );
}

