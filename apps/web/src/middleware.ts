import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth/session-edge";
import { PROTECTED_ROUTES, AUTH_ROUTES, ROUTES } from "@/lib/routes";

// Convert readonly arrays to mutable for compatibility
const protectedRoutes = [...PROTECTED_ROUTES];
const authRoutes = [...AUTH_ROUTES];

// Routes to skip entirely (API, static, etc.)
const skipRoutes = ["/_next", "/favicon.ico"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes (with or without locale prefix) and static files
  if (skipRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Skip API routes without locale prefix
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Rewrite locale-prefixed API routes to the correct path (e.g., /hu/api/addresses -> /api/addresses)
  const localeApiMatch = pathname.match(/^\/(hu|en)(\/api\/.*)$/);
  if (localeApiMatch) {
    const apiPath = localeApiMatch[2]; // e.g., /api/addresses
    return NextResponse.rewrite(new URL(apiPath, request.url));
  }

  // Remove locale prefix for route matching (e.g., /hu/fiok -> /fiok)
  const pathWithoutLocale = pathname.replace(/^\/(hu|en)/, "") || "/";

  // Check if this is a protected or auth route
  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );
  const isAuthRoute = authRoutes.some(
    (route) =>
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );

  // Only check auth for protected/auth routes (performance optimization)
  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  // Get session from cookie
  const sessionCookie = request.cookies.get("csz-session")?.value;
  const session = await decrypt(sessionCookie);
  const isAuthenticated = session && session.expiresAt > new Date();

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL(`/hu${ROUTES.auth.login}`, request.url);
    // Save original URL for post-login redirect
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to account
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(`/hu${ROUTES.account.dashboard}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths except static files (but include API for locale rewriting)
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
    // Also match API routes to handle locale prefix rewrites
    "/api/:path*",
    "/(hu|en)/api/:path*",
  ],
};
