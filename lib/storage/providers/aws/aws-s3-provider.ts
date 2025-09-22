// File: lib/storage/providers/aws/aws-s3-provider.ts

import {
  BaseStorageProvider,
  StorageConfig,
  UploadResult,
} from "../../storage-provider";
import { createStorageError } from "../../utils";
import { AwsS3Config } from "./types";

export class AwsS3Provider extends BaseStorageProvider {
  private awsConfig: AwsS3Config;

  constructor(config: AwsS3Config) {
    super(config);
    this.awsConfig = config;
  }

  validateConfig(): void {
    if (!this.awsConfig.bucket) {
      throw createStorageError(
        "AWS S3 bucket not configured. Please set NEXT_PUBLIC_AWS_S3_BUCKET environment variable.",
        this.getProviderName(),
      );
    }

    if (!this.awsConfig.region) {
      throw createStorageError(
        "AWS S3 region not configured. Please set NEXT_PUBLIC_AWS_REGION environment variable.",
        this.getProviderName(),
      );
    }
  }

  getProviderName(): string {
    return "aws-s3";
  }

  async upload(
    file: File,
    fileId: string,
    config: StorageConfig,
  ): Promise<UploadResult> {
    this.validateConfig();
    this.validateFile(file);

    try {
      // Get presigned URL from backend
      const response = await fetch("/api/upload/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          folder: config.folder || this.config.folder || "uploads",
          bucket: this.awsConfig.bucket,
          region: this.awsConfig.region,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get presigned URL");
      }

      const { presignedUrl, fileUrl } = await response.json();

      // Upload file to S3 using presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(
          `Failed to upload file to S3: ${uploadResponse.statusText}`,
        );
      }

      return this.createUploadResult(file, fileId, fileUrl);
    } catch (error: any) {
      throw createStorageError(
        `AWS S3 upload failed: ${error.message}`,
        this.getProviderName(),
        error,
      );
    }
  }
}
