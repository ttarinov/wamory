export const generateKey = (prefix?: string): string => {
  const timestampPart = Date.now().toString(16);
  const randomPart = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    .toString(16)
    .padStart(16, '0');
  const prefixString = prefix || '';
  return `${prefixString}${timestampPart}${randomPart}`;
};
