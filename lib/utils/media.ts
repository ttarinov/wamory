const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

export const isImage = (filename: string): boolean => {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
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
  };

  return types[ext] || 'application/octet-stream';
};
