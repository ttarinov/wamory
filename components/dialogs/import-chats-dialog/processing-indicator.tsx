import { Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ProcessingIndicatorProps {
  message: string
  progress: number
}

export function ProcessingIndicator({ message, progress }: ProcessingIndicatorProps) {
  return (
    <div className="space-y-4">
      <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
      <div className="space-y-2">
        <p className="text-base font-semibold">{message}</p>
        <div className="max-w-md mx-auto space-y-1">
          <Progress value={progress} className="h-2.5" />
          <p className="text-xs text-muted-foreground">{progress}% complete</p>
        </div>
      </div>
    </div>
  )
}

