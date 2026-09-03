import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // Redirect authenticated users away from login page
    if (pathname === "/auth/login" && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Force password change before any other dashboard access
    if (
      token?.user?.mustChangePassword &&
      pathname !== "/dashboard/change-password"
    ) {
      return NextResponse.redirect(
        new URL("/dashboard/change-password", req.url),
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Require authentication for dashboard routes
        if (req.nextUrl.pathname.startsWith("/dashboard")) return !!token;

        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
