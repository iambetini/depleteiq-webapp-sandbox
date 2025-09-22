// File: lib/storage/providers/aws/aws-s3-proxy-provider.ts

import {
  BaseStorageProvider,
  StorageConfig,
  UploadResult,
} from "../../storage-provider";
import { createStorageError } from "../../utils";
import { AwsS3ProxyConfig } from "./types";

export class AwsS3ProxyProvider extends BaseStorageProvider {
  private awsConfig: AwsS3ProxyConfig;

  constructor(config: AwsS3ProxyConfig) {
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
    return "aws-s3-proxy";
  }

  async upload(
    file: File,
    fileId: string,
    config: StorageConfig,
  ): Promise<UploadResult> {
    this.validateConfig();
    this.validateFile(file);

    try {
      // Create FormData for the proxy upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "folder",
        config.folder || this.config.folder || "uploads",
      );
      formData.append("bucket", this.awsConfig.bucket);

      // Upload file through our proxy API
      const response = await fetch("/api/upload/s3-proxy", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload file via proxy");
      }

      return await response.json();
    } catch (error: any) {
      throw createStorageError(
        `AWS S3 Proxy upload failed: ${error.message}`,
        this.getProviderName(),
        error,
      );
    }
  }
}
