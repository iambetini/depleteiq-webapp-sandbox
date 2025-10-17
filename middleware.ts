import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import {
  hasRequiredPermissions,
  getUserPermissions,
  getPermissionsForPath,
} from "@/lib/route-permissions";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // Redirect authenticated users away from login page
    if (pathname === "/auth/login" && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Skip permission checks for no-permissions page to avoid redirect loops
    if (pathname === "/dashboard/no-permissions") {
      return NextResponse.next();
    }

    // Only check permissions for dashboard routes
    if (pathname.startsWith("/dashboard")) {
      const userPermissions = getUserPermissions(token?.user);

      // If user has no permissions at all, redirect to no-permissions page
      if (userPermissions.length === 0) {
        return NextResponse.redirect(
          new URL("/dashboard/no-permissions", req.url),
        );
      }

      // For users with permissions, check if they have required permissions
      const requiredPermissions = getPermissionsForPath(pathname);
      if (!hasRequiredPermissions(userPermissions, requiredPermissions)) {
        return NextResponse.redirect(
          new URL("/dashboard/no-permissions", req.url),
        );
      }
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
