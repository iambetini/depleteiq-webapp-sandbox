// File: lib/storage/providers/azure/azure-blob-provider.ts

import {
  BaseStorageProvider,
  StorageConfig,
  UploadResult,
} from "../../storage-provider";
import { createStorageError, generateUniqueFileKey } from "../../utils";
import { AzureBlobConfig } from "./types";

export class AzureBlobProvider extends BaseStorageProvider {
  private azureConfig: AzureBlobConfig;

  constructor(config: AzureBlobConfig) {
    super(config);
    this.azureConfig = config;
  }

  validateConfig(): void {
    if (!this.azureConfig.accountName) {
      throw createStorageError(
        "Azure Storage account name not configured. Please set NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT_NAME environment variable.",
        this.getProviderName(),
      );
    }

    if (!this.azureConfig.containerName) {
      throw createStorageError(
        "Azure Storage container name not configured. Please set NEXT_PUBLIC_AZURE_STORAGE_CONTAINER_NAME environment variable.",
        this.getProviderName(),
      );
    }

    if (!this.azureConfig.sasToken && !this.azureConfig.connectionString) {
      throw createStorageError(
        "Azure Storage authentication not configured. Please set NEXT_PUBLIC_AZURE_STORAGE_SAS_TOKEN or AZURE_STORAGE_CONNECTION_STRING environment variable.",
        this.getProviderName(),
      );
    }
  }

  getProviderName(): string {
    return "azure-blob";
  }

  async upload(
    file: File,
    fileId: string,
    config: StorageConfig,
  ): Promise<UploadResult> {
    this.validateConfig();
    this.validateFile(file);

    try {
      // Generate unique file key
      const fileKey = generateUniqueFileKey(
        file.name,
        config.folder || this.config.folder,
      );

      // Create FormData for the Azure upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileKey", fileKey);
      formData.append("containerName", this.azureConfig.containerName);
      formData.append("accountName", this.azureConfig.accountName);

      if (this.azureConfig.sasToken) {
        formData.append("sasToken", this.azureConfig.sasToken);
      }

      // Upload file through our Azure proxy API
      const response = await fetch("/api/upload/azure-blob", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Failed to upload file to Azure Blob Storage",
        );
      }

      const result = await response.json();

      return this.createUploadResult(file, fileId, result.url);
    } catch (error: any) {
      throw createStorageError(
        `Azure Blob Storage upload failed: ${error.message}`,
        this.getProviderName(),
        error,
      );
    }
  }
}
