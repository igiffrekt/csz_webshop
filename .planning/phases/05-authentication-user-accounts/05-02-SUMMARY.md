---
phase: 05-authentication-user-accounts
plan: 02
subsystem: authentication
tags: [next.js, session, jose, server-actions, zod, jwt]

dependency_graph:
  requires: [05-01] # User model with B2B fields
  provides:
    - Session management with jose JWT encryption
    - Data Access Layer for session verification
    - Server Actions for login/register/logout
    - Password reset Server Actions
  affects: [05-03, 05-04, 06-01] # Auth forms, profile pages, checkout

tech_stack:
  added:
    - "jose: ^6.1.3"
    - "server-only: ^0.0.1"
    - "zod: ^4.3.5"
  patterns:
    - Session encryption with jose SignJWT/jwtVerify
    - httpOnly cookie storage with sameSite protection
    - React cache() for request-scoped session deduplication
    - Server Actions with zod schema validation
    - Email enumeration protection in forgot password

key_files:
  created:
    - apps/web/src/lib/auth/session.ts
    - apps/web/src/lib/auth/dal.ts
    - apps/web/src/lib/auth/actions.ts
  modified:
    - apps/web/package.json
    - apps/web/.env.example
    - pnpm-lock.yaml

decisions:
  - id: jose-session-encryption
    choice: "jose library for JWT encryption/decryption"
    rationale: "Lightweight, modern JWT library recommended by Next.js auth docs"
  - id: httponly-cookie-session
    choice: "httpOnly cookie with sameSite:lax"
    rationale: "Prevents XSS access to session, CSRF protection via sameSite"
  - id: strapi-jwt-wrapping
    choice: "Wrap Strapi JWT inside our own encrypted JWT"
    rationale: "Control session expiry independent of Strapi, add custom claims"
  - id: react-cache-dal
    choice: "React cache() for session verification"
    rationale: "Deduplicate session checks within same request"
  - id: hungarian-error-messages
    choice: "All validation errors in Hungarian"
    rationale: "Hungarian market focus, consistent UX"
  - id: email-enumeration-protection
    choice: "Always return success for forgot password"
    rationale: "Prevents attackers from discovering valid emails"

metrics:
  duration: "~6 minutes"
  completed: 2026-01-20
---

# Phase 05 Plan 02: Session Management & Server Actions Summary

Created Next.js session management with jose JWT encryption in httpOnly cookies, Data Access Layer with React cache() for session verification, and Server Actions for login/register/logout/password-reset with zod validation and Hungarian error messages.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install jose, server-only, and zod packages | 6503205 | package.json, .env.example |
| 2 | Create session management library with jose | 50d5e38 | auth/session.ts |
| 3 | Create Data Access Layer for session verification | 202943d | auth/dal.ts |
| 4 | Create Server Actions for authentication operations | 87a307d | auth/actions.ts |

## Changes Made

### Session Management Library (`session.ts`)
- `encrypt(payload)` - Sign JWT with jose SignJWT, HS256 algorithm
- `decrypt(session)` - Verify and decode JWT with jwtVerify
- `createSession(strapiResponse)` - Create session cookie from Strapi auth response
- `deleteSession()` - Remove session cookie on logout
- `getSession()` - Retrieve and decrypt current session
- `updateSession()` - Extend session if expiring within 1 day

Session configuration:
- Cookie name: `csz-session`
- Duration: 7 days
- httpOnly: true (XSS protection)
- secure: true in production (HTTPS only)
- sameSite: lax (CSRF protection)

### Data Access Layer (`dal.ts`)
- `verifySession()` - Cached session check, returns `{isAuth, session}`
- `requireAuth()` - Redirect to login if not authenticated
- `getCurrentUserId()` - Get user ID for optional personalization
- `getStrapiJwt()` - Get Strapi JWT for authenticated API calls

Uses React `cache()` to deduplicate session verification within same request.

### Server Actions (`actions.ts`)
All actions use zod validation with Hungarian error messages:

- `loginAction` - POST to Strapi `/api/auth/local`, create session, redirect
- `registerAction` - POST to `/api/auth/local/register` with B2B fields
- `logoutAction` - Delete session, redirect to home
- `forgotPasswordAction` - POST to `/api/auth/forgot-password` (always returns success)
- `resetPasswordAction` - POST to `/api/auth/reset-password`, redirect to login

Error handling:
- Field-level validation errors returned in `fieldErrors`
- General errors in `error` string
- Success state in `success` boolean

### Environment Variables
Added to `.env.example`:
- `STRAPI_URL` - Internal Strapi URL for server-side auth API calls
- `SESSION_SECRET` - Required 32+ character secret for JWT signing

## Decisions Made

1. **jose for session encryption**: Lightweight, ESM-native JWT library recommended by Next.js documentation. No heavy auth framework needed.

2. **Wrap Strapi JWT in our own JWT**: Gives us control over session expiry and cookie settings independent of Strapi's JWT configuration.

3. **React cache() in DAL**: Deduplicates `verifySession()` calls within same request - a layout and page both checking auth only makes one session lookup.

4. **Hungarian error messages**: All zod validation messages in Hungarian for consistent localized UX.

5. **Email enumeration protection**: `forgotPasswordAction` always returns success, preventing attackers from discovering valid email addresses.

6. **Server-only import**: Both `session.ts` and `dal.ts` use `import "server-only"` to fail at build time if accidentally imported in client code.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Zod not installed**
- **Found during:** Task 1 preparation
- **Issue:** Plan assumed zod was already in project (stated "already in project from existing forms")
- **Fix:** Added zod to package installation alongside jose and server-only
- **Files modified:** apps/web/package.json
- **Commit:** 6503205

## Verification Results

- [x] `pnpm build` in apps/web compiles without errors
- [x] TypeScript type check passes
- [x] jose and server-only in package.json dependencies
- [x] zod in package.json dependencies
- [x] SESSION_SECRET documented in .env.example
- [x] session.ts exports: encrypt, decrypt, createSession, deleteSession, getSession, updateSession
- [x] dal.ts exports: verifySession, requireAuth, getCurrentUserId, getStrapiJwt
- [x] actions.ts exports: loginAction, registerAction, logoutAction, forgotPasswordAction, resetPasswordAction, AuthState

## Next Phase Readiness

### Ready For
- 05-03: Registration and login UI forms using Server Actions
- 05-04: User profile pages with requireAuth protection
- 05-05: Account settings with shipping address management

### Prerequisites for Testing
User must set SESSION_SECRET:
1. Generate secret: `openssl rand -base64 32`
2. Add to `apps/web/.env`:
   ```
   SESSION_SECRET=<generated-secret>
   ```

## Artifacts

- Session library: `apps/web/src/lib/auth/session.ts`
- Data Access Layer: `apps/web/src/lib/auth/dal.ts`
- Server Actions: `apps/web/src/lib/auth/actions.ts`
- Environment docs: `apps/web/.env.example`
