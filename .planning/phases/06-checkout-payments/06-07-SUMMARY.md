---
phase: 06-checkout-payments
plan: 07
subsystem: checkout
tags: [order-confirmation, success-page, order-history, stripe]
requires:
  - "06-01 (Order content type)"
  - "06-02 (Stripe integration)"
  - "06-06 (Order creation & payment)"
provides:
  - "Success page at /penztar/siker"
  - "Order confirmation display"
  - "Order API client for fetching orders"
  - "Real order history at /fiok/rendelesek"
affects:
  - "06-08 (Phase verification)"
tech-stack:
  added: []
  patterns:
    - "Server-only order API with session auth"
    - "Cart/checkout state clearing on success"
    - "Client-compatible formatters separation"
key-files:
  created:
    - "apps/web/src/lib/order-api.ts"
    - "apps/web/src/app/[locale]/penztar/siker/page.tsx"
    - "apps/web/src/app/[locale]/penztar/siker/OrderConfirmation.tsx"
  modified:
    - "apps/web/src/lib/formatters.ts"
    - "apps/web/src/app/[locale]/fiok/rendelesek/page.tsx"
    - "apps/web/src/app/[locale]/fiok/rendelesek/[id]/page.tsx"
decisions:
  - id: DEC-0607-01
    choice: "Move formatOrderStatus to formatters.ts"
    rationale: "Client components cannot import server-only modules; formatOrderStatus is a pure function"
  - id: DEC-0607-02
    choice: "Use vatAmount from Order type"
    rationale: "Matches Strapi schema; plan used 'tax' but types use 'vatAmount'"
  - id: DEC-0607-03
    choice: "Generic success fallback"
    rationale: "Show success message even if order lookup fails (webhook may not have completed)"
metrics:
  duration: "5 minutes"
  completed: "2026-01-21"
---

# Phase 6 Plan 7: Order Confirmation & Success Page Summary

Order API client with getOrder/getOrders/getOrderByStripeSession for authenticated order fetching; success page at /penztar/siker clears cart and displays confirmation.

## What Was Built

### Order API Client (`apps/web/src/lib/order-api.ts`)
- `getOrder(documentId)` - Fetch single order by document ID
- `getOrders()` - Fetch all orders for authenticated user
- `getOrderByStripeSession(sessionId)` - Find order by Stripe session ID (for success page)
- Server-only module using session JWT for authentication
- Hungarian error messages

### Success Page (`/penztar/siker`)
- Requires authentication via `requireAuth()`
- Reads `session_id` from URL query params
- Looks up order via Stripe session ID
- Falls back to generic success if order not found (webhook processing)
- Redirects to checkout if no session_id

### OrderConfirmation Component
- Client component that clears cart and checkout state on mount
- Displays order number, status, and line items
- Shows VAT breakdown (27% AFA)
- Displays shipping address
- Shows PO reference for B2B orders
- Navigation to order history and continue shopping

### Updated Order History
- Order list page fetches real orders from Strapi
- Order detail page shows full order information
- Both pages use formatOrderStatus for Hungarian status labels
- VAT breakdown displayed consistently

## Requirements Addressed

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| PAY-05: Order confirmation | Complete | Success page shows order details |
| ACCT-01: Order history | Complete | Real orders in /fiok/rendelesek |
| ACCT-02: Order details | Complete | Full details in /fiok/rendelesek/[id] |
| LANG-03: Hungarian formats | Complete | formatPrice, formatOrderStatus in Hungarian |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `0ea8389` | Order API client with server-only auth |
| 2 | `7e74cd4` | Success page and OrderConfirmation component |
| 3 | `ea8235b` | Order history updated with real orders |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Client/server boundary for formatOrderStatus**
- **Found during:** Task 2
- **Issue:** OrderConfirmation is a client component but plan had it importing from order-api.ts which uses 'server-only'
- **Fix:** Moved formatOrderStatus to formatters.ts which is client-compatible
- **Files modified:** apps/web/src/lib/formatters.ts, apps/web/src/lib/order-api.ts
- **Commit:** `7e74cd4`

**2. [Rule 1 - Bug] Incorrect field name for VAT**
- **Found during:** Task 2
- **Issue:** Plan used `order.tax` but Order type defines `order.vatAmount`
- **Fix:** Changed to `order.vatAmount` in OrderConfirmation component
- **Files modified:** apps/web/src/app/[locale]/penztar/siker/OrderConfirmation.tsx
- **Commit:** `7e74cd4`

## Decisions Made

### DEC-0607-01: Client-Compatible Formatters
**Decision:** Move formatOrderStatus from order-api.ts to formatters.ts
**Rationale:** The function is used in OrderConfirmation (client component), but order-api.ts imports 'server-only'. Since formatOrderStatus is a pure function with no server dependencies, moving it to formatters.ts allows client-side usage.

### DEC-0607-02: Generic Success Fallback
**Decision:** Show success message even when order lookup fails
**Rationale:** Stripe webhook may still be processing when user lands on success page. Better UX to show success with "we'll email you" than an error.

## Files Changed

```
apps/web/src/lib/
  order-api.ts (created)        - Server-only order fetching
  formatters.ts (modified)      - Added formatOrderStatus

apps/web/src/app/[locale]/penztar/siker/
  page.tsx (created)            - Success page
  OrderConfirmation.tsx (created) - Client confirmation component

apps/web/src/app/[locale]/fiok/rendelesek/
  page.tsx (modified)           - Real order list
  [id]/page.tsx (modified)      - Real order details
```

## Testing Notes

Full checkout flow test:
1. Add item to cart
2. Go through checkout steps (shipping, billing, summary)
3. Complete payment with Stripe test card (4242 4242 4242 4242)
4. Verify redirect to /penztar/siker with session_id
5. Verify cart is empty after success
6. Verify order appears in /fiok/rendelesek
7. Verify order details match at /fiok/rendelesek/[id]

## Next Phase Readiness

Plan 06-07 complete. Ready for:
- 06-08: Phase 6 verification (full checkout flow testing)
