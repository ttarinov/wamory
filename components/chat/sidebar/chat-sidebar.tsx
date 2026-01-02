'use client';

import { Sidebar } from '@/components/ui/sidebar';
import { Chat } from "@/lib/models";
import { useState } from 'react';
import { ResizableSidebar } from './resizable-sidebar';
import { ChatSidebarHeader as SidebarHeader } from './header/sidebar-header';
import { SidebarList } from './list/sidebar-list';

interface ChatSidebarProps {
  chats: Chat[];
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
  onAddChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatSidebar({
  chats,
  selectedChatId,
  onSelectChat,
  onAddChat,
  onDeleteChat,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter((chat) => {
    const query = searchQuery.toLowerCase().replace(/\s/g, '');
    const name = chat.name?.toLowerCase().replace(/\s/g, '') || '';
    const phone = chat.phoneNumber.replace(/\s/g, '').replace(/\+/g, '');
    const lastMessageContent = chat.lastMessage.content.toLowerCase();

    return (
      name.includes(query) ||
      phone.includes(query) ||
      lastMessageContent.includes(searchQuery.toLowerCase())
    );
  });

  return (
    <ResizableSidebar>
      <Sidebar variant="floating" collapsible="none">
        <SidebarHeader
          filteredChatsCount={filteredChats.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddChat={onAddChat}
        />
        <SidebarList
          filteredChats={filteredChats}
          selectedChatId={selectedChatId}
          onSelectChat={onSelectChat}
          onDeleteChat={onDeleteChat}
        />
      </Sidebar>
    </ResizableSidebar>
  );
}
