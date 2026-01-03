"use client"

import { Search, FolderOpen } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileItem } from "./file-item"
import { useImportDialogContext } from "@/contexts/ImportDialogContext"

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

  const filteredFiles = availableFiles.filter((file) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return file.name.toLowerCase().includes(query) || file.phoneNumber.toLowerCase().includes(query)
  })

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
            onChange={(e) => setSearchQuery(e.target.value)}
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

      <ScrollArea className="flex-1 min-h-60 rounded-lg border bg-muted/20">
        <div className="p-4">
          {filteredFiles.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              {searchQuery ? "No files match your search" : "Upload your WhatsApp chat files here"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredFiles.map((file, index) => {
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
      </ScrollArea>
    </div>
  )
}

