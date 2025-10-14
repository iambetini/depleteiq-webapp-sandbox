"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileUploadConfig, useFileUpload } from '@/hooks/use-file-upload';
import { UploadResult } from '@/lib/storage/storage-provider';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  CheckCircle,
  CloudUpload,
  Download,
  File,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useRef, useState } from 'react';

interface FileUploadProps {
  config?: Partial<FileUploadConfig>;
  onUploadComplete?: (files: UploadResult[]) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  title?: string;
  description?: string;
  showPreview?: boolean;
  showProgress?: boolean;
  maxFiles?: number;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return <ImageIcon className="h-8 w-8 text-blue-500" />;
  }
  if (fileType.includes('pdf') || fileType.includes('document')) {
    return <FileText className="h-8 w-8 text-red-500" />;
  }
  return <File className="h-8 w-8 text-gray-500" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileUpload({
  config = {},
  onUploadComplete,
  onUploadError,
  className,
  title = "File Upload",
  description = "Drag and drop files here, or click to select files",
  showPreview = true,
  showProgress = true,
  maxFiles = 10,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const {
    files,
    uploadedFiles,
    isUploading,
    uploadProgress,
    error,
    addFiles,
    removeFile,
    uploadFiles,
    clearFiles,
    retryUpload,
  } = useFileUpload(config);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > maxFiles) {
      onUploadError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    addFiles(droppedFiles);
  }, [addFiles, maxFiles, onUploadError]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > maxFiles) {
      onUploadError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    addFiles(selectedFiles);
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addFiles, maxFiles, onUploadError]);

  const handleUpload = useCallback(async () => {
    try {
      const uploadedFiles = await uploadFiles();
      onUploadComplete?.(uploadedFiles);
    } catch (error: any) {
      onUploadError?.(error.message);
    }
  }, [uploadFiles, onUploadComplete, onUploadError]);

  const handleRetry = useCallback(async (fileId: string) => {
    try {
      await retryUpload(fileId);
    } catch (error: any) {
      onUploadError?.(error.message);
    }
  }, [retryUpload, onUploadError]);

  const totalFiles = files.length + uploadedFiles.length;
  const hasFiles = totalFiles > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudUpload className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragOver
                ? "border-orange-500 bg-orange-50"
                : "border-gray-300 hover:border-gray-400",
              isUploading && "pointer-events-none opacity-50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragOver ? "Drop files here" : "Choose files to upload"}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {config.allowedTypes?.join(', ') || 'Any file type'} •
              Max {formatFileSize(config.maxFileSize || 10 * 1024 * 1024)}
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="btn-primary"
            >
              <Upload className="mr-2 h-4 w-4" />
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple={config.multiple !== false}
              accept={config.allowedTypes?.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File List */}
      {hasFiles && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Files ({totalFiles})</CardTitle>
              <div className="flex gap-2">
                {files.length > 0 && (
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="btn-primary"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload All
                      </>
                    )}
                  </Button>
                )}
                <Button
                  onClick={clearFiles}
                  variant="outline"
                  disabled={isUploading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Pending Files */}
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.type)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {showProgress && uploadProgress[index.toString()] !== undefined && (
                      <div className="w-20">
                        <Progress
                          value={uploadProgress[index.toString()]}
                          className="h-2"
                        />
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(index.toString())}
                      disabled={isUploading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Uploaded Files */}
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {file.provider}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {file.uploadedAt.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetry(file.id)}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Section */}
      {showPreview && uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
            <CardDescription>Recently uploaded files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.slice(-6).map((file) => (
                <div key={file.id} className="border rounded-lg p-3">
                  {file.type.startsWith('image/') ? (
                    <div className="aspect-square rounded-md overflow-hidden mb-2">
                      <Image
                        src={file.url}
                        alt={file.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-md bg-gray-100 flex items-center justify-center mb-2">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
