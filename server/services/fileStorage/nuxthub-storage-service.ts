import type { FileStorageService, FileUploadOptions } from "./types";
import { hubBlob } from "#imports";

export class NuxtHubFileStorage implements FileStorageService {
  async upload({ key, data, contentType }: FileUploadOptions): Promise<string> {
    const result = await hubBlob().put(key, data, {
      contentType,
      addRandomSuffix: false,
      prefix: "images",
    });
    return result;
  }

  getObjectUrl(key: string): string {
    return key;
  }

  async delete(key: string): Promise<void> {
    await hubBlob().del(key);
  }

  async getSignedUrlForRead(key: string, event: any) {
    return await hubBlob().serve(event, key);
  }

  // Additional NuxtHub-specific methods
  async list(options?: { limit?: number; prefix?: string; cursor?: string; folded?: boolean }) {
    return hubBlob().list(options);
  }

  async serve(event: any, pathname: string) {
    return hubBlob().serve(event, pathname);
  }

  async head(pathname: string) {
    return hubBlob().head(pathname);
  }

  handleUpload(event: any, options: any) {
    return hubBlob().handleUpload(event, options);
  }

  handleMultipartUpload(event: any) {
    return hubBlob().handleMultipartUpload(event);
  }

  createMultipartUpload(pathname: string, options?: any) {
    return hubBlob().createMultipartUpload(pathname, options);
  }

  resumeMultipartUpload(pathname: string, uploadId: string) {
    return hubBlob().resumeMultipartUpload(pathname, uploadId);
  }
}
