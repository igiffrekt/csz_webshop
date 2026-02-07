import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";
import { auth } from "./src/lib/auth";
import { PROTECTED_ROUTES, AUTH_ROUTES, ROUTES } from "./src/lib/routes";

// Create the intl middleware
const intlMiddleware = createIntlMiddleware(routing);

// Convert readonly arrays to mutable for compatibility
const protectedRoutes = [...PROTECTED_ROUTES];
const authRoutes = [...AUTH_ROUTES];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes completely
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Handle locale-prefixed API routes - rewrite to actual API path
  const localeApiMatch = pathname.match(/^\/(hu|en)(\/api\/.*)$/);
  if (localeApiMatch) {
    const apiPath = localeApiMatch[2];
    const rewriteUrl = new URL(apiPath, request.url);
    rewriteUrl.search = request.nextUrl.search;
    return NextResponse.rewrite(rewriteUrl);
  }

  // Run i18n middleware for non-API routes
  const intlResponse = intlMiddleware(request);

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
    return intlResponse;
  }

  // Get session from NextAuth
  const session = await auth();
  const isAuthenticated = !!session?.user;

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL(`/hu${ROUTES.auth.login}`, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to home
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/hu", request.url));
  }

  return intlResponse;
}

export const config = {
  // Match all paths except static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)", "/api/:path*"],
};
