import { IMAGE_EXTENSIONS, AUDIO_EXTENSIONS, CONTENT_TYPES } from '@/lib/constants/file-constants';

export const isImage = (filename: string): boolean => {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
};

export const isAudio = (filename: string): boolean => {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  return AUDIO_EXTENSIONS.includes(ext);
};

export const getContentType = (filename: string): string => {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  return CONTENT_TYPES[ext] || 'application/octet-stream';
};
