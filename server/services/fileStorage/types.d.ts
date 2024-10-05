export type FileStorageProvider = "S3" | "local" | "nuxthub";

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

// NuxtHub-specific types
export interface NuxtHubFileStorageService extends FileStorageService {
  list(options?: {
    limit?: number;
    prefix?: string;
    cursor?: string;
    folded?: boolean;
  }): Promise<any>;
  serve(event: any, pathname: string): Promise<any>;
  head(pathname: string): Promise<any>;
  handleUpload(event: any, options: any): Promise<any>;
  handleMultipartUpload(event: any): Promise<any>;
  createMultipartUpload(pathname: string, options?: any): Promise<any>;
  resumeMultipartUpload(pathname: string, uploadId: string): Promise<any>;
}
