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

export const isPhoneNumber = (value: string): boolean => {
  if (!value || !value.trim()) {
    return false;
  }

  const cleaned = value.trim();

  const digitsOnly = cleaned.replace(/[\s\-\(\)\+]/g, '');

  if (/^\d+$/.test(digitsOnly)) {
    return true;
  }

  if (/[a-zA-Z]/.test(cleaned)) {
    return false;
  }

  const digits = (cleaned.match(/\d/g) || []).length;
  const total = cleaned.replace(/[\s\-\(\)\+]/g, '').length;

  return digits / total > 0.7;
};
