"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useImportDialogContext } from "@/contexts/ImportDialogContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"
import { getFileIdentifier } from "@/lib/utils/file-import-utils"

export function PhoneNumberStep() {
  const { selectedFiles, availableFiles, updateFilePhoneNumber } = useImportDialogContext()

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
    <ScrollArea className="flex-1">
      <div className="space-y-4">
        {filesNeedingPhoneNumbers.map((file) => (
          <Card key={getFileIdentifier(file)}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <CardTitle>{file.contactName || "Unknown Contact"}</CardTitle>
              </div>
              <CardDescription>File: {file.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor={`phone-${getFileIdentifier(file)}`}>Phone Number</Label>
                <Input
                  id={`phone-${getFileIdentifier(file)}`}
                  type="tel"
                  placeholder="+1234567890"
                  value={file.userProvidedPhoneNumber || ""}
                  onChange={(e) => updateFilePhoneNumber(file.name, e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}

