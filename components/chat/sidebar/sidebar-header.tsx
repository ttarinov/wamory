'use client';

import { Plus, MessageCircleIcon, User, LogOut } from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SessionService } from '@/lib/services/session-service';

interface SidebarHeaderProps {
  filteredChatsCount: number;
  totalChatsCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddChat: () => void;
}

export function ChatSidebarHeader({
  filteredChatsCount,
  totalChatsCount,
  searchQuery,
  onSearchChange,
  onAddChat,
}: SidebarHeaderProps) {
  const handleSignOut = () => {
    SessionService.clearSession();
    window.location.reload();
  };

  return (
    <SidebarHeader>
      <div className="flex items-center justify-between p-4">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-black">
                  <User className="h-5 w-5 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">user</span>
                <span className="text-xs text-muted-foreground">
                  {totalChatsCount} chats
                </span>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-42 p-2">
            <Button
              onClick={handleSignOut}
              className="flex w-full rounded-md px-3 py-2 text-left text-sm bg-accent text-black hover:bg-black hover:text-white hover:cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="rounded-full border border-gray-200 hover:cursor-pointer bg-black text-white">
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
