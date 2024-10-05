export type FileStorageProvider = "S3" | "local";

export type FileUploadOptions = {
  key: string;
  data: Buffer | Blob | string;
  contentType?: string;
};

export interface FileStorageService {
  upload(options: FileUploadOptions): Promise<string>;
  getObjectUrl(key: string): string;
  delete(key: string): Promise<void>;
  getSignedUrlForRead(key: string, expiresIn?: number): Promise<string>;
}
