// Example API route for AWS S3 presigned URLs
// File: app/api/upload/presigned-url/route.ts

import { NextRequest } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createCorsResponse, createCorsOptionsResponse } from '@/lib/api/cors';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: false,
});

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, folder = 'uploads', bucket, region } = await request.json();

    if (!fileName || !fileType) {
      return createCorsResponse({ error: 'fileName and fileType are required' }, 400);
    }

    const s3Bucket = bucket || process.env.AWS_S3_BUCKET;
    if (!s3Bucket) {
      return createCorsResponse({ error: 'AWS S3 bucket not configured' }, 500);
    }

    // Generate unique file key
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileExtension = fileName.split('.').pop();
    const fileKey = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: s3Bucket,
      Key: fileKey,
      ContentType: fileType,
      ACL: 'public-read',
      Metadata: {
        'original-filename': fileName,
      },
    });

    // Generate presigned URL (valid for 1 hour)
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    // Generate public URL
    const s3Region = region || process.env.AWS_REGION || 'us-east-1';
    const fileUrl = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${fileKey}`;

    return createCorsResponse({
      presignedUrl,
      fileUrl,
      fileKey,
    });
  } catch (error: any) {
    return createCorsResponse({ error: 'Failed to generate presigned URL' }, 500);
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}
