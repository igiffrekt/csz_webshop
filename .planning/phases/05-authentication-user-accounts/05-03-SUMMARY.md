---
phase: 05-authentication-user-accounts
plan: 03
subsystem: authentication
tags: [next.js, react, forms, useActionState, server-actions, auth-ui]

dependency_graph:
  requires: [05-02] # Server Actions for login/register/logout/password-reset
  provides:
    - Login page at /auth/bejelentkezes
    - Registration page at /auth/regisztracio with B2B fields
    - Forgot password page at /auth/elfelejtett-jelszo
    - Reset password page at /auth/jelszo-visszaallitas
    - Four reusable auth form components
  affects: [05-04, 05-05, 06-01] # Profile pages, account settings, checkout

tech_stack:
  added: []
  patterns:
    - useActionState for form state with Server Actions
    - Conditional field rendering (B2B checkbox toggle)
    - Success state display pattern (forgot password)
    - Code validation via URL searchParams
    - Hungarian text throughout UI

key_files:
  created:
    - apps/web/src/components/auth/LoginForm.tsx
    - apps/web/src/components/auth/RegisterForm.tsx
    - apps/web/src/components/auth/ForgotPasswordForm.tsx
    - apps/web/src/components/auth/ResetPasswordForm.tsx
    - apps/web/src/app/[locale]/auth/bejelentkezes/page.tsx
    - apps/web/src/app/[locale]/auth/regisztracio/page.tsx
    - apps/web/src/app/[locale]/auth/elfelejtett-jelszo/page.tsx
    - apps/web/src/app/[locale]/auth/jelszo-visszaallitas/page.tsx
  modified: []

decisions:
  - id: useActionState-pattern
    choice: "useActionState hook for all auth forms"
    rationale: "React 19 pattern for form state with Server Actions, provides isPending and error state"
  - id: checkbox-b2b-toggle
    choice: "Checkbox toggles B2B company fields visibility"
    rationale: "Keep form simple for consumers, show company fields only when needed"
  - id: success-state-display
    choice: "Forgot password shows success message instead of redirecting"
    rationale: "User needs to know to check email, not leave the page"
  - id: code-from-searchparams
    choice: "Reset password code from URL searchParams"
    rationale: "Standard email link pattern, code passed via ?code= query param"

metrics:
  duration: "~6 minutes"
  completed: 2026-01-20
---

# Phase 05 Plan 03: Registration and Login UI Forms Summary

Created four auth pages (login, registration, forgot password, reset password) with corresponding form components using useActionState for Server Action integration, Hungarian labels throughout, and B2B field toggle for company customers.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create LoginForm component and login page | 9f5df94 | LoginForm.tsx, bejelentkezes/page.tsx |
| 2 | Create RegisterForm component and registration page | ee44197 | RegisterForm.tsx, regisztracio/page.tsx |
| 3 | Create password reset forms and pages | 93852c7 | ForgotPasswordForm.tsx, ResetPasswordForm.tsx, elfelejtett-jelszo/page.tsx, jelszo-visszaallitas/page.tsx |

## Changes Made

### LoginForm Component (`LoginForm.tsx`)
- Email and password fields with Hungarian labels
- useActionState integration with loginAction Server Action
- Field-level validation error display from zod schema
- "Forgot password" link to /auth/elfelejtett-jelszo
- "Register" link for new users
- Supports redirectTo prop for protected page flow
- Button shows loading state during submission

### Login Page (`bejelentkezes/page.tsx`)
- Server Component page with metadata
- Displays password reset success message when ?reset=success
- Passes redirect query param to LoginForm

### RegisterForm Component (`RegisterForm.tsx`)
- First name, last name (optional, grid layout)
- Username (required)
- Email (required)
- Phone (optional)
- Password with confirmation (required)
- Checkbox toggles B2B company fields
- Company name and VAT number fields (hidden by default)
- Field-level validation error display
- Link to login for existing users

### Registration Page (`regisztracio/page.tsx`)
- Server Component page with metadata
- Renders RegisterForm

### ForgotPasswordForm Component (`ForgotPasswordForm.tsx`)
- Email field for password reset request
- Success state shows email sent message
- "Check spam" reminder with retry button
- Back to login link

### Forgot Password Page (`elfelejtett-jelszo/page.tsx`)
- Server Component page with metadata
- Renders ForgotPasswordForm

### ResetPasswordForm Component (`ResetPasswordForm.tsx`)
- Hidden code field from URL
- New password and confirmation fields
- Error display for invalid/expired codes

### Reset Password Page (`jelszo-visszaallitas/page.tsx`)
- Server Component with async searchParams
- Shows invalid link message if code missing
- Renders ResetPasswordForm with code prop

## Decisions Made

1. **useActionState pattern**: All forms use React 19's useActionState hook which provides pending state and previous action result. This is the recommended pattern for forms with Server Actions.

2. **B2B checkbox toggle**: Company fields (companyName, vatNumber) hidden by default, revealed when user checks "Ceges vasarlo vagyok" checkbox. Keeps form simple for B2C customers.

3. **Success state in ForgotPasswordForm**: Instead of redirecting after forgot password submission, we show success message on the same page. User needs to see instructions to check email.

4. **Code validation via searchParams**: Reset password page receives code via URL query parameter. If code is missing, shows error with link to request new code.

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- [x] pnpm build completes without errors
- [x] TypeScript type check passes
- [x] /hu/auth/bejelentkezes page in build output
- [x] /hu/auth/regisztracio page in build output
- [x] /hu/auth/elfelejtett-jelszo page in build output
- [x] /hu/auth/jelszo-visszaallitas page in build output
- [x] LoginForm imports loginAction from actions.ts
- [x] RegisterForm imports registerAction from actions.ts
- [x] All forms use useActionState hook
- [x] RegisterForm contains companyName field
- [x] All text in Hungarian

## Next Phase Readiness

### Ready For
- 05-04: User profile and account pages (use requireAuth from DAL)
- 05-05: Shipping address management
- 06-01: Checkout flow with authenticated users

### Integration Points
- Header needs login/account link (check session, show user menu or login button)
- Protected routes should redirect to /auth/bejelentkezes?redirect=<path>
- Cart merge logic needed when anonymous user logs in

## Artifacts

**Form Components:**
- `apps/web/src/components/auth/LoginForm.tsx`
- `apps/web/src/components/auth/RegisterForm.tsx`
- `apps/web/src/components/auth/ForgotPasswordForm.tsx`
- `apps/web/src/components/auth/ResetPasswordForm.tsx`

**Pages:**
- `apps/web/src/app/[locale]/auth/bejelentkezes/page.tsx`
- `apps/web/src/app/[locale]/auth/regisztracio/page.tsx`
- `apps/web/src/app/[locale]/auth/elfelejtett-jelszo/page.tsx`
- `apps/web/src/app/[locale]/auth/jelszo-visszaallitas/page.tsx`
