import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const JSON_DIR = join(DATA_DIR, 'json');
const MEDIA_DIR = join(DATA_DIR, 'media');

async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

function sanitizePath(path: string): string {
  const normalized = path.replace(/\.\./g, '').replace(/[^a-zA-Z0-9._/-]/g, '');
  return normalized;
}

export class LocalStorageService {
  async exists(path: string): Promise<boolean> {
    try {
      const fullPath = join(JSON_DIR, sanitizePath(path));
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async read(path: string): Promise<string | null> {
    try {
      const fullPath = join(JSON_DIR, sanitizePath(path));
      const data = await fs.readFile(fullPath, 'utf-8');
      return data;
    } catch {
      return null;
    }
  }

  async write(path: string, data: string): Promise<string> {
    await ensureDir(JSON_DIR);
    const fullPath = join(JSON_DIR, sanitizePath(path));
    await fs.writeFile(fullPath, data, 'utf-8');
    return `/api/local-file?path=${encodeURIComponent(path)}`;
  }

  async uploadMedia(chatId: string, file: File | Buffer, filename: string): Promise<string> {
    await ensureDir(MEDIA_DIR);
    const chatDir = join(MEDIA_DIR, sanitizePath(chatId));
    await ensureDir(chatDir);
    
    const safeFilename = sanitizePath(filename);
    const fullPath = join(chatDir, safeFilename);
    
    const buffer = file instanceof File 
      ? Buffer.from(await file.arrayBuffer())
      : file;
    
    await fs.writeFile(fullPath, buffer);
    return `/api/media/${encodeURIComponent(chatId)}/${encodeURIComponent(safeFilename)}`;
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const fullPath = join(JSON_DIR, sanitizePath(path));
      await fs.unlink(fullPath);
    } catch {
    }
  }

  async deleteAll(): Promise<void> {
    try {
      const jsonPath = join(JSON_DIR, 'chats.json.enc');
      await fs.unlink(jsonPath).catch(() => {});
    } catch {
    }

    try {
      const entries = await fs.readdir(MEDIA_DIR).catch(() => []);
      for (const entry of entries) {
        const entryPath = join(MEDIA_DIR, entry);
        const stat = await fs.stat(entryPath).catch(() => null);
        if (stat?.isDirectory()) {
          await fs.rm(entryPath, { recursive: true, force: true }).catch(() => {});
        }
      }
    } catch {
    }
  }

  async listMedia(chatId: string): Promise<string[]> {
    try {
      const chatDir = join(MEDIA_DIR, sanitizePath(chatId));
      const files = await fs.readdir(chatDir);
      return files.map(file => `/api/media/${encodeURIComponent(chatId)}/${encodeURIComponent(file)}`);
    } catch {
      return [];
    }
  }
}
