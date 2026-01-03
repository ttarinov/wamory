import type { ImportFile } from '@/components/dialogs/import-chats-dialog/types';
import { extractPhoneFromFilename } from './phone';

/**
 * Get a unique identifier for an import file
 */
export function getFileIdentifier(file: ImportFile): string {
  return file.path || file.name;
}

/**
 * Check if a file type is valid for import
 */
export function isValidImportFileType(fileName: string): boolean {
  return fileName.endsWith('.txt') || fileName.endsWith('.zip');
}

/**
 * Extract phone number from file content
 * Looks for patterns like +1234567890 or similar
 */
export function extractPhoneFromContent(content: string): string | null {
  const phoneMatch = content.match(/\+?\d{1,4}[\s-]?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4}/);
  return phoneMatch ? phoneMatch[0] : null;
}

/**
 * Validate an import file and extract phone number
 * Returns validation result with phone number if valid
 */
export async function validateImportFile(
  file: File,
  existingPhoneNumbers: Set<string>,
  availablePhoneNumbers: Set<string>
): Promise<{
  valid: boolean;
  phoneNumber?: string;
  error?: string;
  content?: string;
}> {
  // Check file type
  if (!isValidImportFileType(file.name)) {
    return { valid: false, error: 'Invalid file type' };
  }

  // Skip _chat.txt files (internal zip files)
  if (file.name === '_chat.txt') {
    return { valid: false, error: 'Internal chat file' };
  }

  let phoneNumber = '';
  let content = '';

  // Try to extract phone from filename first
  if (file.name.includes('WhatsApp Chat')) {
    phoneNumber = extractPhoneFromFilename(file.name);
  }

  // For .txt files, read content and try to extract phone if not found
  if (file.name.endsWith('.txt')) {
    try {
      content = await file.text();

      if (!phoneNumber) {
        const extracted = extractPhoneFromContent(content);
        if (extracted) {
          phoneNumber = extracted;
        }
      }
    } catch (error) {
      return { valid: false, error: 'Failed to read file' };
    }
  }

  // Must have a phone number
  if (!phoneNumber) {
    return { valid: false, error: 'No phone number found' };
  }

  // Check for duplicates
  if (existingPhoneNumbers.has(phoneNumber) || availablePhoneNumbers.has(phoneNumber)) {
    return { valid: false, error: 'Duplicate chat', phoneNumber };
  }

  return {
    valid: true,
    phoneNumber,
    content: content || undefined,
  };
}
