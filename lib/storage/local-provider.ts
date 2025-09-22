// File: lib/storage/local-provider.ts

import {
  BaseStorageProvider,
  StorageConfig,
  UploadResult,
} from "./storage-provider";

export interface LocalConfig extends StorageConfig {
  uploadPath?: string;
}

export class LocalProvider extends BaseStorageProvider {
  private localConfig: LocalConfig;

  constructor(config: LocalConfig) {
    super(config);
    this.localConfig = config;
  }

  validateConfig(): void {
    // Local storage doesn't require additional configuration validation
    // The upload path is optional and defaults to '/uploads'
  }

  getProviderName(): string {
    return "local";
  }

  async upload(
    file: File,
    fileId: string,
    config: StorageConfig,
  ): Promise<UploadResult> {
    this.validateConfig();
    this.validateFile(file);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "folder",
        config.folder || this.config.folder || "uploads",
      );

      const response = await fetch("/api/upload/local", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload file locally");
      }

      const { fileUrl } = await response.json();

      return {
        id: fileId,
        name: file.name,
        url: fileUrl,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        provider: this.getProviderName(),
      };
    } catch (error: any) {
      throw new Error(`Local upload failed: ${error.message}`);
    }
  }
}
