# Project State: CSZ Webshop

**Initialized:** 2026-01-19
**Last Session:** 2026-01-20

## Project Reference

**Core Value:** Customers can browse fire safety products with clear certification info and complete purchases reliably

**Current Focus:** Phase 4 in progress - Add-to-cart functionality implemented

## Current Position

**Phase:** 4 of 10 (Shopping Cart) - IN PROGRESS
**Plan:** 5 of 8 complete (04-01, 04-02, 04-03, 04-04, 04-06)
**Status:** In progress
**Last activity:** 2026-01-20 - Completed 04-03-PLAN.md (Add-to-Cart Functionality)

**Progress:**
```
Phase 1:  [==========] Infrastructure Foundation (5/5 plans) COMPLETE
Phase 2:  [==========] Product Catalog Backend (4/4 plans) COMPLETE
Phase 3:  [==========] Frontend Shell & Product Display (5/5 plans) COMPLETE
Phase 4:  [======    ] Shopping Cart (5/8 plans)
Phase 5:  [          ] Authentication & User Accounts
Phase 6:  [          ] Checkout & Payments
Phase 7:  [          ] Admin Order Management
Phase 8:  [          ] B2B Quote System
Phase 9:  [          ] Content & Polish
Phase 10: [          ] Migration & Launch

Overall: 3/10 phases complete (19/36 plans)
```

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Plans completed | 19 | 01-01 through 01-05, 02-01 through 02-04, 03-01 through 03-05, 04-01 through 04-04, 04-06 |
| Phases completed | 3 | Infrastructure Foundation, Product Catalog Backend, Frontend Shell |
| Requirements done | 23/78 | ADMN-26 through ADMN-28, ADMN-01 through ADMN-09, PROD-01 through PROD-08, CONT-01 through CONT-03, LANG-01, LANG-04, PERF-03, PERF-04 |
| Blockers hit | 1 | Docker daemon (resolved by user starting Docker) |
| Decisions made | 52 | See below |

## Accumulated Context

### Key Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| pnpm 9.15.0 | Disk efficiency, workspace support, reproducible builds | 2026-01-19 |
| @csz/types shared package | Cross-app TypeScript type definitions | 2026-01-19 |
| postgres:16-alpine | Smaller image size for faster pulls | 2026-01-19 |
| Named volume for postgres_data | Cleaner Docker management, portability | 2026-01-19 |
| Health check with pg_isready | Container readiness detection | 2026-01-19 |
| npm scripts for db management | Consistent developer experience | 2026-01-19 |
| Fastify 5 for API backend | High performance, excellent TypeScript support | 2026-01-19 |
| tsx for development | Fast TypeScript execution with watch mode | 2026-01-19 |
| Separate API from Strapi | Business logic isolation from CMS | 2026-01-19 |
| Strapi 5.33.3 with pg 8.8.0 | Latest Strapi with PostgreSQL driver | 2026-01-19 |
| @csz/cms workspace name | Consistent monorepo package naming | 2026-01-19 |
| Super Admin: Tamas Horvath | stickerey@gmail.com designated as Super Admin | 2026-01-20 |
| Store Manager role | Media Library/Upload only until content types exist | 2026-01-20 |
| Content Manager role | Media Library/Upload only until pages exist | 2026-01-20 |
| Remove products relation until Product exists | Strapi 5 fails on forward references to non-existent content types | 2026-01-20 |
| Remove variants relation until ProductVariant exists | Strapi 5 fails on forward references to non-existent content types | 2026-01-20 |
| ProductVariant as collection type (not component) | Independent SKU, price, inventory tracking requires separate documents | 2026-01-20 |
| 50MB upload limit for certificates | Large PDF technical documents for fire safety certifications | 2026-01-20 |
| Programmatic permission configuration | Using Strapi bootstrap lifecycle for reproducibility across environments | 2026-01-20 |
| Public read-only API pattern | find/findOne only for public role, authenticated writes for Store Manager | 2026-01-20 |
| Next.js 16.1.4 with Turbopack | Latest stable, Turbopack default, Server Components | 2026-01-20 |
| Tailwind CSS v4 CSS-first | No tailwind.config.js needed, 100x faster builds | 2026-01-20 |
| shadcn/ui New York style | Professional B2B appearance for fire safety shop | 2026-01-20 |
| next-intl Hungarian only | Hungarian market focus, minimal overhead | 2026-01-20 |
| @csz/types workspace dependency | Share types between api, cms, and web apps | 2026-01-20 |
| Sheet for mobile nav | Accessible animated slide-out drawer with focus trap | 2026-01-20 |
| Promise.allSettled for data fetching | Page renders even if one API fails | 2026-01-20 |
| Server Component home page | Data fetching at build/request time, no client states | 2026-01-20 |
| nuqs for URL state | Type-safe URL params with server re-render via shallow:false | 2026-01-20 |
| 500ms search throttle | Balance responsiveness and API call frequency | 2026-01-20 |
| Fire class specification filter | Filter products by Tuzosztaly specification value | 2026-01-20 |
| Certification name filter | Multi-select certifications with $in query | 2026-01-20 |
| Native Tailwind for rich text | Tailwind v4 incompatible with typography plugin, use descendant selectors | 2026-01-20 |
| Server Components for product display | Minimize JS bundle, data-fetching at server | 2026-01-20 |
| Locale-aware Link from navigation.ts | All internal links preserve /hu locale prefix | 2026-01-20 |
| unoptimized: true for dev images | Strapi image optimization fails in dev mode | 2026-01-20 |
| Server Components for category pages | No client state needed for category browsing | 2026-01-20 |
| Coupon as collection type | Coupons need individual tracking (usedCount), dates, and draft/publish workflow | 2026-01-20 |
| discountType enumeration | Clear distinction between percentage and fixed HUF discounts | 2026-01-20 |
| Public find permission for coupons | Coupon validation by code, no browsing needed | 2026-01-20 |
| Zustand 5.x for cart state | Minimal API, built-in persist middleware, excellent TypeScript support | 2026-01-20 |
| localStorage cart persistence | Cart survives browser sessions under 'csz-cart' key | 2026-01-20 |
| Hydration hook for SSR safety | Prevents hydration mismatches with useHydration() hook | 2026-01-20 |
| qs for Strapi query building | Same library as web app, consistent filter construction | 2026-01-20 |
| Server-side coupon validation | Frontend cannot manipulate discount amounts, all calculation on API | 2026-01-20 |
| Case-insensitive coupon codes | Using Strapi $eqi operator for user-friendly code entry | 2026-01-20 |
| Discount capped at subtotal | Prevents negative totals when fixed discount exceeds order amount | 2026-01-20 |
| Hydration-aware cart badge | Cart badge only renders after hydration to prevent SSR mismatch | 2026-01-20 |
| Uncontrolled VariantSelector mode | Support standalone use in Server Components without state props | 2026-01-20 |
| Sonner for toast notifications | shadcn/ui recommended toast library, bottom-right position for cart feedback | 2026-01-20 |
| Motion for button animations | Smooth idle/loading/success state transitions with AnimatePresence | 2026-01-20 |
| ProductActions client wrapper | Product page remains Server Component, cart interactions in client island | 2026-01-20 |

### Architecture Notes

From research:
- Frontend (Next.js) never calculates VAT, shipping, or discounts - all server-side
- Strapi for CMS, Fastify for API backend, PostgreSQL for data
- Stripe for payments with webhook-based order fulfillment
- Motion.dev for component animations, GSAP for scroll effects

### Critical Pitfalls to Avoid

1. **Strapi Schema Data Loss** - Never modify content types in production without backup
2. **Stripe Webhook Signature Failures** - Use request.text() for raw body, exclude from auth
3. **WooCommerce Migration SEO Destruction** - Complete URL inventory before migration
4. **Animation SSR Hydration Breaks** - Push 'use client' down, test production builds
5. **Hungarian VAT Complexity** - 27% VAT non-negotiable, validate EU VAT numbers

### Technical Todos

- [x] Set up PostgreSQL database (docker-compose.yml created)
- [x] Install and configure Strapi 5 (01-03)
- [x] Scaffold Fastify API backend (01-04)
- [x] Configure admin roles RBAC (01-05)
- [x] Create Specification/Certification components (02-01)
- [x] Create Category content type with hierarchy (02-01)
- [x] Create Product content type (02-02)
- [x] Add Category-Product relation (02-02)
- [x] Create ProductVariant content type (02-03)
- [x] Add Product-Variant relation (02-03)
- [x] Configure upload plugin for 50MB files (02-03)
- [x] Configure API permissions (02-04)
- [x] Next.js app setup (03-01)
- [x] Layout shell & home page (03-02)
- [x] Product listing page with filters (03-03)
- [x] Product detail page with SEO (03-04)
- [x] Category listing and detail pages (03-05)
- [x] Full frontend verification (03-05)
- [x] Coupon content type in Strapi (04-01)
- [x] Coupon TypeScript interface in @csz/types (04-01)
- [x] Coupon API permissions (04-01)
- [x] Zustand cart store with localStorage persistence (04-02)
- [x] Cart types (CartItem, AppliedCoupon) in @csz/types (04-02)
- [x] Hydration hook for SSR safety (04-02)
- [x] Coupon validation API endpoint (04-06)
- [x] Cart UI foundation components (04-04)
- [x] Sonner toast notifications (04-03)
- [x] AddToCartButton with animated states (04-03)
- [x] ProductActions component for product page (04-03)

### Blockers

- **Docker Desktop must be running** - Required before Strapi can connect to PostgreSQL

## Session Continuity

### Last Session Summary

- Completed Plan 04-03: Add-to-Cart Functionality
- Added Sonner toast component with custom success/error styles
- Created AddToCartButton with idle/loading/success animation states
- Created ProductActions wrapper for product page cart integration
- Integrated add-to-cart into product detail page

### Next Actions

1. Continue Phase 4: Shopping Cart
2. Execute remaining Wave 2 plans (04-05, 04-07, 04-08)
3. Build CartSheet/CartDrawer with header integration (04-05)
4. Create dedicated cart page (04-05 or 04-07)

### Open Questions

From research that need resolution:
1. WooCommerce data format - need to export and analyze actual CSV
2. Hungarian invoice requirements - accountant consultation needed
3. Existing URL structure - need crawl of current site
4. Inventory source of truth - Strapi-managed or external sync?

---
*State initialized: 2026-01-19*
*Last updated: 2026-01-20*
*Phase 1 completed: 2026-01-20*
*Phase 2 completed: 2026-01-20*
*Phase 3 completed: 2026-01-20*
*Phase 4 plan 04-01 completed: 2026-01-20*
*Phase 4 plan 04-02 completed: 2026-01-20*
*Phase 4 plan 04-03 completed: 2026-01-20*
*Phase 4 plan 04-04 completed: 2026-01-20*
*Phase 4 plan 04-06 completed: 2026-01-20*
