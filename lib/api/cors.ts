// File: lib/api/cors.ts

import { NextResponse } from "next/server";

export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export function createCorsResponse(
  data: any,
  status: number = 200,
): NextResponse {
  const response = NextResponse.json(data, { status });
  return addCorsHeaders(response);
}

export function createCorsOptionsResponse(): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
