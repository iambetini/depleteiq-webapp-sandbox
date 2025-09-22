// File: app/api/upload/azure-blob/route.ts

import { NextRequest } from "next/server";
import { createCorsResponse, createCorsOptionsResponse } from "@/lib/api/cors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileKey = formData.get("fileKey") as string;
    const containerName = formData.get("containerName") as string;
    const accountName = formData.get("accountName") as string;
    const sasToken = formData.get("sasToken") as string;

    if (!file) {
      return createCorsResponse({ error: "No file provided" }, 400);
    }

    if (!fileKey || !containerName || !accountName) {
      return createCorsResponse(
        { error: "Missing required Azure configuration" },
        400,
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Azure Blob Storage URL
    const blobUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${fileKey}`;

    // Add SAS token if provided
    const uploadUrl = sasToken ? `${blobUrl}?${sasToken}` : blobUrl;

    // Upload to Azure Blob Storage
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      body: buffer,
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": file.type,
        "x-ms-blob-content-type": file.type,
      },
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(
        `Azure Blob upload failed: ${uploadResponse.statusText} - ${errorText}`,
      );
    }

    // Generate public URL
    const publicUrl = sasToken ? `${blobUrl}?${sasToken}` : blobUrl;

    return createCorsResponse({
      id: fileKey.split("/").pop()?.split(".")[0] || "unknown",
      name: file.name,
      url: publicUrl,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      provider: "azure-blob",
    });
  } catch (error: any) {
    return createCorsResponse(
      { error: "Failed to upload file to Azure Blob Storage" },
      500,
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return createCorsOptionsResponse();
}
