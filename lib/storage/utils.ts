// File: lib/storage/utils.ts

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

export function createStorageError(
  message: string,
  provider: string,
  originalError?: Error,
): StorageError {
  return new StorageError(message, provider, originalError);
}

export function generateUniqueFileKey(
  fileName: string,
  folder: string = "uploads",
): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2);
  const fileExtension = fileName.split(".").pop();
  return `${folder}/${timestamp}-${randomString}.${fileExtension}`;
}

export function validateFileSize(file: File, maxSize: number): void {
  if (file.size > maxSize) {
    throw new Error(
      `File size ${file.size} exceeds maximum allowed size ${maxSize}`,
    );
  }
}

export function validateFileType(file: File, allowedTypes: string[]): void {
  const isAllowed = allowedTypes.some((type) => {
    if (type.endsWith("/*")) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });

  if (!isAllowed) {
    throw new Error(
      `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    );
  }
}
