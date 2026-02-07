import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Routes that require authentication (without locale prefix)
const PROTECTED_ROUTES = ['/fiok', '/penztar']
// Routes only for unauthenticated users
const AUTH_ROUTES = ['/auth/bejelentkezes', '/auth/regisztracio', '/auth/elfelejtett-jelszo']

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes and static assets
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Run i18n middleware first
  const response = intlMiddleware(request)

  // Strip locale prefix to check route patterns
  const pathnameWithoutLocale = pathname.replace(/^\/hu/, '') || '/'

  // Check NextAuth session via the session token cookie
  const sessionToken =
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value
  const isAuthenticated = !!sessionToken

  // Check if current path is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  )

  // Check if current path is an auth route
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  )

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/hu/auth/bejelentkezes', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users from auth routes to home
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/hu', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next|.*\..*).*)'],
}
