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
import { reviveChats } from '@/lib/chat-revive';
import { useStorageMode } from '@/components/auth/AuthGuard';

interface ChatLayoutProps {
  chats: Chat[];
  onChatsChange: (chats: Chat[]) => void;
}

export function ChatLayout({ chats, onChatsChange }: ChatLayoutProps) {
  const storageMode = useStorageMode();
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

  const showFeedback = useCallback((title: string, description?: string) => {
    setFeedback({ open: true, title, description });
  }, []);

  const handleUpdateChat = useCallback(async (
    chatId: string,
    updates: { name?: string; phoneNumber?: string }
  ) => {
    console.log('handleUpdateChat called', { chatId, updates });
    try {
      const updatedChats = chats.map((chat) => {
        if (chat.id === chatId) {
          const updated = {
            ...chat,
            ...(updates.name !== undefined && { name: updates.name || undefined }),
            ...(updates.phoneNumber !== undefined && { phoneNumber: updates.phoneNumber }),
          };
          console.log('Updated chat:', updated);
          return updated;
        }
        return chat;
      });

      console.log('Calling onChatsChange with updated chats');
      onChatsChange(updatedChats);

      await ChatStorage.saveChats(updatedChats, storageMode).catch((error) => {
        console.error('Failed to save chat updates:', error);
        showFeedback('Failed to save changes', 'Your changes may not be persisted.');
      });
    } catch (error) {
      showFeedback(
        'Failed to update chat',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }, [chats, onChatsChange, showFeedback]);

  const handleAddChat = useCallback(() => {
    setIsImportDialogOpen(true);
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
        // Save to storage in background
        ChatStorage.addChats(uniqueNewChats, storageMode).catch((error) => {
          console.error('Failed to save chats to storage:', error);
        });

        // Update state immediately without waiting for storage
        const updatedChats = [...chats, ...uniqueNewChats].sort((a, b) => 
          b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime()
        );
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
          'Failed to import chats',
          error instanceof Error ? error.message : 'Unknown error'
        );
        throw error;
      }
    } else {
      showFeedback(
        'Nothing to import',
        'No new chats to import. All selected chats already exist.'
      );
      return Promise.resolve();
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
                  onUpdateName={(name) => handleUpdateChat(selectedChat.id, { name })}
                  onUpdatePhoneNumber={(phoneNumber) => handleUpdateChat(selectedChat.id, { phoneNumber })}
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
