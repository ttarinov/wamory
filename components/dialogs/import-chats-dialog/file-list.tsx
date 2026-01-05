"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, FolderOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileItem } from "./file-item"
import { useImportDialogContext } from "@/contexts/ImportDialogContext"

const ITEMS_PER_PAGE = 100

export function FileList() {
  const {
    availableFiles,
    selectedFiles,
    searchQuery,
    setSearchQuery,
    toggleAll,
    openFileDialog,
    processing,
  } = useImportDialogContext()

  const [currentPage, setCurrentPage] = useState(1)

  const filteredFiles = useMemo(() => {
    return availableFiles.filter((file) => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      return file.name.toLowerCase().includes(query) || file.phoneNumber.toLowerCase().includes(query)
    })
  }, [availableFiles, searchQuery])

  const totalPages = useMemo(
    () => Math.ceil(filteredFiles.length / ITEMS_PER_PAGE),
    [filteredFiles.length]
  )

  const paginatedFiles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredFiles.slice(startIndex, endIndex)
  }, [filteredFiles, currentPage])

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-4">
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <Checkbox checked={selectedFiles.size === availableFiles.length} onCheckedChange={toggleAll} />
          <span className="text-sm font-semibold">
            {availableFiles.length}
          </span>
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files or phone numbers..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          variant="default"
          onClick={openFileDialog}
          disabled={processing.isProcessing}
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          Browse Files
        </Button>
      </div>

      <div className="flex-1 h-0 overflow-auto rounded-lg border bg-muted/20">
        <div className="p-4">
          {filteredFiles.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              {searchQuery ? "No files match your search" : "Upload your WhatsApp chat files here"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {paginatedFiles.map((file, index) => {
                const identifier = file.path || file.name
                return (
                  <FileItem
                    key={`${identifier}-${index}`}
                    file={file}
                    index={index}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 px-2 shrink-0">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredFiles.length)} of {filteredFiles.length} files
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

