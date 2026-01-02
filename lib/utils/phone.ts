export const extractPhoneFromFilename = (filename: string): string => {
  const match = filename.match(/WhatsApp Chat - (.+?)(?:\.zip|$|\/)/);
  return match ? match[1].trim() : '';
};
