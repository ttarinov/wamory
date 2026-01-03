"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { SuccessBanner } from "./success-banner"
import { PreviewChatCard } from "./preview-chat-card"
import { useImportDialogContext } from "@/contexts/ImportDialogContext"

export function PreviewStep() {
  const { previewedChats } = useImportDialogContext()

  return (
    <div className="space-y-4 flex-1 min-h-0 flex flex-col">
      <SuccessBanner count={previewedChats.length} />

      <ScrollArea className="flex-1 rounded-lg border bg-muted/20">
        <div className="p-4">
          {previewedChats.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No chats extracted. Please go back and try again.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {previewedChats.map((chat) => (
                <PreviewChatCard key={chat.id} chat={chat} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

