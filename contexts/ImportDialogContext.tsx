"use client"

import { createContext, useContext, ReactNode } from "react"
import type { Chat } from "@/lib/models"
import type { ImportFile } from "@/components/dialogs/import-chats-dialog/types"
import { useImportDialog } from "@/hooks/useImportDialog"

interface ImportDialogContextValue {
  selectedFiles: Set<string>
  isImporting: boolean
  availableFiles: ImportFile[]
  isDragging: boolean
  searchQuery: string
  currentStep: "select" | "phone-numbers" | "preview"
  previewedChats: Chat[]
  fileInputRef: React.RefObject<HTMLInputElement | null>
  processing: {
    isProcessing: boolean
    message: string
    progress: number
    startProcessing: (message: string) => void
    updateProgress: (message: string, progress: number) => void
    stopProcessing: () => void
  }
  setSearchQuery: (query: string) => void
  handleOpen: (isOpen: boolean) => void
  handleClose: () => void
  handleDragOver: (e: React.DragEvent) => void
  handleDragLeave: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  openFileDialog: () => void
  toggleFile: (identifier: string) => void
  toggleAll: () => void
  removeFile: (identifier: string) => void
  updateFilePhoneNumber: (fileName: string, phoneNumber: string) => void
  handleProceedToPhoneNumbers: () => void
  handleProceedToPreview: () => void
  handleExtractAndPreview: () => void
  handleConfirmImport: () => void
  handleBackToSelect: () => void
  isDuplicate: (phoneNumber: string) => boolean
}

const ImportDialogContext = createContext<ImportDialogContextValue | null>(null)

interface ImportDialogProviderProps {
  children: ReactNode
  existingChats: Chat[]
  onImport: (chats: Chat[]) => void
  onOpenChange: (open: boolean) => void
}

export function ImportDialogProvider({
  children,
  existingChats,
  onImport,
  onOpenChange,
}: ImportDialogProviderProps) {
  const dialogState = useImportDialog(existingChats, onImport, onOpenChange)

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <ImportDialogContext.Provider value={{ ...dialogState, handleClose }}>
      {children}
    </ImportDialogContext.Provider>
  )
}

export function useImportDialogContext() {
  const context = useContext(ImportDialogContext)
  if (!context) {
    throw new Error("useImportDialogContext must be used within ImportDialogProvider")
  }
  return context
}
