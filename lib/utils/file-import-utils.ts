import type { ImportFile } from '@/components/dialogs/import-chats-dialog/types';
import { extractPhoneFromFilename, isPhoneNumber } from './phone';

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
  contactName?: string;
  needsPhoneNumber?: boolean;
  error?: string;
  content?: string;
}> {
  if (!isValidImportFileType(file.name)) {
    return { valid: false, error: 'Invalid file type' };
  }

  if (file.name === '_chat.txt') {
    return { valid: false, error: 'Internal chat file' };
  }

  let extractedValue = '';
  let phoneNumber = '';
  let contactName = '';
  let needsPhoneNumber = false;
  let content = '';

  if (file.name.includes('WhatsApp Chat')) {
    extractedValue = extractPhoneFromFilename(file.name);

    if (extractedValue && isPhoneNumber(extractedValue)) {
      phoneNumber = extractedValue;
    } else if (extractedValue) {
      contactName = extractedValue;
      needsPhoneNumber = true;
      phoneNumber = extractedValue;
    }
  }

  if (file.name.endsWith('.txt')) {
    try {
      content = await file.text();

      if (!phoneNumber && !contactName) {
        const extracted = extractPhoneFromContent(content);
        if (extracted) {
          phoneNumber = extracted;
        }
      }
    } catch (error) {
      return { valid: false, error: 'Failed to read file' };
    }
  }

  if (!phoneNumber && !contactName) {
    return { valid: false, error: 'No phone number or contact name found' };
  }

  if (!needsPhoneNumber && phoneNumber) {
    if (existingPhoneNumbers.has(phoneNumber) || availablePhoneNumbers.has(phoneNumber)) {
      return { valid: false, error: 'Duplicate chat', phoneNumber };
    }
  }

  return {
    valid: true,
    phoneNumber,
    contactName: contactName || undefined,
    needsPhoneNumber,
    content: content || undefined,
  };
}
