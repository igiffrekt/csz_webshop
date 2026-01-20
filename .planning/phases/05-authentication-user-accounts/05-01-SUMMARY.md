---
phase: 05-authentication-user-accounts
plan: 01
subsystem: authentication
tags: [strapi, user-model, shipping-address, email, typescript]

dependency_graph:
  requires: [04-08] # Shopping cart complete
  provides:
    - Extended user model with B2B fields
    - ShippingAddress content type
    - Email provider configuration
    - User/ShippingAddress TypeScript interfaces
  affects: [05-02, 05-03, 05-04, 06-01] # Auth flows, profile, addresses, checkout

tech_stack:
  added:
    - "@strapi/provider-email-nodemailer: ^5.33.3"
  patterns:
    - Strapi user model extension via extensions/users-permissions
    - Bidirectional relations between custom types and users-permissions
    - Nodemailer SMTP for transactional emails

key_files:
  created:
    - apps/cms/src/extensions/users-permissions/content-types/user/schema.json
    - apps/cms/src/api/shipping-address/content-types/shipping-address/schema.json
    - apps/cms/src/api/shipping-address/controllers/shipping-address.ts
    - apps/cms/src/api/shipping-address/services/shipping-address.ts
    - apps/cms/src/api/shipping-address/routes/shipping-address.ts
  modified:
    - apps/cms/config/plugins.ts
    - apps/cms/.env.example
    - apps/cms/package.json
    - packages/types/src/index.ts
    - pnpm-lock.yaml

decisions:
  - id: user-extension-pattern
    choice: "Schema extension via extensions/users-permissions directory"
    rationale: "Strapi 5 recommended pattern for adding fields to built-in user model"
  - id: shipping-address-collection
    choice: "Separate collection type with user relation"
    rationale: "Users can have multiple addresses, separate CRUD operations"
  - id: jwt-expiry-7d
    choice: "7-day JWT expiration"
    rationale: "Balance between security and user convenience for e-commerce"
  - id: mailtrap-dev
    choice: "Mailtrap defaults for development"
    rationale: "Safe email testing without sending to real addresses"
  - id: rate-limit-auth
    choice: "5 requests per 5 minutes for auth endpoints"
    rationale: "Prevent brute force attacks on login/register"

metrics:
  duration: "~8 minutes"
  completed: 2026-01-20
---

# Phase 05 Plan 01: User Model & Shipping Address Summary

Extended Strapi user model with B2B profile fields (firstName, lastName, phone, companyName, vatNumber), created ShippingAddress collection type with user relation, configured nodemailer email provider, and added TypeScript interfaces.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extend Strapi user model with profile and B2B fields | 6c1706e | user/schema.json |
| 2 | Create ShippingAddress content type in Strapi | 45b4081 | shipping-address/* |
| 3 | Configure email provider and users-permissions plugin | 146331a | plugins.ts, .env.example, package.json |
| 4 | Add User and ShippingAddress TypeScript interfaces | a2b92e7 | packages/types/src/index.ts |

## Changes Made

### User Model Extension
Created `apps/cms/src/extensions/users-permissions/content-types/user/schema.json` with:
- `firstName` (string, max 100)
- `lastName` (string, max 100)
- `phone` (string, max 50)
- `companyName` (string, max 255) - B2B company name
- `vatNumber` (string, max 50) - Hungarian VAT (adoszam)
- `shippingAddresses` (oneToMany relation)

### ShippingAddress Content Type
Created full API structure in `apps/cms/src/api/shipping-address/`:
- `label` - User-friendly name (e.g., "Home", "Office")
- `recipientName` - Delivery recipient
- `street`, `city`, `postalCode` - Address fields
- `country` - Default "Magyarorszag"
- `phone` - Delivery phone number
- `isDefault` - Mark preferred address
- `user` - manyToOne relation to users-permissions user

### Email Provider Configuration
Updated `apps/cms/config/plugins.ts`:
- Nodemailer provider with SMTP configuration
- Mailtrap sandbox defaults for development
- Default from/reply-to addresses

### Users-Permissions Configuration
- JWT expiration: 7 days
- Allowed registration fields: firstName, lastName, phone, companyName, vatNumber
- Rate limiting: 5 requests per 5 minutes

### TypeScript Interfaces
Added to `packages/types/src/index.ts`:
- `User` - Full user profile with B2B fields
- `ShippingAddress` - Address with user relation
- `AuthResponse` - JWT + user from login/register
- `SessionPayload` - For encrypted cookie storage

## Decisions Made

1. **User extension pattern**: Used `extensions/users-permissions/content-types/user/` directory structure as recommended by Strapi 5 for extending built-in user model.

2. **Separate ShippingAddress collection**: Created as independent collection type rather than component, allowing users to manage multiple addresses with CRUD operations.

3. **7-day JWT expiration**: Balanced security with e-commerce UX - users stay logged in for a week.

4. **Mailtrap for development**: Default SMTP configuration uses Mailtrap sandbox to prevent accidental emails to real users.

5. **Auth rate limiting**: 5 attempts per 5 minutes protects against brute force attacks while allowing legitimate retries.

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- [x] User schema extension file exists and is valid JSON
- [x] ShippingAddress content type files exist
- [x] Strapi builds successfully with new content types
- [x] nodemailer provider in package.json dependencies
- [x] TypeScript interfaces compile without errors
- [x] All interfaces exported from @csz/types

## Next Phase Readiness

### Ready For
- 05-02: Registration and login flows with extended user fields
- 05-03: Session management with SessionPayload interface
- 05-04: User profile and shipping address management

### Prerequisites for Email Testing
User must configure SMTP credentials:
1. Create Mailtrap account at https://mailtrap.io
2. Add credentials to apps/cms/.env:
   - SMTP_HOST
   - SMTP_PORT
   - SMTP_USERNAME
   - SMTP_PASSWORD
   - SMTP_FROM (verified sender)

## Artifacts

- User schema: `apps/cms/src/extensions/users-permissions/content-types/user/schema.json`
- ShippingAddress: `apps/cms/src/api/shipping-address/content-types/shipping-address/schema.json`
- Email config: `apps/cms/config/plugins.ts`
- Types: `packages/types/src/index.ts`
