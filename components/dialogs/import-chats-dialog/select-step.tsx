"use client"

import { FileList } from "./file-list"
import { useImportDialogContext } from "@/contexts/ImportDialogContext"

export function SelectStep() {
  const { availableFiles } = useImportDialogContext()

  // if (availableFiles.length === 0) {
  //   return (
  //     <div className="flex-1 flex items-center justify-center text-muted-foreground">
  //       <div className="text-center space-y-2">
  //         <p className="text-base font-medium">No files selected</p>
  //         <p className="text-sm">Drop files here or use the Browse Files button</p>
  //       </div>
  //     </div>
  //   )
  // }

  return <FileList />
}

