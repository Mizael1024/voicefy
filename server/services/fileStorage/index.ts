import { S3FileStorage } from "./s3-storage-service";
import { LocalFileStorage } from "./local-storage-service";
import { NuxtHubFileStorage } from "./nuxthub-storage-service";
import type { FileStorageProvider } from "./types";
import type { FileStorageService, NuxtHubFileStorageService } from "./types";

export function useFileStorage(
  provider: FileStorageProvider,
): FileStorageService | NuxtHubFileStorageService {
  switch (provider) {
    case "S3":
      return new S3FileStorage();
    case "local":
      return new LocalFileStorage();
    case "nuxthub":
      return new NuxtHubFileStorage();
    default:
      throw new Error(`Unsupported file storage provider: ${provider}`);
  }
}
