import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as getS3SignedUrl } from "@aws-sdk/s3-request-presigner";
import type { FileStorageService } from "./types";
import type { FileUploadOptions } from "./types";

export class S3FileStorage implements FileStorageService {
  private s3Client: S3Client;
  private bucket: string;
  private s3PublicUrl: string;

  constructor() {
    const s3Endpoint = process.env.S3_ENDPOINT as string;
    const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID as string;
    const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY as string;
    this.bucket = process.env.S3_BUCKET_NAME as string;
    this.s3PublicUrl = process.env.S3_PUBLIC_ACCESS_URL as string;

    if (!s3Endpoint || !s3AccessKeyId || !s3SecretAccessKey || !this.bucket) {
      throw new Error("Missing S3 configuration. Please check your environment variables.");
    }

    this.s3Client = new S3Client({
      region: "auto",
      endpoint: s3Endpoint,
      credentials: {
        accessKeyId: s3AccessKeyId,
        secretAccessKey: s3SecretAccessKey,
      },
    });
  }

  async upload({ key, data }: FileUploadOptions): Promise<string> {
    let body: Buffer | string;
    if (data instanceof Blob) {
      body = Buffer.from(await data.arrayBuffer());
    } else if (Buffer.isBuffer(data)) {
      body = data;
    } else if (typeof data === "string") {
      body = data;
    } else {
      throw new Error("Unsupported data type for upload");
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
    });

    try {
      await this.s3Client.send(command);
      return this.getObjectUrl(key);
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(`Failed to upload file to ${this.bucket}/${key}`);
    }
  }

  getObjectUrl(key: string): string {
    return `${this.s3PublicUrl}/${this.bucket}/${key}`;
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new Error(`Failed to delete file from ${this.bucket}/${key}`);
    }
  }

  async getSignedUrlForRead(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      return await getS3SignedUrl(
        this.s3Client,
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
        { expiresIn },
      );
    } catch (error) {
      console.error("Error generating signed URL for read:", error);
      throw new Error(`Failed to generate signed URL for reading ${this.bucket}/${key}`);
    }
  }

  async getClientUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      return await getS3SignedUrl(
        this.s3Client,
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          ContentType: contentType,
        }),
        { expiresIn },
      );
    } catch (error) {
      console.error("Error generating client upload URL:", error);
      throw new Error(`Failed to generate client upload URL for ${this.bucket}/${key}`);
    }
  }
}
