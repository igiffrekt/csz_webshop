---
phase: 06-checkout-payments
plan: 03
subsystem: checkout
tags: [zustand, vat, shipping, fastify, localStorage]

# Dependency graph
requires:
  - phase: 04-shopping-cart
    provides: Cart store pattern with Zustand persist
  - phase: 06-01
    provides: Order content type and TypeScript interfaces
provides:
  - Checkout Zustand store with multi-step persistence
  - Hungarian VAT calculation library (27%)
  - Shipping cost calculation with free threshold
  - Server-side order totals calculation endpoint
affects: [06-04, 06-05, 06-06, checkout-ui, order-creation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server-side calculation pattern (never trust client prices)
    - Hungarian VAT extraction from gross prices
    - Weight-based shipping with free threshold

key-files:
  created:
    - apps/web/src/stores/checkout.ts
    - apps/api/src/lib/vat.ts
    - apps/api/src/lib/shipping.ts
    - apps/api/src/routes/checkout/calculate.ts
  modified:
    - apps/api/src/index.ts

key-decisions:
  - "Server-side price calculation: Fetch prices from Strapi, never trust client-submitted prices"
  - "VAT from gross: Hungarian prices include VAT, extract breakdown using 27% rate"
  - "Shipping thresholds: 1,990 Ft base, free over 50,000 Ft, +500 Ft/kg over 5kg"
  - "Hungary-only shipping: Accept multiple spellings (Magyarorszag, Hungary, HU)"
  - "Don't persist calculated totals: Always fetch fresh from server to prevent stale data"

patterns-established:
  - "Checkout state pattern: Multi-step wizard with localStorage persistence"
  - "Calculation API pattern: POST with lineItems, returns complete price breakdown"
  - "VAT calculation: Use integer math (Math.round) to avoid floating point issues with HUF"

# Metrics
duration: 5min
completed: 2026-01-21
---

# Phase 6 Plan 3: Checkout State & Calculations Summary

**Zustand checkout store with multi-step persistence and Fastify endpoint for server-side VAT/shipping/totals calculation**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-21T07:34:19Z
- **Completed:** 2026-01-21T07:39:06Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Multi-step checkout state management with localStorage persistence under 'csz-checkout'
- Hungarian VAT calculation library extracting 27% VAT from gross prices
- Shipping cost calculation with free shipping over 50,000 Ft and weight surcharge
- POST /checkout/calculate endpoint with server-side price verification and coupon validation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create checkout Zustand store** - `6d92313` (feat)
2. **Task 2: Create VAT and shipping calculation libraries** - `e7ef62e` (feat)
3. **Task 3: Create calculate totals API endpoint** - `0aebf09` (feat)

## Files Created/Modified

- `apps/web/src/stores/checkout.ts` - Multi-step checkout state with Zustand persist
- `apps/api/src/lib/vat.ts` - Hungarian 27% VAT calculation utilities
- `apps/api/src/lib/shipping.ts` - Shipping cost with free threshold and weight surcharge
- `apps/api/src/routes/checkout/calculate.ts` - Order totals calculation endpoint
- `apps/api/src/index.ts` - Register calculate routes (modified in 06-02)

## Decisions Made

- **Server-side price calculation:** Prices fetched from Strapi database, never trust client-submitted amounts to prevent price manipulation
- **VAT extraction from gross:** Hungarian retail displays gross (VAT-included) prices, utilities extract net price and VAT amount
- **Integer math for currency:** Using Math.round to avoid floating point errors with HUF amounts
- **Don't persist calculated totals:** calculatedTotals excluded from localStorage partialize to force fresh server fetch
- **Hungary-only validation:** Accept various spellings (Magyarorszag, Hungary, HU) for user convenience

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - API was already running on port 4000 from previous session, but code compiled and verified correctly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Checkout state management ready for checkout UI pages (06-04)
- Calculate endpoint ready for checkout summary display
- VAT/shipping logic ready for order creation (06-05)
- All builds pass (web and api)

---
*Phase: 06-checkout-payments*
*Completed: 2026-01-21*
