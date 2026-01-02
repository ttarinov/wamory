'use client';

import { SidebarContent } from '@/components/ui/sidebar';
import { Chat } from "@/lib/models";
import { ChatListItem as ListItem } from './list-item';

interface SidebarListProps {
  filteredChats: Chat[];
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function SidebarList({
  filteredChats,
  selectedChatId,
  onSelectChat,
  onDeleteChat,
}: SidebarListProps) {
  return (
    <SidebarContent>
      <div className="space-y-1 px-2">
        {filteredChats.map((chat) => (
          <ListItem
            key={chat.id}
            chat={chat}
            isSelected={chat.id === selectedChatId}
            onClick={() => onSelectChat(chat.id)}
            onDelete={onDeleteChat}
          />
        ))}
      </div>
    </SidebarContent>
  );
}
