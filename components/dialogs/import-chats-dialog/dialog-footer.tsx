"use client"

import { Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useImportDialogContext } from "@/contexts/ImportDialogContext"

export function DialogFooter() {
  const {
    currentStep,
    selectedFiles,
    previewedChats,
    processing,
    isImporting,
    handleClose,
    handleBackToSelect,
    handleExtractAndPreview,
    handleConfirmImport,
  } = useImportDialogContext()

  if (currentStep === "select") {
    return (
      <>
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleExtractAndPreview} disabled={selectedFiles.size === 0 || processing.isProcessing} size="lg">
          {processing.isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Next: Preview ({selectedFiles.size})
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </>
    )
  }

  return (
    <>
      <Button variant="outline" onClick={handleBackToSelect} disabled={isImporting} size="lg">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Button onClick={handleConfirmImport} disabled={isImporting || previewedChats.length === 0} size="lg">
        {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Confirm Import ({previewedChats.length})
      </Button>
    </>
  )
}

