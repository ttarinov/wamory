"use client"

import { Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { getFileIdentifier } from "@/lib/utils/file-import-utils"
import { Button } from "@/components/ui/button"
import { useImportDialogContext } from "@/contexts/ImportDialogContext"

export function DialogFooter() {
  const {
    currentStep,
    selectedFiles,
    availableFiles,
    previewedChats,
    processing,
    isImporting,
    handleClose,
    handleBackToSelect,
    handleProceedToPhoneNumbers,
    handleProceedToPreview,
    handleConfirmImport,
  } = useImportDialogContext()

  if (currentStep === "select") {
    return (
      <>
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleProceedToPhoneNumbers} disabled={selectedFiles.size === 0 || processing.isProcessing} size="lg">
          {processing.isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Next: Preview ({selectedFiles.size})
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </>
    )
  }

  if (currentStep === "phone-numbers") {
    const selectedFilesList = availableFiles.filter((file) =>
      selectedFiles.has(getFileIdentifier(file))
    )
    const filesNeedingNumbers = selectedFilesList.filter((f) => f.needsPhoneNumber)
    const allHavePhoneNumbers = filesNeedingNumbers.every(
      (f) => f.userProvidedPhoneNumber && f.userProvidedPhoneNumber.trim()
    )

    return (
      <>
        <Button variant="outline" onClick={handleBackToSelect} disabled={processing.isProcessing} size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleProceedToPreview} disabled={!allHavePhoneNumbers || processing.isProcessing} size="lg">
          {processing.isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Next: Preview
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

