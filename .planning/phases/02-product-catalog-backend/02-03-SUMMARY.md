---
phase: 02-product-catalog-backend
plan: 03
subsystem: database
tags: [strapi, product-variant, content-type, ecommerce, upload, media]

# Dependency graph
requires:
  - phase: 02-product-catalog-backend
    plan: 02
    provides: Product collection type
provides:
  - ProductVariant collection type with independent SKU, price, stock
  - Bidirectional Product-Variant oneToMany/manyToOne relation
  - Upload plugin configured for 50MB PDF certificates
affects: [02-04-api-permissions, 03-frontend-product-display]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Separate collection type for variants (not component) for independent inventory"
    - "Bidirectional relations for Product<->ProductVariant"
    - "Upload plugin configuration for large PDF certificates"

key-files:
  created:
    - apps/cms/src/api/product-variant/content-types/product-variant/schema.json
    - apps/cms/src/api/product-variant/controllers/product-variant.ts
    - apps/cms/src/api/product-variant/services/product-variant.ts
    - apps/cms/src/api/product-variant/routes/product-variant.ts
  modified:
    - apps/cms/src/api/product/content-types/product/schema.json
    - apps/cms/config/plugins.ts

key-decisions:
  - "ProductVariant as collection type (not component) for independent inventory tracking"
  - "50MB upload limit for large PDF technical certificates"

patterns-established:
  - "Bidirectional relations between collection types in Strapi 5"
  - "Upload plugin configuration with responsive image breakpoints"

# Metrics
duration: 2min
completed: 2026-01-20
---

# Phase 2 Plan 03: ProductVariant Content Type Summary

**ProductVariant collection type with independent SKU/price/stock, bidirectional Product relation, and 50MB upload limit for PDF certificates**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-20T08:38:07Z
- **Completed:** 2026-01-20T08:40:20Z
- **Tasks:** 3
- **Files created:** 4
- **Files modified:** 2

## Accomplishments

- ProductVariant collection type with name, sku, price, stock, weight fields
- Attribute fields (attributeLabel, attributeValue) for describing variants (e.g., "Size: 6kg")
- Single image media field per variant
- manyToOne relation to Product with bidirectional linking
- Added variants oneToMany relation to Product schema (completing bidirectional setup)
- Upload plugin configured with 50MB limit for PDF certificates
- Responsive image breakpoints configured (xlarge, large, medium, small, xsmall)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ProductVariant collection type** - `662d42a` (feat)
2. **Task 2: Configure upload plugin for larger files** - `490f3cf` (feat)
3. **Task 3: Restart Strapi and verify** - No commit needed (verification only)

## Files Created/Modified

- `apps/cms/src/api/product-variant/content-types/product-variant/schema.json` - ProductVariant schema with all fields and Product relation
- `apps/cms/src/api/product-variant/controllers/product-variant.ts` - Standard Strapi controller
- `apps/cms/src/api/product-variant/services/product-variant.ts` - Standard Strapi service
- `apps/cms/src/api/product-variant/routes/product-variant.ts` - Standard Strapi routes
- `apps/cms/src/api/product/content-types/product/schema.json` - Added variants oneToMany relation
- `apps/cms/config/plugins.ts` - Upload plugin with 50MB limit and breakpoints

## Requirements Coverage

| Requirement | Field(s) | Status |
|-------------|----------|--------|
| ADMN-03 | ProductVariant content type | Implemented |
| - Variant name | name | Implemented |
| - Independent SKU | sku (unique, required) | Implemented |
| - Variant price | price (integer, HUF) | Implemented |
| - Variant stock | stock (integer, default 0) | Implemented |
| - Attribute description | attributeLabel, attributeValue | Implemented |
| - Variant image | image (media, single) | Implemented |
| - Parent product link | product (manyToOne relation) | Implemented |

## Decisions Made

- **ProductVariant as collection type:** Using a separate collection type (not a repeatable component) because variants need independent document IDs, SKUs, and inventory tracking. Components would not support these requirements.
- **50MB upload limit:** Fire safety PDF certificates can be large technical documents. Default Strapi limit may be insufficient.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - Strapi started successfully with both Product and ProductVariant content types. Bidirectional relation works correctly (verified via generated types).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- ProductVariant content type ready for data entry
- Product now has variants relation (both directions working)
- API endpoints return 403 (expected - permissions configured in Plan 02-04)
- ADMN-03 (Admin can create product variants) is now satisfiable in Strapi admin
- Ready for Plan 02-04: API Permissions configuration

---
*Phase: 02-product-catalog-backend*
*Plan: 03*
*Completed: 2026-01-20*
