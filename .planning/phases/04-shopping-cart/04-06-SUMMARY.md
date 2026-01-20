---
phase: 04-shopping-cart
plan: 06
subsystem: api
tags: [fastify, qs, coupon, validation, strapi]

# Dependency graph
requires:
  - phase: 04-01
    provides: Coupon content type in Strapi with all discount fields
provides:
  - POST /cart/apply-coupon endpoint for server-side coupon validation
  - Discount calculation logic for percentage and fixed coupon types
  - Hungarian error messages for all validation failures
affects: [04-07, checkout-flow, order-processing]

# Tech tracking
tech-stack:
  added: [qs@6.14.1, @types/qs]
  patterns: [server-side coupon validation, Strapi query building with qs]

key-files:
  created:
    - apps/api/src/routes/cart/coupon.ts
  modified:
    - apps/api/src/index.ts
    - apps/api/package.json

key-decisions:
  - "Server-side only coupon validation - frontend cannot manipulate discount amounts"
  - "Case-insensitive coupon code matching with $eqi operator"
  - "Hungarian error messages for all validation states"
  - "Maximum discount cap applied for percentage coupons"
  - "Discount capped at subtotal to prevent negative totals"

patterns-established:
  - "Fastify route files in routes/{domain}/{feature}.ts structure"
  - "Strapi query building with qs.stringify for filter construction"
  - "Route registration via fastify.register() in index.ts"

# Metrics
duration: 6min
completed: 2026-01-20
---

# Phase 4 Plan 6: Coupon Validation API Summary

**Fastify POST /cart/apply-coupon endpoint validating coupons server-side against Strapi with full business logic**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-20T12:00:00Z
- **Completed:** 2026-01-20T12:06:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- Installed qs package for building Strapi query strings
- Created comprehensive coupon validation endpoint with all business rules
- Registered route in Fastify app with proper ESM imports
- All validation scenarios return Hungarian error messages

## Task Commits

Each task was committed atomically:

1. **Task 1: Install qs for query string building** - `1234be8` (chore)
2. **Task 2: Create coupon validation route** - `077edcb` (feat)
3. **Task 3: Register coupon route in main app** - `6702fad` (feat)

## Files Created/Modified
- `apps/api/src/routes/cart/coupon.ts` - POST /cart/apply-coupon endpoint (162 lines)
- `apps/api/src/index.ts` - Route registration with couponRoutes import
- `apps/api/package.json` - Added qs and @types/qs dependencies

## Decisions Made
- **qs library** - Same query building approach as web app for Strapi filter construction
- **Case-insensitive matching** - Using Strapi's $eqi operator for coupon code lookup
- **Discount cap logic** - Maximum discount applies to percentage coupons, subtotal cap prevents negative totals
- **ESM import with .js extension** - TypeScript compiles to JS, imports need .js for ESM compatibility

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None - API server started correctly and endpoint responds as expected.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Coupon validation API ready for frontend integration
- Cart drawer (04-07) can now call POST /cart/apply-coupon to validate coupons
- Strapi must be running with published coupons for full functionality

---
*Phase: 04-shopping-cart*
*Completed: 2026-01-20*
