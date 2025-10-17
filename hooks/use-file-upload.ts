import { toast } from "@/hooks/use-toast";
import {
  FileUploadConfig,
  StorageFactory,
} from "@/lib/storage/storage-factory";
import { StorageProvider, UploadResult } from "@/lib/storage/storage-provider";
import { useCallback, useRef, useState } from "react";

// Re-export for convenience
export type { FileUploadConfig } from "@/lib/storage/storage-factory";

export type StorageProviderType =
  | "aws-s3"
  | "local"
  | "cloudinary"
  | "firebase";

export interface FileUploadState {
  files: File[];
  uploadedFiles: UploadResult[];
  isUploading: boolean;
  uploadProgress: Record<string, number>;
  error: string | null;
}

export interface FileUploadActions {
  addFiles: (files: File[]) => void;
  removeFile: (fileId: string) => void;
  uploadFiles: () => Promise<UploadResult[]>;
  clearFiles: () => void;
  retryUpload: (fileId: string) => Promise<void>;
}

export function useFileUpload(
  config: Partial<FileUploadConfig> = {},
): FileUploadState & FileUploadActions {
  const mergedConfig = { ...StorageFactory.getDefaultConfig(), ...config };
  const [state, setState] = useState<FileUploadState>({
    files: [],
    uploadedFiles: [],
    isUploading: false,
    uploadProgress: {},
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const storageProviderRef = useRef<StorageProvider | null>(null);

  // Get or create storage provider instance
  const getStorageProvider = useCallback((): StorageProvider => {
    if (!storageProviderRef.current) {
      storageProviderRef.current = StorageFactory.createProvider(mergedConfig);
    }
    return storageProviderRef.current;
  }, [mergedConfig]);

  const validateFile = useCallback(
    (file: File): string | null => {
      try {
        const provider = getStorageProvider();
        provider.validateConfig();

        // Create a temporary config for validation
        const tempConfig = {
          maxFileSize: mergedConfig.maxFileSize,
          allowedTypes: mergedConfig.allowedTypes,
        };

        // Use the provider's validation logic
        const tempProvider = new (provider.constructor as any)(tempConfig);
        tempProvider.validateFile(file);

        return null;
      } catch (error: any) {
        return error.message;
      }
    },
    [mergedConfig, getStorageProvider],
  );

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validFiles: File[] = [];
      const errors: string[] = [];

      newFiles.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        toast({
          title: "File validation errors",
          description: errors.join(", "),
          variant: "destructive",
        });
      }

      if (validFiles.length > 0) {
        setState((prev) => ({
          ...prev,
          files: mergedConfig.multiple
            ? [...prev.files, ...validFiles]
            : validFiles.slice(0, 1),
          error: null,
        }));
      }
    },
    [mergedConfig, validateFile],
  );

  const removeFile = useCallback((fileId: string) => {
    setState((prev) => ({
      ...prev,
      files: prev.files.filter((_, index) => index.toString() !== fileId),
      uploadProgress: Object.fromEntries(
        Object.entries(prev.uploadProgress).filter(([key]) => key !== fileId),
      ),
    }));
  }, []);

  const uploadFile = useCallback(
    async (file: File, fileId: string): Promise<UploadResult> => {
      const provider = getStorageProvider();

      const uploadConfig = {
        folder: mergedConfig.folder,
        maxFileSize: mergedConfig.maxFileSize,
        allowedTypes: mergedConfig.allowedTypes,
      };

      return await provider.upload(file, fileId, uploadConfig);
    },
    [mergedConfig, getStorageProvider],
  );

  const uploadFiles = useCallback(async (): Promise<UploadResult[]> => {
    if (state.files.length === 0) {
      return [];
    }

    setState((prev) => ({ ...prev, isUploading: true, error: null }));
    abortControllerRef.current = new AbortController();

    const uploadedFiles: UploadResult[] = [];
    const errors: string[] = [];

    try {
      for (let i = 0; i < state.files.length; i++) {
        const file = state.files[i];
        const fileId = i.toString();

        try {
          // Update progress
          setState((prev) => ({
            ...prev,
            uploadProgress: { ...prev.uploadProgress, [fileId]: 0 },
          }));

          const uploadedFile = await uploadFile(file, fileId);
          uploadedFiles.push(uploadedFile);

          // Update progress to 100%
          setState((prev) => ({
            ...prev,
            uploadProgress: { ...prev.uploadProgress, [fileId]: 100 },
          }));
        } catch (error: any) {
          errors.push(`Failed to upload ${file.name}: ${error.message}`);
        }
      }

      if (errors.length > 0) {
        setState((prev) => ({ ...prev, error: errors.join(", ") }));
        toast({
          title: "Upload errors",
          description: errors.join(", "),
          variant: "destructive",
        });
      }

      if (uploadedFiles.length > 0) {
        setState((prev) => ({
          ...prev,
          uploadedFiles: [...prev.uploadedFiles, ...uploadedFiles],
          files: [],
          uploadProgress: {},
        }));

        toast({
          title: "Upload successful",
          description: `${uploadedFiles.length} file(s) uploaded successfully`,
        });
      }

      return uploadedFiles;
    } finally {
      setState((prev) => ({ ...prev, isUploading: false }));
      abortControllerRef.current = null;
    }
  }, [state.files, uploadFile]);

  const clearFiles = useCallback(() => {
    setState({
      files: [],
      uploadedFiles: [],
      isUploading: false,
      uploadProgress: {},
      error: null,
    });
  }, []);

  const retryUpload = useCallback(
    async (fileId: string) => {
      const fileIndex = parseInt(fileId);
      if (fileIndex >= 0 && fileIndex < state.files.length) {
        const file = state.files[fileIndex];
        try {
          const uploadedFile = await uploadFile(file, fileId);
          setState((prev) => ({
            ...prev,
            uploadedFiles: [...prev.uploadedFiles, uploadedFile],
            files: prev.files.filter((_, index) => index !== fileIndex),
            uploadProgress: { ...prev.uploadProgress, [fileId]: 100 },
          }));
        } catch (error: any) {
          toast({
            title: "Retry failed",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    },
    [state.files, uploadFile],
  );

  return {
    ...state,
    addFiles,
    removeFile,
    uploadFiles,
    clearFiles,
    retryUpload,
  };
}
