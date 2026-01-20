---
phase: 05-authentication-user-accounts
plan: 07
subsystem: account-pages
tags: [orders, typescript, next.js, placeholder]
dependency-graph:
  requires: ["05-05", "05-06"]
  provides: ["Order types", "Order history page", "Order detail page"]
  affects: ["06-*"]
tech-stack:
  added: []
  patterns: ["placeholder-for-future-phase", "empty-state-ui"]
key-files:
  created:
    - packages/types/src/index.ts (Order, OrderLineItem, OrderStatus types)
    - apps/web/src/components/account/OrderCard.tsx
    - apps/web/src/app/[locale]/fiok/rendelesek/page.tsx
    - apps/web/src/app/[locale]/fiok/rendelesek/[id]/page.tsx
    - apps/web/src/app/[locale]/fiok/rendelesek/[id]/not-found.tsx
  modified: []
decisions:
  - key: placeholder-types-pattern
    choice: Define Order types before content type exists
    why: Enables frontend development in parallel with backend
metrics:
  duration: ~10min
  completed: 2026-01-20
---

# Phase 05 Plan 07: Order History Pages Summary

Order history and order detail pages with placeholders for Phase 6 checkout integration.

## What Was Built

### Task 1: Order Type Placeholders (272181c)
- Added `OrderLineItem` interface to @csz/types
- Added `OrderStatus` type with 7 order states (pending, paid, processing, shipped, delivered, cancelled, refunded)
- Added `Order` interface with:
  - Order identification (id, documentId, orderNumber, status)
  - Pricing (subtotal, discount, shipping, tax, total)
  - Address snapshots (shippingAddress, billingAddress)
  - Line items array
  - Coupon info if applied
  - Payment info (method, paymentId, paidAt)
  - Timestamps

### Task 2: Order History Page (fdc1fa4)
- Created `/fiok/rendelesek` page at `apps/web/src/app/[locale]/fiok/rendelesek/page.tsx`
- Page protected with `requireAuth()`
- Shows empty state with "Meg nincsenek rendeleseid" message
- Includes "Termekek bongeszese" CTA linking to products
- Created `OrderCard` component for displaying orders in list:
  - Status badges with Hungarian labels and color variants
  - Order number, date, total, and item count

### Task 3: Order Detail Page (20821cb)
- Created `/fiok/rendelesek/[id]` page at `apps/web/src/app/[locale]/fiok/rendelesek/[id]/page.tsx`
- Full order information display:
  - Header with order number, status badge, date
  - Line items with product names, variants, quantities, prices
  - Price summary (subtotal, discount, shipping, VAT, total)
  - Shipping address card
  - Billing address card (if different)
  - Payment info card
- Created not-found.tsx for invalid order IDs
- Page protected with `requireAuth()`

## Key Implementation Details

### Order Status System
Status labels in Hungarian:
- `pending` - "Fizetesre var" (outline badge)
- `paid` - "Fizetve" (default/primary badge)
- `processing` - "Feldolgozas alatt" (secondary badge)
- `shipped` - "Kiszallitva" (secondary badge)
- `delivered` - "Kiszallitva" (default badge)
- `cancelled` - "Torolt" (destructive badge)
- `refunded` - "Visszateritett" (destructive badge)

### Placeholder Pattern
Both pages have `getOrders()` and `getOrder()` functions that return empty/null.
These will be implemented in Phase 6 when:
1. Order content type is created in Strapi
2. Checkout flow creates orders
3. API permissions are configured

### Address Snapshot Design
Order stores address snapshots (not references) so:
- Historical accuracy preserved if user changes addresses later
- Order always shows address used at purchase time
- Includes company/VAT info for B2B billing

## Verification Results
- `/hu/fiok/rendelesek` - Shows empty state correctly
- `/hu/fiok/rendelesek/test-id` - Shows not-found page (expected)
- `pnpm build` - Compiles successfully, no TypeScript errors
- Order and OrderLineItem types exported from @csz/types

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

Phase 6 (Checkout & Payments) can now:
1. Create Order content type in Strapi matching the Order interface
2. Implement `getOrders()` to fetch user's orders from Strapi
3. Implement `getOrder()` to fetch single order with authorization check
4. Create checkout flow that creates orders using the defined structure
5. The UI is ready and will display orders once data exists

## Files Created

| File | Purpose | Lines |
|------|---------|-------|
| packages/types/src/index.ts | Order/OrderLineItem/OrderStatus types | +70 |
| apps/web/src/components/account/OrderCard.tsx | Order list card component | 58 |
| apps/web/src/app/[locale]/fiok/rendelesek/page.tsx | Order history page | 61 |
| apps/web/src/app/[locale]/fiok/rendelesek/[id]/page.tsx | Order detail page | 208 |
| apps/web/src/app/[locale]/fiok/rendelesek/[id]/not-found.tsx | Not found handler | 20 |

## Commits

| Hash | Message |
|------|---------|
| 272181c | feat(05-07): add Order and OrderLineItem type placeholders |
| fdc1fa4 | feat(05-07): create order history page with empty state |
| 20821cb | feat(05-07): create order detail page with not-found handler |
