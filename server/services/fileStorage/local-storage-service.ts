import { promises as fs } from "fs";
import path from "path";
import type { FileStorageService } from "./types";
import type { FileUploadOptions } from "./types";

export class LocalFileStorage implements FileStorageService {
  private baseDir: string;
  private publicUrl: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), "public", "uploads");
    this.publicUrl = process.env.BASE_URL || "http://localhost:3000";
  }

  async upload({ key, data }: FileUploadOptions): Promise<string> {
    const filePath = path.join(this.baseDir, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    if (data instanceof Blob) {
      const buffer = Buffer.from(await data.arrayBuffer());
      await fs.writeFile(filePath, buffer);
    } else if (Buffer.isBuffer(data)) {
      await fs.writeFile(filePath, data);
    } else if (typeof data === "string") {
      await fs.writeFile(filePath, data, "utf-8");
    } else {
      throw new Error("Unsupported data type for upload");
    }

    return this.getObjectUrl(key);
  }

  getObjectUrl(key: string): string {
    return `${this.publicUrl}/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.baseDir, key);
    await fs.unlink(filePath);
  }

  async getSignedUrlForRead(key: string): Promise<string> {
    // For local storage, we don't need signed URLs
    return this.getObjectUrl(key);
  }
}
