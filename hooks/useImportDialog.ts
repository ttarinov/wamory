import { useState, useRef } from "react"
import type { Chat } from "@/lib/models"
import type { ImportFile } from "@/components/dialogs/import-chats-dialog/types"
import { ChatImportService } from "@/lib/services/chat-import-service"
import { validateImportFile, getFileIdentifier } from "@/lib/utils/file-import-utils"
import { useProcessingState } from "./useProcessingState"

export function useImportDialog(
  existingChats: Chat[],
  onImport: (chats: Chat[]) => void,
  onOpenChange: (open: boolean) => void
) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [isImporting, setIsImporting] = useState(false)
  const [availableFiles, setAvailableFiles] = useState<ImportFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentStep, setCurrentStep] = useState<"select" | "preview">("select")
  const [previewedChats, setPreviewedChats] = useState<Chat[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const processing = useProcessingState()

  const scanForFiles = async () => {
    try {
      const response = await fetch("/api/scan-chats")
      if (response.ok) {
        const data = await response.json()
        const files: ImportFile[] = data.files || []
        const newFiles = files.filter((file) => !existingChats.some((chat) => chat.phoneNumber === file.phoneNumber))
        setAvailableFiles(newFiles)
      }
    } catch (error) {
      setAvailableFiles([])
    }
  }

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      scanForFiles()
      setSelectedFiles(new Set())
      setIsDragging(false)
      setCurrentStep("select")
      setPreviewedChats([])
    } else {
      setSelectedFiles(new Set())
      setAvailableFiles([])
      setIsDragging(false)
      setSearchQuery("")
      setCurrentStep("select")
      setPreviewedChats([])
      setIsImporting(false)
      processing.stopProcessing()
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
    onOpenChange(isOpen)
  }

  const processFiles = async (files: FileList | File[]) => {
    processing.startProcessing(`Processing ${files.length} file(s)...`)

    const fileArray = Array.from(files)
    const newImportFiles: ImportFile[] = []
    const existingPhoneNumbers = new Set(existingChats.map(c => c.phoneNumber))
    const availablePhoneNumbers = new Set(availableFiles.map(f => f.phoneNumber))
    let skippedCount = 0

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      processing.updateProgress(
        `Processing file ${i + 1} of ${fileArray.length}...`,
        Math.round(((i + 1) / fileArray.length) * 100)
      )

      const validation = await validateImportFile(file, existingPhoneNumbers, availablePhoneNumbers)

      if (!validation.valid) {
        skippedCount++
        continue
      }

      newImportFiles.push({
        name: file.name,
        type: file.name.endsWith(".zip") ? "zip" : "file",
        phoneNumber: validation.phoneNumber!,
        file,
        content: validation.content,
      })

      availablePhoneNumbers.add(validation.phoneNumber!)
    }

    if (newImportFiles.length > 0) {
      setAvailableFiles((prev) => [...prev, ...newImportFiles])
      setSelectedFiles((prev) => {
        const newSet = new Set(prev)
        newImportFiles.forEach((f) => newSet.add(getFileIdentifier(f)))
        return newSet
      })
    }

    processing.stopProcessing()

    if (newImportFiles.length === 0 && skippedCount > 0) {
      alert(
        `All ${skippedCount} file(s) were skipped. Make sure files are named like "WhatsApp Chat - +1234567890.txt" or contain phone numbers.`
      )
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files)
      e.target.value = ""
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const toggleFile = (identifier: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(identifier)) {
        newSet.delete(identifier)
      } else {
        newSet.add(identifier)
      }
      return newSet
    })
  }

  const toggleAll = () => {
    if (selectedFiles.size === availableFiles.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(availableFiles.map((f) => getFileIdentifier(f))))
    }
  }

  const removeFile = (identifier: string) => {
    setAvailableFiles((prev) => prev.filter((f) => getFileIdentifier(f) !== identifier))
    setSelectedFiles((prev) => {
      const newSet = new Set(prev)
      newSet.delete(identifier)
      return newSet
    })
  }

  const handleExtractAndPreview = async () => {
    processing.startProcessing("Extracting chat data...")

    try {
      const selectedFilesList = availableFiles.filter((file) =>
        selectedFiles.has(getFileIdentifier(file))
      )

      const newChats = await ChatImportService.extractChatsFromFiles(
        selectedFilesList,
        availableFiles,
        (message, progress) => processing.updateProgress(message, progress)
      )

      setPreviewedChats(newChats)
      setCurrentStep("preview")
    } catch (error) {
      console.error("Extraction error:", error)
      alert("Error extracting chat data. Please try again.")
    } finally {
      processing.stopProcessing()
    }
  }

  const handleConfirmImport = async () => {
    setIsImporting(true)

    try {
      await onImport(previewedChats)
      onOpenChange(false)
    } catch (error) {
      console.error("Import failed:", error)
      alert(error instanceof Error ? error.message : "Failed to import chats. Please try again.")
    } finally {
      setIsImporting(false)
    }
  }

  const handleBackToSelect = () => {
    setCurrentStep("select")
    setPreviewedChats([])
  }

  const isDuplicate = (phoneNumber: string) => {
    return existingChats.some((chat) => chat.phoneNumber === phoneNumber)
  }

  return {
    // State
    selectedFiles,
    isImporting,
    availableFiles,
    isDragging,
    searchQuery,
    currentStep,
    previewedChats,
    fileInputRef,
    processing,

    // Setters
    setSearchQuery,

    // Handlers
    handleOpen,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    openFileDialog,
    toggleFile,
    toggleAll,
    removeFile,
    handleExtractAndPreview,
    handleConfirmImport,
    handleBackToSelect,
    isDuplicate,
  }
}
