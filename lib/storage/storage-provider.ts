// File: lib/storage/storage-provider.ts

import {
  createStorageError,
  generateUniqueFileKey,
  validateFileSize,
  validateFileType,
} from "./utils";

export interface StorageConfig {
  folder?: string;
  maxFileSize?: number;
  allowedTypes?: string[];
}

export interface UploadResult {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  provider: string;
}

export interface StorageProvider {
  upload(
    file: File,
    fileId: string,
    config: StorageConfig,
  ): Promise<UploadResult>;
  validateConfig(): void;
  getProviderName(): string;
}

export abstract class BaseStorageProvider implements StorageProvider {
  protected config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = {
      folder: "uploads",
      maxFileSize: 10 * 1024 * 1024, // 10MB default
      allowedTypes: ["image/*", "application/pdf", "text/*"],
      ...config,
    };
  }

  abstract upload(
    file: File,
    fileId: string,
    config: StorageConfig,
  ): Promise<UploadResult>;
  abstract validateConfig(): void;
  abstract getProviderName(): string;

  protected validateFile(file: File): void {
    if (!file) {
      throw createStorageError("No file provided", this.getProviderName());
    }

    if (this.config.maxFileSize) {
      validateFileSize(file, this.config.maxFileSize);
    }

    if (this.config.allowedTypes && this.config.allowedTypes.length > 0) {
      validateFileType(file, this.config.allowedTypes);
    }
  }

  protected generateUniqueFileName(originalName: string): string {
    return generateUniqueFileKey(originalName, this.config.folder);
  }

  protected createUploadResult(
    file: File,
    fileId: string,
    url: string,
  ): UploadResult {
    return {
      id: fileId,
      name: file.name,
      url,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      provider: this.getProviderName(),
    };
  }
}
