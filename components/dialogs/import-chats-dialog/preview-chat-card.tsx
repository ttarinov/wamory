import { CheckCircle2 } from "lucide-react"
import { formatDistanceToNow } from "@/lib/date-utils"
import type { Chat } from "@/lib/models"

interface PreviewChatCardProps {
  chat: Chat
}

export function PreviewChatCard({ chat }: PreviewChatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-3 space-y-2 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-2">
        <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{chat.name || chat.phoneNumber}</h3>
          <p className="text-xs text-muted-foreground font-mono">{chat.phoneNumber}</p>
        </div>
      </div>

      <div className="flex gap-2 text-xs">
        <div className="rounded bg-muted/50 px-2 py-1 flex-1">
          <span className="text-muted-foreground">{chat.messages.length}</span>
          <span className="text-muted-foreground ml-1">msgs</span>
        </div>
        <div className="rounded bg-muted/50 px-2 py-1 flex-1">
          <span className="text-muted-foreground">{formatDistanceToNow(chat.lastMessage.timestamp)}</span>
        </div>
      </div>

      <p className="text-xs line-clamp-1 text-muted-foreground">
        &quot;{chat.lastMessage.content}&quot;
      </p>
    </div>
  )
}

