---
phase: 05-authentication-user-accounts
plan: 04
subsystem: authentication
tags: [next.js, middleware, edge-runtime, session, header, dropdown-menu]

dependency_graph:
  requires: [05-02] # Session management, DAL, Server Actions
  provides:
    - Next.js middleware for route protection
    - Edge-compatible session decryption
    - UserMenu dropdown component
    - Auth-aware Header component
  affects: [05-05, 06-01] # Account pages, checkout

tech_stack:
  added:
    - "@radix-ui/react-dropdown-menu: ^2.1.15"
  patterns:
    - Edge-compatible session module (no server-only import)
    - Middleware route protection with redirect URLs
    - Async Server Component Header with auth state
    - Client-side dropdown menu for user actions

key_files:
  created:
    - apps/web/src/middleware.ts
    - apps/web/src/lib/auth/session-edge.ts
    - apps/web/src/components/layout/UserMenu.tsx
    - apps/web/src/components/ui/dropdown-menu.tsx
  modified:
    - apps/web/src/components/layout/Header.tsx
    - apps/web/src/messages/hu.json
    - apps/web/package.json
    - pnpm-lock.yaml

decisions:
  - id: session-edge-module
    choice: "Separate Edge-compatible session-edge.ts module"
    rationale: "session.ts uses 'server-only' which fails in Edge middleware runtime"
  - id: middleware-protected-routes
    choice: "Protect /fiok and /penztar with middleware redirect"
    rationale: "Centralized route protection at middleware level"
  - id: redirect-url-param
    choice: "Save original URL in redirect query param"
    rationale: "Return users to intended page after login"
  - id: async-server-header
    choice: "Convert Header to async Server Component"
    rationale: "Use getTranslations and verifySession directly in Server Component"

metrics:
  duration: "~4 minutes"
  completed: 2026-01-20
---

# Phase 05 Plan 04: Middleware & Auth-Aware Header Summary

Created Next.js middleware for route protection with Edge-compatible session decryption, UserMenu dropdown component for authenticated users, and updated Header to conditionally display login button or user menu based on auth state.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create Next.js middleware for route protection | 7472275 | middleware.ts, session-edge.ts |
| 2 | Create UserMenu dropdown component | 438b3df | UserMenu.tsx, dropdown-menu.tsx |
| 3 | Update Header with auth-aware navigation | 794caa0 | Header.tsx, hu.json |

## Changes Made

### Middleware (`middleware.ts`)
Route protection at the Edge:
- **Protected routes:** `/fiok`, `/penztar` - redirect to login if not authenticated
- **Auth routes:** `/auth/bejelentkezes`, `/auth/regisztracio`, `/auth/elfelejtett-jelszo` - redirect to /fiok if authenticated
- **Skip routes:** `/api`, `/_next`, `/favicon.ico` - pass through without auth check

Features:
- Locale-aware path matching (removes /hu or /en prefix)
- Saves original URL in `redirect` query param for post-login redirect
- Performance optimization: only decrypt session for protected/auth routes

### Edge-Compatible Session (`session-edge.ts`)
Separate module for middleware runtime:
- No `import "server-only"` (breaks in Edge)
- Only exports `decrypt()` function needed by middleware
- Uses same jose jwtVerify as session.ts

### UserMenu Component (`UserMenu.tsx`)
Client component dropdown menu for authenticated users:
- Displays username and email in header
- Links to account pages:
  - Fiokom (Settings)
  - Rendeleseim (Orders)
  - Szallitasi cimek (Shipping addresses)
- Logout action via form submission to logoutAction

### Header Component Updates
Converted to async Server Component:
- Uses `getTranslations()` instead of `useTranslations()`
- Calls `verifySession()` from DAL
- Conditional rendering:
  - Not authenticated: "Bejelentkezes" (Login) button linking to /auth/bejelentkezes
  - Authenticated: UserMenu dropdown with user info

### Translation Updates
Added to `hu.json`:
- `nav.login`: "Bejelentkezes"

## Decisions Made

1. **Separate session-edge.ts module:** The main session.ts uses `import "server-only"` which fails in Edge middleware runtime. Created a minimal Edge-compatible module with just the decrypt function.

2. **Protected routes list:** `/fiok` (account) and `/penztar` (checkout) require authentication. Public product browsing remains accessible.

3. **Redirect URL preservation:** When redirecting to login, the original URL is saved in `?redirect=` query parameter so users return to their intended page after authentication.

4. **Async Server Component Header:** Converting Header to async allows direct use of `getTranslations` and `verifySession` without passing auth state from layout.

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- [x] `pnpm build` in apps/web compiles without errors
- [x] Middleware.ts created with protectedRoutes and authRoutes arrays
- [x] session-edge.ts created for Edge runtime compatibility
- [x] UserMenu.tsx created with dropdown menu and logout action
- [x] Header.tsx updated with auth-aware conditional rendering
- [x] Login translation key added to Hungarian messages

## Next Phase Readiness

### Ready For
- 05-05: Account management pages at /fiok/* routes
- Protected pages now redirect properly to login
- Header shows correct auth state

### Notes
- Next.js 16.1.4 shows deprecation warning for middleware convention (suggests using "proxy" instead) - middleware still works but may need migration in future Next.js versions

## Artifacts

- Middleware: `apps/web/src/middleware.ts`
- Edge session: `apps/web/src/lib/auth/session-edge.ts`
- User menu: `apps/web/src/components/layout/UserMenu.tsx`
- Dropdown UI: `apps/web/src/components/ui/dropdown-menu.tsx`
- Updated Header: `apps/web/src/components/layout/Header.tsx`
