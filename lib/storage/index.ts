// File: lib/storage/index.ts

export { BaseStorageProvider } from "./storage-provider";
export type {
  StorageConfig,
  StorageProvider,
  UploadResult,
} from "./storage-provider";

// AWS Providers
export { AwsS3Provider, AwsS3ProxyProvider } from "./providers/aws";
export type { AwsS3Config, AwsS3ProxyConfig } from "./providers/aws";

// Azure Providers
export { AzureBlobProvider } from "./providers/azure";
export type { AzureBlobConfig } from "./providers/azure";

// Cloudinary Providers
export { CloudinaryProvider } from "./providers/cloudinary";
export type { CloudinaryConfig } from "./providers/cloudinary";

// Local Provider
export { LocalProvider } from "./local-provider";
export type { LocalConfig } from "./local-provider";

// Factory and Types
export { StorageFactory } from "./storage-factory";
export type { FileUploadConfig, StorageProviderType } from "./storage-factory";

// Utilities
export {
  createStorageError,
  generateUniqueFileKey,
  StorageError,
  validateFileSize,
  validateFileType,
} from "./utils";
