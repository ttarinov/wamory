"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { SuccessBanner } from "./success-banner"
import { PreviewChatCard } from "./preview-chat-card"
import { useImportDialogContext } from "@/contexts/ImportDialogContext"

const ITEMS_PER_PAGE = 100

export function PreviewStep() {
  const { previewedChats } = useImportDialogContext()
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = useMemo(
    () => Math.ceil(previewedChats.length / ITEMS_PER_PAGE),
    [previewedChats.length]
  )

  const paginatedChats = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return previewedChats.slice(startIndex, endIndex)
  }, [previewedChats, currentPage])

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  if (previewedChats.length === 0) {
    return (
      <div className="flex-1 min-h-0 flex flex-col space-y-4">
        <SuccessBanner count={0} />
        <div className="flex h-full items-center justify-center text-muted-foreground">
          No chats extracted. Please go back and try again.
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-4">
      <div className="shrink-0">
        <SuccessBanner count={previewedChats.length} />
      </div>

      <div className="flex-1 h-0 overflow-auto rounded-lg border bg-muted/20">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {paginatedChats.map((chat) => (
              <PreviewChatCard key={chat.id} chat={chat} />
            ))}
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 px-2 shrink-0">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, previewedChats.length)} of {previewedChats.length} chats
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground min-w-[100px] text-center">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

