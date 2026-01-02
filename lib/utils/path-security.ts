import { resolve } from 'path';

export const isPathInBase = (path: string, basePath: string): boolean => {
  const resolved = resolve(path);
  const baseResolved = resolve(basePath);
  return resolved.startsWith(baseResolved);
};
