import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { encode } from "next-auth/jwt";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json(
        { status: "error", message: "Refresh token is required" },
        { status: 400 },
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
      body: JSON.stringify({ refresh_token }),
    });

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      return NextResponse.json(
        { status: "error", message: data.message || "Refresh failed" },
        { status: 401 },
      );
    }

    const {
      token: new_access_token,
      refresh_token: new_refresh_token,
      expires_in,
    } = data.data.item;

    const currentToken = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!currentToken?.user) {
      return NextResponse.json(
        { status: "error", message: "No active session" },
        { status: 401 },
      );
    }

    const updatedToken = {
      ...currentToken,
      accessToken: new_access_token,
      refresh_token: new_refresh_token,
      token_obtained_at: Date.now(),
      expires_in,
    };

    const encoded = await encode({
      token: updatedToken,
      secret: process.env.NEXTAUTH_SECRET || "",
    });

    const sessionResponse = NextResponse.json({
      status: "success",
      data: {
        token: new_access_token,
        refresh_token: new_refresh_token,
        expires_in,
      },
    });

    sessionResponse.cookies.set("next-auth.session-token", encoded, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return sessionResponse;
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Refresh failed" },
      { status: 401 },
    );
  }
}
