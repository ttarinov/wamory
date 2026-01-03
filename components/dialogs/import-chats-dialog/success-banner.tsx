import { CheckCircle2 } from "lucide-react"

interface SuccessBannerProps {
  count: number
}

export function SuccessBanner({ count }: SuccessBannerProps) {
  return (
    <div className="rounded-xl border bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <p className="font-semibold text-lg">Extraction Complete!</p>
          <p className="text-sm text-muted-foreground">
            Successfully extracted {count} chat{count !== 1 ? "s" : ""} with all messages and media
          </p>
        </div>
      </div>
    </div>
  )
}

