'use client';

import { useState, useMemo, useCallback } from 'react';
import { ChatSidebar } from './sidebar/chat-sidebar';
import { ChatHeader } from './header/chat-header';
import { ChatMessages } from './messages/chat-messages';
import { ChatInput } from './input/chat-input';
import { ImportChatsDialog } from '../dialogs/import-chats-dialog';
import { Chat } from '@/lib/models';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { FeedbackDialog } from '../dialogs/feedback-dialog';
import { ChatSearch } from './header/chat-search';
import { ChatStorage } from '@/lib/chat-storage';

interface ChatLayoutProps {
  chats: Chat[];
  onChatsChange: (chats: Chat[]) => void;
}

export function ChatLayout({ chats, onChatsChange }: ChatLayoutProps) {
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(
    chats[0]?.id
  );
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{
    open: boolean;
    title: string;
    description?: string;
  }>({ open: false, title: '' });

  const selectedChat = useMemo(
    () => chats.find((chat) => chat.id === selectedChatId),
    [chats, selectedChatId]
  );

  const handleUpdateName = useCallback(async (chatId: string, name: string) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, updates: { name } }),
      });

      if (response.ok) {
        onChatsChange(
          chats.map((chat) => (chat.id === chatId ? { ...chat, name } : chat))
        );
      }
    } catch (error) {
      // Update failed
    }
  }, [chats, onChatsChange]);

  const handleAddChat = useCallback(() => {
    setIsImportDialogOpen(true);
  }, []);

  const showFeedback = useCallback((title: string, description?: string) => {
    setFeedback({ open: true, title, description });
  }, []);

  const handleDeleteChat = useCallback(async (chatId: string) => {
    const ok = window.confirm('Delete this chat?');
    if (!ok) return;

    try {
      const res = await fetch('/api/chats', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showFeedback('Failed to delete chat', data?.error || res.statusText);
        return;
      }

      const remaining = chats.filter((c) => c.id !== chatId);
      onChatsChange(remaining);
      setSelectedChatId((prevSelected) => {
        if (prevSelected !== chatId) return prevSelected;
        return remaining[0]?.id;
      });
    } catch (error) {
      showFeedback(
        'Failed to delete chat',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }, [chats, onChatsChange, showFeedback]);

  const handleImportChats = useCallback(async (newChats: Chat[]) => {
    const existingPhoneNumbers = new Set(chats.map((c) => c.phoneNumber));
    const uniqueNewChats = newChats.filter(
      (chat) => !existingPhoneNumbers.has(chat.phoneNumber)
    );

    if (uniqueNewChats.length > 0) {
      try {
        await ChatStorage.addChats(uniqueNewChats);
        const updatedChats = [...chats, ...uniqueNewChats];
        onChatsChange(updatedChats);
        setSelectedChatId(uniqueNewChats[0].id);
        showFeedback(
          'Import completed',
          `Successfully imported ${uniqueNewChats.length} chat${
            uniqueNewChats.length !== 1 ? 's' : ''
          }.`
        );
      } catch (error) {
        showFeedback(
          'Failed to save chats',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    } else {
      showFeedback(
        'Nothing to import',
        'No new chats to import. All selected chats already exist.'
      );
    }
  }, [chats, onChatsChange, showFeedback]);

  return (
    <>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full bg-muted/30">
          <ChatSidebar
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
            onAddChat={handleAddChat}
            onDeleteChat={handleDeleteChat}
          />
          <SidebarInset className="relative flex flex-1 flex-col overflow-hidden">
            {selectedChat ? (
              <>
                <ChatHeader
                  chat={selectedChat}
                  onUpdateName={(name) => handleUpdateName(selectedChat.id, name)}
                  isSearchOpen={isChatSearchOpen}
                  onToggleSearch={() => {
                    setIsChatSearchOpen((v) => !v);
                    setChatSearchQuery('');
                  }}
                />
                {isChatSearchOpen ? (
                  <ChatSearch
                    chat={selectedChat}
                    query={chatSearchQuery}
                    onQueryChange={setChatSearchQuery}
                  />
                ) : null}
                <ChatMessages messages={selectedChat.messages} />
                <ChatInput disabled />
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-muted-foreground">
                Select a chat to start viewing messages
              </div>
            )}
          </SidebarInset>
        </div>
      </SidebarProvider>

      <ImportChatsDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        existingChats={chats}
        onImport={handleImportChats}
      />

      <FeedbackDialog
        open={feedback.open}
        title={feedback.title}
        description={feedback.description}
        onOpenChange={(open) => setFeedback((prev) => ({ ...prev, open }))}
      />
    </>
  );
}
