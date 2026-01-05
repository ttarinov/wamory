"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useImportDialogContext } from "@/contexts/ImportDialogContext"
import { getFileIdentifier } from "@/lib/utils/file-import-utils"

export function PhoneNumberStep() {
  const { selectedFiles, availableFiles, updateFilePhoneNumber, updateFileContactName } = useImportDialogContext()

  const selectedFilesList = availableFiles.filter((file) =>
    selectedFiles.has(getFileIdentifier(file))
  )
  const filesNeedingPhoneNumbers = selectedFilesList.filter((file) => file.needsPhoneNumber)

  if (filesNeedingPhoneNumbers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No contacts need phone numbers
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 h-0 overflow-auto rounded-lg border bg-muted/20">
        <div className="p-4 space-y-6">
          {filesNeedingPhoneNumbers.map((file) => (
            <div key={getFileIdentifier(file)} className="space-y-3 pb-4 border-b last:border-b-0">
              <div className="text-sm text-muted-foreground">
                {file.name}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`name-${getFileIdentifier(file)}`} className="text-xs">
                  Contact Name
                </Label>
                <Input
                  id={`name-${getFileIdentifier(file)}`}
                  type="text"
                  placeholder="Enter contact name"
                  value={file.contactName || ""}
                  onChange={(e) => updateFileContactName(file.name, e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`phone-${getFileIdentifier(file)}`} className="text-xs">
                  Phone Number
                </Label>
                <Input
                  id={`phone-${getFileIdentifier(file)}`}
                  type="tel"
                  placeholder="+1234567890"
                  value={file.userProvidedPhoneNumber || ""}
                  onChange={(e) => updateFilePhoneNumber(file.name, e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

