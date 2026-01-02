'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Chat } from "@/lib/models";
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/date-utils';
import { Check, CheckCheck } from 'lucide-react';
import { ChatListItemActions } from './list-item-actions';

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (chatId: string) => void;
}

export function ChatListItem({
  chat,
  isSelected,
  onClick,
  onDelete,
}: ChatListItemProps) {
  const initials = chat.name
    ? chat.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : chat.phoneNumber.slice(-2);

  const truncatedMessage =
    chat.lastMessage.content.length > 50
      ? chat.lastMessage.content.slice(0, 50) + '...'
      : chat.lastMessage.content;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      className={cn(
        'group relative flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-accent',
        isSelected && 'bg-accent'
      )}
    >
      <ChatListItemActions onDelete={() => onDelete(chat.id)} />
      <Avatar className="h-12 w-12 shrink-0">
        <AvatarImage src={chat.avatar} alt={chat.name || chat.phoneNumber} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate font-semibold">
            {chat.name || chat.phoneNumber}
          </h3>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatDistanceToNow(chat.lastMessage.timestamp)}
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            {chat.lastMessage.sender === 'user' && (
              <div className="shrink-0">
                {chat.lastMessage.isRead ? (
                  <CheckCheck className="h-3 w-3 text-blue-500" />
                ) : (
                  <Check className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            )}
            <p className="min-w-0 truncate text-sm text-muted-foreground">
              {chat.lastMessage.type === 'image' && '📷 '}
              {truncatedMessage}
            </p>
          </div>
          {chat.unreadCount > 0 && (
            <Badge
              variant="default"
              className="h-5 min-w-5 shrink-0 justify-center rounded-full px-1.5 text-xs"
            >
              {chat.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
