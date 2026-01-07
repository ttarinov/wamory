'use client';

import { ChatLayout } from '@/components/chat/chat-layout';
import { useState, useEffect } from 'react';
import { Chat } from '@/lib/models';
import { ChatStorage } from '@/lib/chat-storage';
import { reviveChats } from '@/lib/chat-revive';
import { useStorageMode } from '@/components/auth/AuthGuard';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const storageMode = useStorageMode();

  useEffect(() => {
    ChatStorage.loadChats(storageMode)
      .then(loaded => {
        const revived = reviveChats(loaded);
        const sorted = revived.sort((a, b) => 
          b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime()
        );
        setChats(sorted);
      })
      .catch(() => setChats([]))
      .finally(() => setLoading(false));
  }, [storageMode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-muted/30">
      <ChatLayout chats={chats} onChatsChange={setChats} />
    </div>
  );
}
