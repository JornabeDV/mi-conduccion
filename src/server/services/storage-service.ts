import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export interface StorageProvider {
  upload(file: File): Promise<{ key: string; url: string; size: number; mimeType: string }>;
  delete(key: string): Promise<void>;
}

function getExtension(fileName: string): string {
  const ext = path.extname(fileName);
  return ext || ".bin";
}

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;
  private publicPath: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads");
    this.publicPath = "/uploads";
  }

  async upload(file: File): Promise<{ key: string; url: string; size: number; mimeType: string }> {
    await fs.mkdir(this.uploadDir, { recursive: true });

    const key = `${crypto.randomUUID()}${getExtension(file.name)}`;
    const filePath = path.join(this.uploadDir, key);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await fs.writeFile(filePath, buffer);

    return {
      key,
      url: `${this.publicPath}/${key}`,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key);
    await fs.unlink(filePath).catch(() => {
      // Ignore errors if file does not exist.
    });
  }
}

export const storageService = new LocalStorageProvider();
