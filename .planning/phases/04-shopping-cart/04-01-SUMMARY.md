---
phase: 04-shopping-cart
plan: 01
subsystem: cms
tags: [strapi, coupon, discount, typescript]

dependency-graph:
  requires:
    - 02-04 (API Permissions)
  provides:
    - Coupon content type for discount management
    - Coupon TypeScript interface
    - Public and Store Manager coupon permissions
  affects:
    - 04-03 (Coupon Application UI)
    - 04-04 (Cart Server Actions - coupon validation)

tech-stack:
  added: []
  patterns:
    - Strapi content type with enumeration (discountType)
    - Bootstrap permission configuration pattern

key-files:
  created:
    - apps/cms/src/api/coupon/content-types/coupon/schema.json
    - apps/cms/src/api/coupon/controllers/coupon.ts
    - apps/cms/src/api/coupon/routes/coupon.ts
    - apps/cms/src/api/coupon/services/coupon.ts
  modified:
    - packages/types/src/index.ts
    - apps/cms/src/index.ts

decisions:
  - name: "Coupon as collection type"
    rationale: "Coupons need individual tracking (usedCount), dates, and draft/publish workflow"
  - name: "discountType enumeration"
    rationale: "Clear distinction between percentage and fixed HUF discounts"
  - name: "Public find permission only"
    rationale: "Coupon validation by code, no browsing needed"

metrics:
  duration: "8 minutes"
  completed: "2026-01-20"
---

# Phase 04 Plan 01: Coupon Content Type Summary

Created Strapi Coupon content type with full discount management capabilities including percentage/fixed discounts, usage limits, and expiration dates.

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| 5999572 | feat | Coupon schema created (in prior 04-02 execution) |
| 32b3e23 | feat | Add Coupon TypeScript interface to shared types |
| 778cc29 | feat | Configure Coupon API permissions |

## Tasks Completed

### Task 1: Create Coupon content type in Strapi
**Status:** Already complete from prior execution

Coupon schema fields:
- `code`: string, required, unique, maxLength 50
- `description`: text, optional (admin notes)
- `discountType`: enumeration ['percentage', 'fixed'], required, default 'percentage'
- `discountValue`: integer, required, min 0
- `minimumOrderAmount`: integer, default 0, min 0
- `maximumDiscount`: integer, min 0, optional
- `usageLimit`: integer, min 0, optional
- `usedCount`: integer, default 0, min 0
- `validFrom`: datetime, optional
- `validUntil`: datetime, optional
- `isActive`: boolean, default true

### Task 2: Add Coupon TypeScript interface to shared types
**Status:** Complete

Added full `Coupon` interface to `packages/types/src/index.ts` matching Strapi schema.

Files modified:
- `packages/types/src/index.ts` - Added Coupon interface

### Task 3: Configure public read access for Coupon API
**Status:** Complete

Added coupon permissions to bootstrap configuration:
- Public role: `api::coupon.coupon.find` - enables coupon validation by code
- Store Manager: Full CRUD+publish on `api::coupon.coupon`

Files modified:
- `apps/cms/src/index.ts` - Added coupon to permission arrays

## Verification Results

1. Strapi CMS builds successfully with Coupon content type
2. TypeScript compilation passes with new Coupon interface
3. API endpoint returns correct response:
   ```json
   {"data":[],"meta":{"pagination":{"page":1,"pageSize":25,"pageCount":0,"total":0}}}
   ```

## Deviations from Plan

### Prior Execution
**Task 1 files were already committed in a prior execution (commit 5999572)**

The Coupon content type files existed in the repository from a previous plan execution. This execution completed Tasks 2 and 3 only.

## Success Criteria Verification

- [x] Coupon content type exists with all required fields
- [x] Admin can create coupon with percentage or fixed discount (discountType enum)
- [x] Admin can set usage limit and expiration date (usageLimit, validFrom, validUntil)
- [x] Admin can enable/disable coupon via isActive toggle
- [x] TypeScript Coupon interface available in @csz/types
- [x] API endpoint returns coupon data (verified via curl)

## Next Phase Readiness

**Ready to proceed to 04-02 (Cart Store & Persistence)**

Dependencies satisfied:
- Coupon content type exists for validation
- Coupon interface available for TypeScript type safety
- API permissions configured for frontend access

No blockers identified.
