const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const AUDIO_EXTENSIONS = ['.opus', '.m4a', '.ogg', '.mp3', '.wav', '.aac'];

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

  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.opus': 'audio/opus',
    '.m4a': 'audio/mp4',
    '.ogg': 'audio/ogg',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.aac': 'audio/aac',
  };

  return types[ext] || 'application/octet-stream';
};
