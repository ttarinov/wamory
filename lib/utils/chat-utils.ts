import type { Chat, Message } from '@/lib/models';
import type JSZip from 'jszip';

/**
 * Remap message attachment URLs based on a mapping
 * Used after media has been copied/uploaded to new locations
 */
export function remapMessageAttachments(
  messages: Message[],
  urlMapping: Record<string, string>
): Message[] {
  return messages.map((m) => {
    if (!m.attachmentUrl) return m;
    const newUrl = urlMapping[m.attachmentUrl];
    if (!newUrl) return m;
    return { ...m, attachmentUrl: newUrl };
  });
}

/**
 * Find the last valid message from an array
 * Falls back to array's last message if original is not found
 */
export function findLastValidMessage(
  messages: Message[],
  originalLastMessage: Message
): Message {
  return (
    messages.find((m) => m.id === originalLastMessage.id) ||
    messages[messages.length - 1] ||
    originalLastMessage
  );
}

/**
 * Extract all unique attachment file paths from a chat
 */
export function extractAttachmentPaths(chat: Chat): string[] {
  return Array.from(
    new Set(
      chat.messages
        .filter((m) => m.type !== 'text' && !!m.attachmentUrl)
        .map((m) => m.attachmentUrl as string)
    )
  );
}

/**
 * Find a file entry in a JSZip archive
 * Tries direct match, then path-based matches
 */
export function findZipEntry(
  zip: JSZip,
  fileName: string
): JSZip.JSZipObject | null {
  // Try direct file access
  const direct = zip.file(fileName);
  if (direct) return direct;

  // Try fuzzy matching with paths
  const zipFileNames = Object.keys(zip.files || {});
  const matchKey =
    zipFileNames.find((k) => k === fileName) ||
    zipFileNames.find((k) => k.endsWith(`/${fileName}`)) ||
    zipFileNames.find((k) => k.endsWith(fileName));

  return matchKey ? zip.file(matchKey) : null;
}
