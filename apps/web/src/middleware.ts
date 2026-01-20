import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth/session-edge";

// Routes that require authentication
const protectedRoutes = ["/fiok", "/penztar"];

// Auth routes that authenticated users shouldn't access
const authRoutes = [
  "/auth/bejelentkezes",
  "/auth/regisztracio",
  "/auth/elfelejtett-jelszo",
];

// Routes to skip entirely (API, static, etc.)
const skipRoutes = ["/api", "/_next", "/favicon.ico"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes and static files
  if (skipRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
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
    const loginUrl = new URL("/hu/auth/bejelentkezes", request.url);
    // Save original URL for post-login redirect
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to account
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/hu/fiok", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths except static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)", "/"],
};
