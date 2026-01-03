'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Chat } from "@/lib/models";
import { formatDistanceToNow } from '@/lib/date-utils';
import { Search, MoreVertical, Pencil } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ChatAvatar } from '@/components/chat/chat-avatar';
import { validatePhoneNumber } from '@/lib/utils/phone';

interface ChatHeaderProps {
  chat: Chat;
  onUpdateName: (name: string) => void;
  onUpdatePhoneNumber: (phoneNumber: string) => void;
  isSearchOpen: boolean;
  onToggleSearch: () => void;
}

export function ChatHeader({
  chat,
  onUpdateName,
  onUpdatePhoneNumber,
  isSearchOpen,
  onToggleSearch,
}: ChatHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(chat.name || '');
  const [phoneNumberInput, setPhoneNumberInput] = useState(chat.phoneNumber);

  useEffect(() => {
    setNameInput(chat.name || '');
    setPhoneNumberInput(chat.phoneNumber);
  }, [chat.name, chat.phoneNumber]);

  useEffect(() => {
    if (!isEditingName) {
      setNameInput(chat.name || '');
      setPhoneNumberInput(chat.phoneNumber);
    }
  }, [isEditingName, chat.name, chat.phoneNumber]);

  const handleSave = () => {
    const trimmedPhone = phoneNumberInput.trim();
    if (!validatePhoneNumber(trimmedPhone)) {
      return;
    }
    
    if (trimmedPhone !== chat.phoneNumber) {
      onUpdatePhoneNumber(trimmedPhone);
    }
    if (nameInput.trim() !== (chat.name || '')) {
      onUpdateName(nameInput.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="mx-4 mt-4 flex items-center gap-3 rounded-xl border bg-card px-6 py-3 shadow-md">
      <ChatAvatar
        name={chat.name}
        phoneNumber={chat.phoneNumber}
        avatar={chat.avatar}
        size="md"
      />

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">{chat.name || chat.phoneNumber}</h2>
          {chat.name && (
            <span className="text-sm text-muted-foreground">
              ({chat.phoneNumber})
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Last message {formatDistanceToNow(chat.lastMessage.timestamp)} ago
        </p>
      </div>

      <Button
        size="icon"
        variant={isSearchOpen ? 'secondary' : 'ghost'}
        onClick={onToggleSearch}
      >
        <Search className="h-5 w-5" />
      </Button>

      <Popover open={isEditingName} onOpenChange={setIsEditingName}>
        <PopoverTrigger asChild>
          <Button size="icon" variant="ghost">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              <h3 className="font-semibold">Edit contact</h3>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">
                  Phone number
                </label>
                <Input
                  value={phoneNumberInput}
                  onChange={(e) => setPhoneNumberInput(e.target.value)}
                  placeholder="Enter phone number"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSave();
                    }
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Name</label>
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSave();
                    }
                  }}
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                Save
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
