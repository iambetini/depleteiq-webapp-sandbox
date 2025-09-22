// File: lib/storage/providers/aws/types.ts

import { StorageConfig } from "../../storage-provider";

export interface AwsS3Config extends StorageConfig {
  bucket: string;
  region: string;
}

export interface AwsS3ProxyConfig extends StorageConfig {
  bucket: string;
  region: string;
}

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

export interface AwsS3Options {
  credentials: AwsCredentials;
  region: string;
  bucket: string;
  forcePathStyle?: boolean;
}
