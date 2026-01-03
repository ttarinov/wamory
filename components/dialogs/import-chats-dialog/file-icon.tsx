import { Archive, Folder, FileText } from "lucide-react"

interface FileIconProps {
  type: "zip" | "folder" | "file"
}

export function FileIcon({ type }: FileIconProps) {
  switch (type) {
    case "zip":
      return <Archive className="h-4 w-4" />
    case "folder":
      return <Folder className="h-4 w-4" />
    case "file":
      return <FileText className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

