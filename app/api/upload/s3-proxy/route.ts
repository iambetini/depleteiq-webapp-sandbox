import { NextRequest } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createCorsResponse, createCorsOptionsResponse } from "@/lib/api/cors";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: false,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";
    const bucket =
      (formData.get("bucket") as string) || process.env.AWS_S3_BUCKET;

    if (!file) {
      return createCorsResponse({ error: "No file provided" }, 400);
    }

    if (!bucket) {
      return createCorsResponse({ error: "AWS S3 bucket not configured" }, 500);
    }

    // Generate unique file key
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileExtension = file.name.split(".").pop();
    const fileKey = `${folder}/${timestamp}-${randomString}.${fileExtension}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read",
      Metadata: {
        "original-filename": file.name,
      },
    });

    await s3Client.send(command);

    // Generate public URL
    const s3Region = process.env.AWS_REGION || "us-east-1";
    const fileUrl = `https://${bucket}.s3.${s3Region}.amazonaws.com/${fileKey}`;

    return createCorsResponse({
      id: `${timestamp}-${randomString}`,
      name: file.name,
      url: fileUrl,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      provider: "aws-s3",
    });
  } catch (error: any) {
    return createCorsResponse({ error: "Failed to upload file" }, 500);
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}
