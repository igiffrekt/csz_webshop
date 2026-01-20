---
phase: 05-authentication-user-accounts
plan: 06
subsystem: account-management
tags: [next.js, shipping-addresses, crud, strapi-api, dialog]

dependency_graph:
  requires: [05-01, 05-04] # User model with addresses, middleware auth
  provides:
    - Shipping address CRUD API functions
    - AddressCard and AddressForm components
    - Addresses management page at /fiok/cimek
    - API routes for client-side mutations
  affects: [06-01] # Checkout will use saved addresses

tech_stack:
  added:
    - "@radix-ui/react-dialog: ^1.1.14"
    - "@radix-ui/react-alert-dialog: ^1.1.14"
  patterns:
    - Server-only API functions with session JWT
    - Server Component page with client island
    - API routes wrapping server-only functions
    - Dialog for add/edit forms
    - AlertDialog for delete confirmation

key_files:
  created:
    - apps/web/src/lib/address-api.ts
    - apps/web/src/components/account/AddressCard.tsx
    - apps/web/src/components/account/AddressForm.tsx
    - apps/web/src/components/ui/dialog.tsx
    - apps/web/src/components/ui/alert-dialog.tsx
    - apps/web/src/app/[locale]/fiok/cimek/page.tsx
    - apps/web/src/app/[locale]/fiok/cimek/AddressesClient.tsx
    - apps/web/src/app/api/addresses/route.ts
    - apps/web/src/app/api/addresses/set-default/route.ts
  modified: []

decisions:
  - id: server-only-api-functions
    choice: "Use 'server-only' import for address API functions"
    rationale: "API functions use session JWT, must run server-side only"
  - id: api-routes-for-mutations
    choice: "Create API routes that wrap server-only functions"
    rationale: "Client components cannot import server-only modules directly"
  - id: exclusive-default-address
    choice: "Clear other defaults before setting new default"
    rationale: "Only one address can be default at a time for checkout"
  - id: dialog-for-forms
    choice: "Use Dialog for add/edit forms instead of separate pages"
    rationale: "Better UX with modal overlay, no page navigation"

metrics:
  duration: "~4 minutes"
  completed: 2026-01-20
---

# Phase 05 Plan 06: Shipping Addresses Management Summary

Created shipping address management page with full CRUD functionality allowing users to save, edit, delete, and set default shipping addresses for faster checkout.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create address API functions | 6a341b8 | address-api.ts |
| 2 | Create AddressCard and AddressForm components | fc36dc4 | AddressCard.tsx, AddressForm.tsx, dialog.tsx, alert-dialog.tsx |
| 3 | Create shipping addresses page | c2ee288 | page.tsx, AddressesClient.tsx, route.ts, set-default/route.ts |

## Changes Made

### Address API Functions (`address-api.ts`)
Server-only functions for Strapi shipping-addresses endpoint:
- **getAddresses():** Fetch all addresses for current user, sorted by default first
- **createAddress():** Create new address with user relation
- **updateAddress():** Update existing address by documentId
- **deleteAddress():** Remove address by documentId
- **clearDefaultAddresses():** Helper to unset all defaults before setting new one

All functions:
- Use session JWT from httpOnly cookie
- Return `{ data, error }` response format
- Handle authentication check internally

### AddressCard Component
Client component displaying address with actions:
- Shows label, recipient name, full address, phone
- "Alapertelmezett" (Default) badge with star icon
- Edit button opens form dialog
- Set default button (hidden if already default)
- Delete button with AlertDialog confirmation

### AddressForm Component
Reusable form for create/edit:
- Label field (e.g., "Otthon", "Iroda")
- Recipient name, street, city, postal code, country
- Optional phone field
- "Set as default" checkbox
- Loading state during submission
- Hungarian validation messages

### Addresses Page (`/fiok/cimek`)
Server Component with client island:
- Requires authentication via `requireAuth()`
- Fetches addresses server-side
- Back link to /fiok account page
- Empty state with helpful message and add button
- Grid layout (2 columns on desktop) for address cards

### AddressesClient Component
Client component for interactivity:
- Manages dialog open/close state
- Handles add/edit mode switching
- Calls API routes for mutations
- Uses router.refresh() to revalidate data

### API Routes
Bridge between client components and server-only functions:
- **POST /api/addresses:** Create new address
- **PUT /api/addresses:** Update existing address
- **DELETE /api/addresses?documentId=xxx:** Remove address
- **POST /api/addresses/set-default:** Set address as default

## Decisions Made

1. **Server-only API functions:** The address API uses `import "server-only"` because it accesses session JWT. Client components use API routes instead.

2. **API routes as bridge:** Created `/api/addresses` routes that wrap the server-only functions, allowing client components to perform mutations via fetch.

3. **Exclusive default handling:** When setting an address as default, all other addresses are first updated to `isDefault: false` to ensure only one default exists.

4. **Dialog for forms:** Used Dialog overlay for add/edit forms instead of separate pages for better UX without navigation.

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- [x] Address API functions export getAddresses, createAddress, updateAddress, deleteAddress
- [x] AddressCard component contains "isDefault" reference
- [x] AddressForm component contains "recipientName" field
- [x] Page imports getAddresses from address-api
- [x] address-api.ts fetches from shipping-addresses endpoint
- [x] TypeScript compilation succeeds

## Next Phase Readiness

### Ready For
- 06-01: Checkout page can use saved addresses for shipping
- Address selection dropdown in checkout form
- Default address auto-selected

### Strapi Configuration Required
Before using addresses page, configure Strapi permissions:
1. Settings > Users & Permissions > Roles > Authenticated
2. Enable find, findOne, create, update, delete for shipping-address

## Artifacts

- API functions: `apps/web/src/lib/address-api.ts`
- Address card: `apps/web/src/components/account/AddressCard.tsx`
- Address form: `apps/web/src/components/account/AddressForm.tsx`
- Addresses page: `apps/web/src/app/[locale]/fiok/cimek/page.tsx`
- Client component: `apps/web/src/app/[locale]/fiok/cimek/AddressesClient.tsx`
- API routes: `apps/web/src/app/api/addresses/route.ts`, `apps/web/src/app/api/addresses/set-default/route.ts`
