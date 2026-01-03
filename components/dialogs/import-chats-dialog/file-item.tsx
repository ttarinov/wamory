"use client"

import { X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ImportFile } from "./types"
import { useImportDialogContext } from "@/contexts/ImportDialogContext"

interface FileItemProps {
  file: ImportFile
  index: number
}

export function FileItem({ file }: FileItemProps) {
  const { selectedFiles, toggleFile, removeFile, isDuplicate } = useImportDialogContext()

  const identifier = file.path || file.name
  const isSelected = selectedFiles.has(identifier)
  const duplicate = isDuplicate(file.phoneNumber)

  return (
    <div
      className={cn(
        "group flex items-start gap-2 rounded-lg border p-3 transition-all",
        "hover:bg-accent hover:shadow-sm",
        isSelected && "bg-primary/5 border-primary/50",
        duplicate && "opacity-60",
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => toggleFile(identifier)}
        disabled={duplicate}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate leading-tight">{file.name}</p>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">{file.phoneNumber}</p>
        {duplicate && (
          <span className="inline-block text-xs mt-1 px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            Already imported
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => removeFile(identifier)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}

