// File: lib/storage/providers/cloudinary/types.ts

import { StorageConfig } from '../../storage-provider';

export interface CloudinaryConfig extends StorageConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
  apiSecret?: string;
}

export interface CloudinaryCredentials {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset?: string;
}

export interface CloudinaryOptions {
  credentials: CloudinaryCredentials;
  cloudName: string;
  uploadPreset: string;
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  created_at: string;
}
