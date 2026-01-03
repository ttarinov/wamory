export const extractPhoneFromFilename = (filename: string): string => {
  const match = filename.match(/WhatsApp Chat - (.+?)(?:\.zip|$|\/)/);
  return match ? match[1].trim() : '';
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber || !phoneNumber.trim()) {
    return false;
  }
  const cleaned = phoneNumber.trim().replace(/\s+/g, '');
  return cleaned.length >= 3;
};
