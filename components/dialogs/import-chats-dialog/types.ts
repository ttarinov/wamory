export interface ImportFile {
  path?: string
  name: string
  type: "zip" | "folder" | "file"
  phoneNumber: string
  file?: File
  content?: string
  contactName?: string
  needsPhoneNumber?: boolean
  userProvidedPhoneNumber?: string
}

