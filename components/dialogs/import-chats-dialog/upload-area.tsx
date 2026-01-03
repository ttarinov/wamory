"use client"

import type React from "react"
import { Upload, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ProcessingIndicator } from "./processing-indicator"

interface UploadAreaProps {
  isDragging: boolean
  isProcessing: boolean
  processingMessage: string
  processingProgress: number
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onFileSelect: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function UploadArea({
  isDragging,
  isProcessing,
  processingMessage,
  processingProgress,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  fileInputRef,
  onFileChange,
}: UploadAreaProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "rounded-xl border-2 border-dashed p-12 text-center transition-all",
        "bg-gradient-to-br from-muted/30 to-muted/10",
        isDragging
          ? "border-primary bg-primary/10 scale-[1.02] shadow-lg"
          : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/20",
      )}
    >
      {isProcessing ? (
        <ProcessingIndicator message={processingMessage} progress={processingProgress} />
      ) : (
        <div className="space-y-4">
          <div
            className={cn(
              "mx-auto w-20 h-20 rounded-full flex items-center justify-center",
              "bg-primary/10 border-2 border-dashed border-primary/30",
              isDragging && "animate-pulse",
            )}
          >
            <Upload className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold">Drop your WhatsApp chat files here</p>
            <p className="text-sm text-muted-foreground">Supports .txt and .zip files</p>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <div className="h-px w-16 bg-border" />
            <span className="text-xs text-muted-foreground font-medium">OR</span>
            <div className="h-px w-16 bg-border" />
          </div>
          <Button
            type="button"
            variant="default"
            size="lg"
            className="mt-2"
            onClick={onFileSelect}
            disabled={isProcessing}
          >
            <FolderOpen className="mr-2 h-5 w-5" />
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.zip"
            onChange={onFileChange}
            className="hidden"
          />
          <p className="mt-4 text-xs text-muted-foreground">
            Example: &quot;WhatsApp Chat - +1234567890.txt&quot;
          </p>
        </div>
      )}
    </div>
  )
}

