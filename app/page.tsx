'use client';

import { ChatLayout } from '@/components/chat/chat-layout';
import { useState, useEffect } from 'react';
import { Chat } from '@/lib/models';
import { ChatStorage } from '@/lib/chat-storage';
import { reviveChats } from '@/lib/chat-revive';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ChatStorage.loadChats()
      .then(loaded => {
        const revived = reviveChats(loaded);
        setChats(revived);
      })
      .catch(() => setChats([]))
      .finally(() => setLoading(false));
  }, []);

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
