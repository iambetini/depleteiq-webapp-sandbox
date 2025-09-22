// File: lib/storage/providers/cloudinary/cloudinary-provider.ts

import {
  BaseStorageProvider,
  StorageConfig,
  UploadResult,
} from "../../storage-provider";
import { createStorageError, generateUniqueFileKey } from "../../utils";
import { CloudinaryConfig } from "./types";

export class CloudinaryProvider extends BaseStorageProvider {
  private cloudinaryConfig: CloudinaryConfig;

  constructor(config: CloudinaryConfig) {
    super(config);
    this.cloudinaryConfig = config;
  }

  validateConfig(): void {
    if (!this.cloudinaryConfig.cloudName) {
      throw createStorageError(
        "Cloudinary cloud name not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable.",
        this.getProviderName(),
      );
    }

    if (!this.cloudinaryConfig.uploadPreset) {
      throw createStorageError(
        "Cloudinary upload preset not configured. Please set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET environment variable.",
        this.getProviderName(),
      );
    }
  }

  getProviderName(): string {
    return "cloudinary";
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

      // Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", this.cloudinaryConfig.uploadPreset);
      formData.append("public_id", fileKey);
      formData.append(
        "folder",
        config.folder || this.config.folder || "uploads",
      );

      // Add transformation options for images
      if (file.type.startsWith("image/")) {
        formData.append("transformation", "f_auto,q_auto");
        formData.append("responsive", "true");
      }

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudinaryConfig.cloudName}/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || "Failed to upload file to Cloudinary",
        );
      }

      const result = await response.json();

      return this.createUploadResult(file, fileId, result.secure_url);
    } catch (error: any) {
      throw createStorageError(
        `Cloudinary upload failed: ${error.message}`,
        this.getProviderName(),
        error,
      );
    }
  }
}
