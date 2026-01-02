'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Chat, Message } from "@/lib/models";
import { parseWhatsAppChat } from '@/lib/whatsapp-parser';
import { extractPhoneFromFilename } from '@/lib/utils/phone';
import { FileText, Folder, Archive, Loader2, Upload, FolderOpen, X, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/date-utils';
import type JSZip from 'jszip';

interface ImportFile {
  path?: string;
  name: string;
  type: 'zip' | 'folder' | 'file';
  phoneNumber: string;
  file?: File;
  content?: string;
}

interface ImportChatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingChats: Chat[];
  onImport: (chats: Chat[]) => void;
}

export function ImportChatsDialog({
  open,
  onOpenChange,
  existingChats,
  onImport,
}: ImportChatsDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<ImportFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState<'select' | 'preview'>('select');
  const [previewedChats, setPreviewedChats] = useState<Chat[]>([]);

  const scanForFiles = async () => {
    try {
      const response = await fetch('/api/scan-chats');
      if (response.ok) {
        const data = await response.json();
        const files: ImportFile[] = data.files || [];

        // Filter out files that are already imported
        const newFiles = files.filter(
          (file) =>
            !existingChats.some((chat) => chat.phoneNumber === file.phoneNumber)
        );

        setAvailableFiles(newFiles);
      }
    } catch (error) {
      setAvailableFiles([]);
    }
  };

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      scanForFiles();
      setSelectedFiles(new Set());
      setIsDragging(false);
      setCurrentStep('select');
      setPreviewedChats([]);
    }
    onOpenChange(isOpen);
  };

  const processFiles = async (files: FileList | File[]) => {
    setIsProcessing(true);
    const fileArray = Array.from(files);
    const newImportFiles: ImportFile[] = [];
    let skippedCount = 0;

    setProcessingMessage(`Processing ${fileArray.length} file(s)...`);

    for (const file of fileArray) {
      if (!file.name.endsWith('.txt') && !file.name.endsWith('.zip')) {
        skippedCount++;
        continue;
      }

      let phoneNumber = '';
      let fileName = file.name;
      let content = '';

      if (file.name.includes('WhatsApp Chat')) {
        phoneNumber = extractPhoneFromFilename(file.name);
      } else if (file.name === '_chat.txt') {
        skippedCount++;
        continue;
      }

      if (file.name.endsWith('.txt')) {
        try {
          content = await file.text();

          if (!phoneNumber) {
            const phoneMatch = content.match(/\+?\d{1,4}[\s-]?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4}/);
            if (phoneMatch) {
              phoneNumber = phoneMatch[0];
            }
          }
        } catch (error) {
          skippedCount++;
          continue;
        }
      }

      if (!phoneNumber) {
        skippedCount++;
        continue;
      }

      const isDuplicate = existingChats.some((chat) => chat.phoneNumber === phoneNumber) ||
        availableFiles.some((f) => f.phoneNumber === phoneNumber);

      if (isDuplicate) {
        skippedCount++;
        continue;
      }

      newImportFiles.push({
        name: fileName,
        type: file.name.endsWith('.zip') ? 'zip' : 'file',
        phoneNumber,
        file,
        content,
      });
    }

    if (newImportFiles.length > 0) {
      setAvailableFiles((prev) => [...prev, ...newImportFiles]);
      setSelectedFiles((prev) => {
        const newSet = new Set(prev);
        newImportFiles.forEach((f) => newSet.add(f.name));
        return newSet;
      });
    }

    setIsProcessing(false);
    setProcessingMessage('');

    if (newImportFiles.length === 0 && skippedCount > 0) {
      alert(`All ${skippedCount} file(s) were skipped. Make sure files are named like "WhatsApp Chat - +1234567890.txt" or contain phone numbers.`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
      // Reset input so the same file can be selected again
      e.target.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const toggleFile = (identifier: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(identifier)) {
      newSelected.delete(identifier);
    } else {
      newSelected.add(identifier);
    }
    setSelectedFiles(newSelected);
  };

  const toggleAll = () => {
    if (selectedFiles.size === availableFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(availableFiles.map((f) => f.path || f.name)));
    }
  };

  const handleExtractAndPreview = async () => {
    setIsProcessing(true);
    setProcessingMessage('Extracting chat data...');

    try {
      const JSZip = (await import('jszip')).default;
      const newChats: Chat[] = [];

      for (const file of availableFiles) {
        const identifier = file.path || file.name;
        if (!selectedFiles.has(identifier)) continue;

        let chatText = '';
        const sourceDir = file.type === 'folder' ? file.path : undefined;
        let zip: JSZip | null = null;

        if (file.content) {
          chatText = file.content;
        } else if (file.path) {
          let chatFilePath = file.path;

          if (file.type === 'folder') {
            chatFilePath = `${file.path}/_chat.txt`;
          } else if (file.type === 'zip') {
            continue;
          }
          const response = await fetch(
            `/api/read-chat?path=${encodeURIComponent(chatFilePath)}`
          );
          if (response.ok) {
            chatText = await response.text();
          }
        } else if (file.file) {
          if (file.file.name.endsWith('.zip')) {
            try {
              const arrayBuffer = await file.file.arrayBuffer();
              zip = await JSZip.loadAsync(arrayBuffer);
              const chatFile = zip.file('_chat.txt');

              if (chatFile) {
                chatText = await chatFile.async('text');
              } else {
                continue;
              }
            } catch (zipError) {
              continue;
            }
          } else if (file.file.name.endsWith('.txt')) {
            chatText = await file.file.text();
          }
        }

        if (chatText) {
          const chat = parseWhatsAppChat(chatText, file.phoneNumber);
          if (chat) {

            const attachmentFiles = Array.from(
              new Set(
                chat.messages
                  .filter((m: Message) => m.type !== 'text' && !!m.attachmentUrl)
                  .map((m: Message) => m.attachmentUrl as string)
              )
            );

            if (sourceDir && attachmentFiles.length > 0) {
              try {
                const mediaRes = await fetch('/api/copy-media', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    sourceDir,
                    chatId: chat.id,
                    files: attachmentFiles,
                  }),
                });

                if (mediaRes.ok) {
                  const mediaData = await mediaRes.json();
                  const copied = (mediaData?.copied || {}) as Record<string, string>;

                  const updatedMessages = chat.messages.map((m: Message) => {
                    if (!m.attachmentUrl) return m;
                    const url = copied[m.attachmentUrl];
                    if (!url) return m;
                    return { ...m, attachmentUrl: url };
                  });

                  const updatedLastMessage =
                    updatedMessages.find((m) => m.id === chat.lastMessage.id) ||
                    updatedMessages[updatedMessages.length - 1] ||
                    chat.lastMessage;

                  newChats.push({
                    ...chat,
                    messages: updatedMessages,
                    lastMessage: updatedLastMessage,
                  });
                  continue;
                }
              } catch (mediaError) {
                // Failed to copy media, continue without media
              }
            }

            if (zip && attachmentFiles.length > 0) {
              try {
                const zipFileNames = Object.keys(zip.files || {});
                const findZipEntry = (name: string) => {
                  const direct = zip.file(name);
                  if (direct) return direct;
                  const matchKey =
                    zipFileNames.find((k) => k === name) ||
                    zipFileNames.find((k) => k.endsWith(`/${name}`)) ||
                    zipFileNames.find((k) => k.endsWith(name));
                  return matchKey ? zip.file(matchKey) : null;
                };

                const form = new FormData();
                form.append('chatId', chat.id);

                const toUpload: string[] = [];
                for (const name of attachmentFiles) {
                  const entry = findZipEntry(name);
                  if (!entry) continue;
                  const bytes = await entry.async('uint8array');
                  form.append('files', new Blob([bytes]), name);
                  toUpload.push(name);
                }

                if (toUpload.length > 0) {
                  const uploadRes = await fetch('/api/upload-media', {
                    method: 'POST',
                    body: form,
                  });

                  if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    const copied = (uploadData?.copied || {}) as Record<string, string>;

                    const updatedMessages = chat.messages.map((m: Message) => {
                      if (!m.attachmentUrl) return m;
                      const url = copied[m.attachmentUrl];
                      if (!url) return m;
                      return { ...m, attachmentUrl: url };
                    });

                    const updatedLastMessage =
                      updatedMessages.find((m) => m.id === chat.lastMessage.id) ||
                      updatedMessages[updatedMessages.length - 1] ||
                      chat.lastMessage;

                    newChats.push({
                      ...chat,
                      messages: updatedMessages,
                      lastMessage: updatedLastMessage,
                    });
                    continue;
                  }
                }
              } catch (zipMediaError) {
                // Failed to upload media, continue without media
              }
            }

            newChats.push(chat);
          }
        }
      }
      setPreviewedChats(newChats);
      setCurrentStep('preview');
    } catch (error) {
      alert('Error extracting chat data. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleConfirmImport = async () => {
    setIsImporting(true);

    try {
      onImport(previewedChats);
      onOpenChange(false);
    } catch (error) {
      // Import failed
    } finally {
      setIsImporting(false);
    }
  };

  const handleBackToSelect = () => {
    setCurrentStep('select');
    setPreviewedChats([]);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'zip':
        return <Archive className="h-4 w-4" />;
      case 'folder':
        return <Folder className="h-4 w-4" />;
      case 'file':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const isDuplicate = (phoneNumber: string) => {
    return existingChats.some((chat) => chat.phoneNumber === phoneNumber);
  };

  const removeFile = (identifier: string) => {
    setAvailableFiles((prev) => prev.filter((f) => (f.path || f.name) !== identifier));
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(identifier);
      return newSet;
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'select' ? 'Import WhatsApp Chats' : 'Preview Extracted Chats'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'select'
              ? 'Select WhatsApp chat files, folders, or zip archives to import. Duplicates will be automatically filtered.'
              : 'Review the extracted chat information and confirm the import.'}
          </DialogDescription>
        </DialogHeader>

        {currentStep === 'select' ? (
          <div className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'rounded-lg border-2 border-dashed p-6 text-center transition-colors',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">{processingMessage}</p>
                </>
              ) : (
                <>
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">
                    Drag and drop WhatsApp chat files here
                  </p>
                  <p className="text-xs text-muted-foreground">or</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={openFileDialog}
                    disabled={isProcessing}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Select from computer
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".txt,.zip"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Supports .txt and .zip files (e.g., &quot;WhatsApp Chat - +1234567890.txt&quot;)
                  </p>
                </>
              )}
            </div>

            {availableFiles.length > 0 && (
              <div className="flex items-center gap-2 border-b pb-3">
                <Checkbox
                  checked={selectedFiles.size === availableFiles.length}
                  onCheckedChange={toggleAll}
                />
                <span className="text-sm font-medium">
                  Select all ({availableFiles.length} available)
                </span>
              </div>
            )}

            <ScrollArea className="h-[300px] rounded-md border p-4">
              {availableFiles.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No chats available. Drop files above or scan server.
                </div>
              ) : (
                <div className="space-y-2">
                  {availableFiles.map((file, index) => {
                    const identifier = file.path || file.name;
                    return (
                      <div
                        key={`${identifier}-${index}`}
                        className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent"
                      >
                        <Checkbox
                          checked={selectedFiles.has(identifier)}
                          onCheckedChange={() => toggleFile(identifier)}
                        />
                        <div className="flex flex-1 items-center gap-2">
                          {getFileIcon(file.type)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.phoneNumber}</p>
                          </div>
                          {isDuplicate(file.phoneNumber) && (
                            <span className="text-xs text-muted-foreground">(Already imported)</span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => removeFile(identifier)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">
                  Successfully extracted {previewedChats.length} chat{previewedChats.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <ScrollArea className="h-[400px] rounded-md border p-4">
              {previewedChats.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No chats extracted. Please go back and try again.
                </div>
              ) : (
                <div className="space-y-3">
                  {previewedChats.map((chat) => (
                    <div
                      key={chat.id}
                      className="rounded-lg border bg-card p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {chat.name || chat.phoneNumber}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {chat.phoneNumber}
                          </p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Messages</p>
                          <p className="font-medium">{chat.messages.length}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last message</p>
                          <p className="font-medium">
                            {formatDistanceToNow(chat.lastMessage.timestamp)} ago
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Last message preview:</p>
                        <p className="text-sm line-clamp-2">
                          {chat.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        <DialogFooter>
          {currentStep === 'select' ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExtractAndPreview}
                disabled={selectedFiles.size === 0 || isProcessing}
              >
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Next: Preview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBackToSelect} disabled={isImporting}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleConfirmImport} disabled={isImporting || previewedChats.length === 0}>
                {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Import ({previewedChats.length})
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
