// File: lib/storage/index.ts

export type { StorageProvider, StorageConfig, UploadResult } from './storage-provider';
export { BaseStorageProvider } from './storage-provider';

// AWS Providers
export type { AwsS3Config, AwsS3ProxyConfig } from './providers/aws';
export { AwsS3Provider, AwsS3ProxyProvider } from './providers/aws';

// Azure Providers
export type { AzureBlobConfig } from './providers/azure';
export { AzureBlobProvider } from './providers/azure';

// Cloudinary Providers
export type { CloudinaryConfig } from './providers/cloudinary';
export { CloudinaryProvider } from './providers/cloudinary';

// Local Provider
export type { LocalConfig } from './local-provider';
export { LocalProvider } from './local-provider';

// Factory and Types
export type { FileUploadConfig, StorageProviderType } from './storage-factory';
export { StorageFactory } from './storage-factory';

// Utilities
export { StorageError, createStorageError, generateUniqueFileKey, validateFileSize, validateFileType } from './utils';
