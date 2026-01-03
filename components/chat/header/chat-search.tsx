'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Chat, Message } from "@/lib/models";
import { formatDate, formatTime } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import { HighlightedText } from '../highlighted-text';

function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Normalize text for flexible searching (removes spaces, dashes, parentheses, etc.)
function normalizeForSearch(text: string): string {
  return text.replace(/[\s\-\(\)\+\.]/g, '').toLowerCase();
}

function matchMessage(message: Message, q: string) {
  const query = q.trim().toLowerCase();
  if (!query) return false;

  const content = (message.content || '').toLowerCase();
  const senderName = (message.senderName || '').toLowerCase();
  const attachment = (message.attachmentUrl || '').toLowerCase();

  // First try exact match (normal search)
  const exactMatch = (
    content.includes(query) ||
    senderName.includes(query) ||
    attachment.includes(query)
  );

  if (exactMatch) return true;

  // Then try normalized match (flexible search for phone numbers, etc.)
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery) return false;

  const normalizedContent = normalizeForSearch(message.content || '');
  const normalizedSender = normalizeForSearch(message.senderName || '');
  const normalizedAttachment = normalizeForSearch(message.attachmentUrl || '');

  return (
    normalizedContent.includes(normalizedQuery) ||
    normalizedSender.includes(normalizedQuery) ||
    normalizedAttachment.includes(normalizedQuery)
  );
}

interface ChatSearchProps {
  chat: Chat;
  query: string;
  onQueryChange: (value: string) => void;
  onMessageClick?: (messageId: string) => void;
}

export function ChatSearch({ chat, query, onQueryChange, onMessageClick }: ChatSearchProps) {
  const results = chat.messages
    .filter((m) => matchMessage(m, query))
    .slice(0, 50);

  return (
    <div className="mx-4 mt-2 rounded-xl border bg-card px-4 py-3 shadow-sm">
      <Input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search in this chat..."
        className="rounded-full"
      />

      {query.trim() ? (
        <div className="mt-3">
          {results.length ? (
            <div className="space-y-2">
              {results.map((message) => (
                <button
                  key={message.id}
                  onClick={() => onMessageClick?.(message.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent'
                  )}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback>
                      {initialsFromName(message.senderName || message.sender)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="truncate text-sm font-medium">
                        {message.senderName || message.sender}
                      </div>
                      <div className="shrink-0 text-xs text-muted-foreground">
                        {formatDate(message.timestamp)} {formatTime(message.timestamp)}
                      </div>
                    </div>

                    <div className="mt-1 min-w-0 truncate text-sm text-muted-foreground">
                      {message.type === 'image' ? '📷 ' : null}
                      <HighlightedText text={message.content} highlight={query} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-3 text-sm text-muted-foreground">No results</div>
          )}
        </div>
      ) : null}
    </div>
  );
}


