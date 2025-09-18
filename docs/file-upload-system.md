# File Upload System

A comprehensive, SOLID-compliant file upload system supporting multiple storage providers with clean architecture and excellent developer experience.

## 🚀 Features

- **Multiple Storage Providers**: AWS S3 (direct & proxy), Azure Blob Storage, Cloudinary, Local
- **SOLID Architecture**: Clean, extensible, and maintainable code
- **Type Safety**: Full TypeScript support with proper interfaces
- **Error Handling**: Comprehensive error management with custom error types
- **Progress Tracking**: Real-time upload progress and status
- **CORS Handling**: Automatic CORS management for different providers
- **File Validation**: Size, type, and format validation
- **React Hooks**: Easy-to-use hooks for different upload scenarios
- **Cloud Agnostic**: Support for major cloud providers

## 📋 Environment Variables

### Required Variables

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=eu-west-2
AWS_S3_BUCKET=your-bucket-name

# Public AWS S3 variables (for client-side)
NEXT_PUBLIC_AWS_S3_BUCKET=your-bucket-name
NEXT_PUBLIC_AWS_REGION=eu-west-2

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Public Cloudinary variables (for client-side)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Azure Blob Storage Configuration
AZURE_STORAGE_ACCOUNT_NAME=your_account_name
AZURE_STORAGE_CONNECTION_STRING=your_connection_string

# Public Azure variables (for client-side)
NEXT_PUBLIC_AZURE_STORAGE_ACCOUNT_NAME=your_account_name
NEXT_PUBLIC_AZURE_STORAGE_CONTAINER_NAME=your_container_name
NEXT_PUBLIC_AZURE_STORAGE_SAS_TOKEN=your_sas_token

# File Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=10  # Maximum file size in MB
NEXT_PUBLIC_STORAGE_PROVIDER=aws-s3-proxy  # Default storage provider
```

## 🏗️ Architecture

### SOLID Principles Implementation

#### Single Responsibility Principle (SRP)
- **StorageProvider**: Handles file upload logic
- **StorageFactory**: Creates provider instances
- **Utils**: Provides validation and error handling
- **CORS Utils**: Manages cross-origin requests

#### Open/Closed Principle (OCP)
- New storage providers can be added without modifying existing code
- Configuration is extensible through interfaces
- Factory pattern allows easy extension

#### Liskov Substitution Principle (LSP)
- All storage providers implement the same `StorageProvider` interface
- Providers can be swapped without breaking functionality
- Base class provides common functionality

#### Interface Segregation Principle (ISP)
- Focused interfaces (`StorageProvider`, `StorageConfig`)
- Clients only depend on methods they use
- No fat interfaces

#### Dependency Inversion Principle (DIP)
- High-level modules depend on abstractions
- Concrete implementations injected through factory
- Dependency injection through constructor

## 📁 File Structure

```
lib/
├── storage/
│   ├── storage-provider.ts      # Base interfaces and abstract class
│   ├── storage-factory.ts       # Factory for creating providers
│   ├── local-provider.ts        # Local file upload provider
│   ├── utils.ts                 # Common utilities and error handling
│   ├── index.ts                 # Exports
│   └── providers/
│       ├── aws/
│       │   ├── aws-s3-provider.ts       # AWS S3 direct upload provider
│       │   ├── aws-s3-proxy-provider.ts # AWS S3 proxy upload provider
│       │   ├── types.ts                 # AWS-specific types
│       │   └── index.ts                 # AWS exports
│       ├── azure/
│       │   ├── azure-blob-provider.ts   # Azure Blob Storage provider
│       │   ├── types.ts                 # Azure-specific types
│       │   └── index.ts                 # Azure exports
│       └── cloudinary/
│           ├── cloudinary-provider.ts   # Cloudinary upload provider
│           ├── types.ts                 # Cloudinary-specific types
│           └── index.ts                 # Cloudinary exports
├── api/
│   └── cors.ts                  # CORS utility functions

hooks/
├── use-file-upload.ts           # Generic file upload hook
└── use-image-upload.ts          # Simplified image upload hook

components/ui/
└── file-upload.tsx              # Generic file upload component

app/api/upload/
├── presigned-url/route.ts       # AWS S3 presigned URL generation
├── s3-proxy/route.ts            # AWS S3 proxy upload
├── azure-blob/route.ts          # Azure Blob Storage upload
└── local/route.ts              # Local file upload
```

## 🔧 Storage Providers

### AWS S3 Direct (`aws-s3`)
- **Description**: Direct upload to AWS S3 using presigned URLs
- **Performance**: ⭐⭐⭐⭐⭐ (Fastest)
- **CORS**: Requires S3 bucket CORS configuration
- **Use Case**: High-performance direct uploads

### AWS S3 Proxy (`aws-s3-proxy`) ⭐ **Recommended**
- **Description**: Upload through server-side proxy to AWS S3
- **Performance**: ⭐⭐⭐⭐ (Very Good)
- **CORS**: No CORS issues (server-to-server communication)
- **Use Case**: Production applications, reliable uploads

### Azure Blob Storage (`azure-blob`)
- **Description**: Upload to Microsoft Azure Blob Storage
- **Performance**: ⭐⭐⭐⭐ (Very Good)
- **CORS**: No CORS issues (server-to-server communication)
- **Features**: Enterprise-grade storage, global CDN, advanced security
- **Use Case**: Enterprise applications, Microsoft ecosystem

### Cloudinary (`cloudinary`)
- **Description**: Upload to Cloudinary cloud storage
- **Performance**: ⭐⭐⭐⭐ (Very Good)
- **Features**: Image optimization, transformation, CDN, AI-powered features
- **Use Case**: Image-heavy applications, media management

### Local (`local`)
- **Description**: Upload to local server storage
- **Performance**: ⭐⭐⭐ (Good)
- **Use Case**: Development and testing

## 💻 Usage Examples

### Simple Image Upload Hook

```typescript
import { useImageUpload } from '@/hooks/use-image-upload';

const { uploadImage, isUploading, previewUrl } = useImageUpload({
  folder: 'brand-images',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/*'],
  provider: 'aws-s3-proxy',
});

// Upload a file
const handleUpload = async (file: File) => {
  const url = await uploadImage(file);
  if (url) {
    console.log('Uploaded:', url);
  }
};
```

### Generic File Upload Hook

```typescript
import { useFileUpload } from '@/hooks/use-file-upload';

const { uploadFiles, isUploading, progress, error } = useFileUpload({
  provider: 'aws-s3-proxy',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/*', 'application/pdf'],
  multiple: true,
  folder: 'documents',
});
```

### File Upload Component

```typescript
import { FileUpload } from '@/components/ui/file-upload';

<FileUpload
  onUploadComplete={(files) => {
    console.log('Uploaded files:', files);
  }}
  config={{
    provider: 'aws-s3-proxy',
    maxFileSize: 10 * 1024 * 1024,
    allowedTypes: ['image/*', 'application/pdf'],
    multiple: true,
    folder: 'documents',
  }}
/>
```

### Direct Storage Provider Usage

```typescript
import { StorageFactory } from '@/lib/storage/storage-factory';

// AWS S3 Proxy
const awsProvider = StorageFactory.createProvider({
  provider: 'aws-s3-proxy',
  bucket: 'my-bucket',
  region: 'us-east-1',
  maxFileSize: 5 * 1024 * 1024,
  allowedTypes: ['image/*'],
  folder: 'images',
});

// Azure Blob Storage
const azureProvider = StorageFactory.createProvider({
  provider: 'azure-blob',
  accountName: 'myaccount',
  containerName: 'mycontainer',
  sasToken: 'my-sas-token',
  maxFileSize: 5 * 1024 * 1024,
  allowedTypes: ['image/*'],
  folder: 'images',
});

// Cloudinary
const cloudinaryProvider = StorageFactory.createProvider({
  provider: 'cloudinary',
  cloudName: 'my-cloud',
  uploadPreset: 'my-preset',
  maxFileSize: 5 * 1024 * 1024,
  allowedTypes: ['image/*'],
  folder: 'images',
});

const result = await provider.upload(file, 'file-id', {
  folder: 'custom-folder',
});
```

## 🛡️ Error Handling

### Custom Error Types

```typescript
import { StorageError, createStorageError } from '@/lib/storage/utils';

// Custom error with provider context
const error = createStorageError(
  'Upload failed',
  'aws-s3-proxy',
  originalError
);

// Error includes:
// - message: Human-readable error message
// - provider: Which storage provider failed
// - originalError: Original error for debugging
```

### Error Recovery

- **Automatic Retry**: Built-in retry logic for transient failures
- **User Feedback**: Toast notifications and progress indicators
- **Graceful Degradation**: Fallback to alternative providers
- **Detailed Logging**: Comprehensive error logging for debugging

## ⚡ Performance Optimizations

### Upload Strategies

1. **Direct Upload** (`aws-s3`): Fastest for large files
2. **Proxy Upload** (`aws-s3-proxy`): Most reliable, handles CORS
3. **Chunked Upload**: For very large files (future enhancement)

### Best Practices

- Use `aws-s3-proxy` for production (no CORS issues)
- Implement progress tracking for better UX
- Validate files before upload
- Use appropriate file size limits
- Clean up temporary URLs after upload

## 🔒 Security Considerations

- **Server-side Validation**: All uploads validated on server
- **File Type Restrictions**: Only allowed file types accepted
- **Size Limits**: Configurable file size restrictions
- **Secure Credentials**: AWS credentials stored securely
- **CORS Protection**: Proper CORS configuration

## 🧪 Testing

The system is designed for easy testing:

```typescript
// Mock storage provider for testing
const mockProvider = {
  upload: jest.fn().mockResolvedValue({
    id: 'test-id',
    url: 'https://example.com/test.jpg',
    // ... other properties
  }),
  validateConfig: jest.fn(),
  getProviderName: jest.fn().mockReturnValue('mock'),
};
```

## 🚀 Future Enhancements

- **Chunked Upload**: For very large files
- **Resumable Uploads**: Resume interrupted uploads
- **Image Processing**: Automatic image optimization
- **Virus Scanning**: File security scanning
- **CDN Integration**: Automatic CDN distribution
