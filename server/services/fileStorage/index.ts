import { S3FileStorage } from "./s3-storage-service";
import { LocalFileStorage } from "./local-storage-service";
import type { FileStorageProvider } from "./types";
import type { FileStorageService } from "./types";

export function useFileStorage(provider: FileStorageProvider): FileStorageService {
  switch (provider) {
    case "S3":
      return new S3FileStorage();
    case "local":
      return new LocalFileStorage();
    default:
      throw new Error(`Unsupported file storage provider: ${provider}`);
  }
}
