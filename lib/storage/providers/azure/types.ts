// File: lib/storage/providers/azure/types.ts

import { StorageConfig } from '../../storage-provider';

export interface AzureBlobConfig extends StorageConfig {
  accountName: string;
  containerName: string;
  sasToken?: string;
  connectionString?: string;
}

export interface AzureCredentials {
  accountName: string;
  accountKey?: string;
  sasToken?: string;
  connectionString?: string;
}

export interface AzureBlobOptions {
  credentials: AzureCredentials;
  containerName: string;
  accountName: string;
}
