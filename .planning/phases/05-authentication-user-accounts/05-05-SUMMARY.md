---
phase: 05-authentication-user-accounts
plan: 05
subsystem: account-management
tags: [next.js, server-components, server-actions, profile, strapi-users]

dependency_graph:
  requires: [05-03, 05-04] # Auth forms, middleware protection
  provides:
    - Account dashboard page at /fiok
    - Profile settings page at /fiok/profil
    - ProfileForm client component
    - updateProfileAction Server Action
    - getCurrentUserProfile Server Action
  affects: [06-01] # Checkout will use profile data

tech_stack:
  added: []
  patterns:
    - Server Component page with client form island
    - useActionState for optimistic form state
    - Strapi Users & Permissions API for profile updates
    - Navigation cards pattern for account dashboard

key_files:
  created:
    - apps/web/src/app/[locale]/fiok/page.tsx
    - apps/web/src/app/[locale]/fiok/profil/page.tsx
    - apps/web/src/components/account/ProfileForm.tsx
  modified:
    - apps/web/src/lib/auth/actions.ts

decisions:
  - id: server-component-dashboard
    choice: "Account dashboard as Server Component with requireAuth"
    rationale: "No client state needed, auth check at server level"
  - id: client-profile-form
    choice: "ProfileForm as client component with useActionState"
    rationale: "Form submission requires client-side state for pending/success feedback"
  - id: strapi-users-api
    choice: "PUT to /api/users/:id for profile updates"
    rationale: "Standard Strapi Users & Permissions endpoint with JWT auth"
  - id: users-me-endpoint
    choice: "GET /api/users/me for full profile fetch"
    rationale: "Returns complete user object including custom fields"

metrics:
  duration: "~3 minutes"
  completed: 2026-01-20
---

# Phase 05 Plan 05: Account Management Pages Summary

Created account dashboard and profile management pages allowing users to view account overview and update their personal and company information via Strapi API.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create account dashboard page | ec748ec | fiok/page.tsx |
| 2 | Add updateProfileAction to auth actions | 05ddc4d | actions.ts |
| 3 | Create ProfileForm and profile page | 821187c | profil/page.tsx, ProfileForm.tsx |

## Changes Made

### Account Dashboard (`/fiok/page.tsx`)
Server Component main account page:
- **Welcome message:** Displays `Udvozollek, {username}!`
- **Navigation cards:**
  - Profil beallitasok (Profile settings) - link to /fiok/profil
  - Szallitasi cimek (Shipping addresses) - link to /fiok/cimek
  - Rendeleseim (Orders) - link to /fiok/rendelesek
- **Account info:** Email and username display
- **Logout button:** Form action to logoutAction

### Profile Actions (`actions.ts`)
New Server Actions added:
- **updateProfileAction:** Validates and updates user profile via Strapi
  - Schema: firstName, lastName, phone, companyName, vatNumber
  - Uses session JWT for authenticated PUT request
  - Returns success/error state for form feedback
- **getCurrentUserProfile:** Fetches full user data from /api/users/me
  - Returns User type with all custom B2B fields
  - Cached with `cache: "no-store"` for fresh data

### Profile Page (`/fiok/profil/page.tsx`)
Server Component profile settings page:
- **Back navigation:** Link to account dashboard
- **Read-only info:** Email and username (not editable)
- **ProfileForm component:** Editable fields

### ProfileForm Component (`ProfileForm.tsx`)
Client component for editing profile:
- **useActionState:** React 19 pattern for form state
- **Personal fields:**
  - Vezeteknev (Last name)
  - Keresztnev (First name)
  - Telefonszam (Phone)
- **Company fields (B2B):**
  - Cegnev (Company name)
  - Adoszam (VAT number)
- **Feedback states:**
  - Error display for failed updates
  - Success message on update
  - Pending state disables form during submission

## Decisions Made

1. **Server Component dashboard:** Account dashboard has no interactive state, so pure Server Component with `requireAuth()` for auth check.

2. **Client form island:** ProfileForm is the only client component on profile page - form submission needs client-side useActionState for pending/success feedback.

3. **Strapi Users API for updates:** Using standard `PUT /api/users/:id` endpoint with JWT authorization header for profile updates.

4. **GET /api/users/me for profile:** Returns the complete user object including all custom fields (firstName, lastName, phone, companyName, vatNumber).

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- [x] Account dashboard at /hu/fiok shows user info and navigation cards
- [x] Profile page at /hu/fiok/profil loads user data from Strapi
- [x] ProfileForm imports updateProfileAction from actions.ts
- [x] /fiok/page.tsx imports requireAuth from dal.ts
- [x] updateProfileAction calls Strapi API with JWT authorization
- [x] getCurrentUserProfile fetches full user data
- [x] All text is in Hungarian

## Requirements Coverage

- **ACCT-03:** Update profile - updateProfileAction + ProfileForm
- **ACCT-05:** Company info - companyName and vatNumber fields in profile

## Next Phase Readiness

### Ready For
- Phase 5 complete - all authentication and user account features implemented
- Phase 6: Checkout & Payments can use profile data for pre-filling checkout forms

### Notes
- Shipping address management at /fiok/cimek appears to have been created separately (outside this plan scope)
- Orders page at /fiok/rendelesek will be implemented when Order content type exists in Phase 6/7

## Artifacts

- Dashboard: `apps/web/src/app/[locale]/fiok/page.tsx`
- Profile page: `apps/web/src/app/[locale]/fiok/profil/page.tsx`
- Profile form: `apps/web/src/components/account/ProfileForm.tsx`
- Updated actions: `apps/web/src/lib/auth/actions.ts`
