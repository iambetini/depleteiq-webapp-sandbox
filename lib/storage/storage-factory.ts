// File: lib/storage/storage-factory.ts

import { LocalConfig, LocalProvider } from "./local-provider";
import {
  AwsS3Config,
  AwsS3Provider,
  AwsS3ProxyConfig,
  AwsS3ProxyProvider,
} from "./providers/aws";
import { AzureBlobConfig, AzureBlobProvider } from "./providers/azure";
import { CloudinaryConfig, CloudinaryProvider } from "./providers/cloudinary";
import { StorageConfig, StorageProvider } from "./storage-provider";

export type StorageProviderType =
  | "aws-s3"
  | "aws-s3-proxy"
  | "azure-blob"
  | "cloudinary"
  | "local";

export interface FileUploadConfig extends StorageConfig {
  provider: StorageProviderType;
  multiple?: boolean;
  // AWS S3 specific
  bucket?: string;
  region?: string;
  // Azure Blob Storage specific
  accountName?: string;
  containerName?: string;
  sasToken?: string;
  // Cloudinary specific
  cloudName?: string;
  uploadPreset?: string;
  // Local specific
  uploadPath?: string;
}

export class StorageFactory {
  static createProvider(config: FileUploadConfig): StorageProvider {
    const baseConfig: StorageConfig = {
      folder: config.folder,
      maxFileSize: config.maxFileSize,
      allowedTypes: config.allowedTypes,
    };

    switch (config.provider) {
      case "aws-s3":
        return new AwsS3Provider({
          ...baseConfig,
          bucket: config.bucket || process.env.NEXT_PUBLIC_AWS_S3_BUCKET || "",
          region:
            config.region || process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
        } as AwsS3Config);

      case "aws-s3-proxy":
        return new AwsS3ProxyProvider({
          ...baseConfig,
          bucket: config.bucket || process.env.NEXT_PUBLIC_AWS_S3_BUCKET || "",
          region:
            config.region || process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
        } as AwsS3ProxyConfig);

      case "azure-blob":
        return new AzureBlobProvider({
          ...baseConfig,
          accountName:
            config.accountName ||
            process.env.NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT_NAME ||
            "",
          containerName:
            config.containerName ||
            process.env.NEXT_PUBLIC_AZURE_STORAGE_CONTAINER_NAME ||
            "",
          sasToken:
            config.sasToken || process.env.NEXT_PUBLIC_AZURE_STORAGE_SAS_TOKEN,
        } as AzureBlobConfig);

      case "cloudinary":
        return new CloudinaryProvider({
          ...baseConfig,
          cloudName:
            config.cloudName ||
            process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            "",
          uploadPreset:
            config.uploadPreset ||
            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
            "",
        } as CloudinaryConfig);

      case "local":
        return new LocalProvider({
          ...baseConfig,
          uploadPath: config.uploadPath || "/uploads",
        } as LocalConfig);

      default:
        throw new Error(`Unsupported storage provider: ${config.provider}`);
    }
  }

  static getDefaultConfig(): FileUploadConfig {
    // Convert MB to bytes for internal use
    const maxFileSizeMB = parseInt(
      process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "10",
    );
    const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;

    return {
      provider:
        (process.env.NEXT_PUBLIC_STORAGE_PROVIDER as StorageProviderType) ||
        "aws-s3",
      maxFileSize: maxFileSizeBytes,
      allowedTypes: ["image/*", "application/pdf", "text/*"],
      multiple: true,
      folder: "uploads",
      bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET || "",
      region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
      accountName: process.env.NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT_NAME || "",
      containerName: process.env.NEXT_PUBLIC_AZURE_STORAGE_CONTAINER_NAME || "",
      sasToken: process.env.NEXT_PUBLIC_AZURE_STORAGE_SAS_TOKEN || "",
      uploadPath: "/uploads",
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
    };
  }
}
