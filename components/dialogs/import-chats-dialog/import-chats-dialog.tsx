"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter as UIDialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Chat } from "@/lib/models"
import { cn } from "@/lib/utils"
import { SelectStep } from "./select-step"
import { PreviewStep } from "./preview-step"
import { PhoneNumberStep } from "./phone-number-step"
import { DialogFooter } from "./dialog-footer"
import { ProcessingIndicator } from "./processing-indicator"
import { ImportDialogProvider, useImportDialogContext } from "@/contexts/ImportDialogContext"

interface ImportChatsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingChats: Chat[]
  onImport: (chats: Chat[]) => void
}

function ImportChatsDialogContent({ open }: { open: boolean }) {
  const {
    isDragging,
    currentStep,
    fileInputRef,
    processing,
    handleOpen,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
  } = useImportDialogContext()

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent
        className="!max-w-[95vw] sm:!max-w-[1200px] w-full max-h-[95vh] flex flex-col p-0"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          className={cn(
            "flex-1 min-h-0 flex flex-col transition-all",
            isDragging && "ring-2 ring-primary ring-offset-2"
          )}
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div>
              <DialogTitle className="text-2xl">
                {currentStep === "select"
                  ? "Import WhatsApp Chats"
                  : currentStep === "phone-numbers"
                  ? "Provide Phone Numbers"
                  : "Preview Extracted Chats"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {currentStep === "select"
                  ? "Drag and drop files or select from your computer. Duplicates will be automatically filtered."
                  : currentStep === "phone-numbers"
                  ? "Some contacts only have names. Please provide phone numbers for them."
                  : "Review the extracted chat information and confirm the import."}
              </DialogDescription>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.zip"
              onChange={handleFileSelect}
              className="hidden"
            />
          </DialogHeader>

          <div className="flex-1 min-h-0 flex flex-col px-6 py-4">
            {processing.isProcessing ? (
              <div className="flex-1 flex items-center justify-center">
                <ProcessingIndicator message={processing.message} progress={processing.progress} />
              </div>
            ) : currentStep === "select" ? (
              <SelectStep />
            ) : currentStep === "phone-numbers" ? (
              <PhoneNumberStep />
            ) : (
              <PreviewStep />
            )}
          </div>

          <UIDialogFooter className="gap-2 px-6 pb-6 pt-4 border-t">
            <DialogFooter />
          </UIDialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ImportChatsDialog({ open, onOpenChange, existingChats, onImport }: ImportChatsDialogProps) {
  return (
    <ImportDialogProvider existingChats={existingChats} onImport={onImport} onOpenChange={onOpenChange}>
      <ImportChatsDialogContent open={open} />
    </ImportDialogProvider>
  )
}
