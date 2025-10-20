// File: hooks/use-image-upload.ts

import { useToast } from "@/hooks/use-toast";
import { StorageFactory } from "@/lib/storage/storage-factory";
import { useCallback, useState } from "react";

interface UseImageUploadOptions {
  folder?: string;
  maxFileSize?: number;
  allowedTypes?: string[];
  provider?: "aws-s3" | "aws-s3-proxy" | "cloudinary" | "local";
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      setIsUploading(true);

      // Create temporary preview URL for immediate feedback
      const tempPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(tempPreviewUrl);

      try {
        const provider = StorageFactory.createProvider({
          provider: options.provider || "aws-s3-proxy",
          bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
          region: process.env.NEXT_PUBLIC_AWS_REGION,
          maxFileSize: options.maxFileSize || 5 * 1024 * 1024,
          allowedTypes: options.allowedTypes || ["image/*"],
          multiple: false,
          folder: options.folder || "uploads",
        });

        const uploadedFile = await provider.upload(file, "0", {
          folder: options.folder || "uploads",
          maxFileSize: options.maxFileSize || 5 * 1024 * 1024,
          allowedTypes: options.allowedTypes || ["image/*"],
        });

        if (uploadedFile) {
          // Update preview URL to the uploaded URL
          setPreviewUrl(uploadedFile.url);

          // Clean up temporary URL
          URL.revokeObjectURL(tempPreviewUrl);

          // toast({
          //   title: "Success",
          //   description: "Image uploaded successfully",
          // });

          return uploadedFile.url;
        } else {
          throw new Error("No file uploaded");
        }
      } catch (error: any) {
        setPreviewUrl(null);
        URL.revokeObjectURL(tempPreviewUrl);

        toast({
          title: "Upload failed",
          description: error.message || "Failed to upload image",
          variant: "destructive",
        });

        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [options, toast],
  );

  const clearPreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  return {
    uploadImage,
    isUploading,
    previewUrl,
    setPreviewUrl,
    clearPreview,
  };
}
