'use client';

import { Plus, MessageCircleIcon } from 'lucide-react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  SidebarHeader,
  SidebarInput,
} from '@/components/ui/sidebar';

interface SidebarHeaderProps {
  filteredChatsCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddChat: () => void;
}

export function ChatSidebarHeader({
  filteredChatsCount,
  searchQuery,
  onSearchChange,
  onAddChat,
}: SidebarHeaderProps) {
  return (
    <SidebarHeader>
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-semibold">
          Chats ({filteredChatsCount})
          </h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="rounded-full border border-gray-200 hover:cursor-pointer bg-green-500 text-white">
              <Plus className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-42 p-2">
            <Button
              onClick={onAddChat}
              className="flex  w-full rounded-md px-3 py-2 text-left text-sm bg-accent text-black hover:bg-black hover:text-white hover:cursor-pointer"
            >
              <div className='relative'>
              <MessageCircleIcon/>
              </div>
              Add new chats
            </Button>
          </PopoverContent>
        </Popover>
      </div>
      <div className="relative px-2">
        <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <SidebarInput
          placeholder="Search chats..."
          className="pl-9 rounded-full"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </SidebarHeader>
  );
}
