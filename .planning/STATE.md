# Project State: CSZ Webshop

**Initialized:** 2026-01-19
**Last Session:** 2026-01-20

## Project Reference

**Core Value:** Customers can browse fire safety products with clear certification info and complete purchases reliably

**Current Focus:** Phase 5 in progress - Middleware and auth-aware header complete, proceed to account management pages

## Current Position

**Phase:** 5 of 10 (Authentication & User Accounts)
**Plan:** 4 of 5 complete (05-04)
**Status:** In progress
**Last activity:** 2026-01-20 - Completed 05-04-PLAN.md (Middleware & Auth-Aware Header)

**Progress:**
```
Phase 1:  [==========] Infrastructure Foundation (5/5 plans) COMPLETE
Phase 2:  [==========] Product Catalog Backend (4/4 plans) COMPLETE
Phase 3:  [==========] Frontend Shell & Product Display (5/5 plans) COMPLETE
Phase 4:  [==========] Shopping Cart (8/8 plans) COMPLETE
Phase 5:  [========  ] Authentication & User Accounts (4/5 plans)
Phase 6:  [          ] Checkout & Payments
Phase 7:  [          ] Admin Order Management
Phase 8:  [          ] B2B Quote System
Phase 9:  [          ] Content & Polish
Phase 10: [          ] Migration & Launch

Overall: 4/10 phases complete (26/36 plans)
```

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Plans completed | 26 | 01-01 through 01-05, 02-01 through 02-04, 03-01 through 03-05, 04-01 through 04-08, 05-01 through 05-04 |
| Phases completed | 4 | Infrastructure, Product Catalog, Frontend Shell, Shopping Cart |
| Requirements done | 36/78 | +CART-01 through CART-07, ADMN-15 through ADMN-19, ANIM-05 |
| Blockers hit | 1 | Docker daemon (resolved by user starting Docker) |
| Decisions made | 74 | See below |

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
| Hydration-aware CartSheet | Loading state prevents SSR mismatch with localStorage cart | 2026-01-20 |
| HeaderCart client island | Header stays Server Component, only cart interaction is client-side | 2026-01-20 |
| Inline error for coupon validation | Error below input clearer than toast for validation messages | 2026-01-20 |
| Uppercase coupon codes | Auto-convert input to uppercase for consistent code handling | 2026-01-20 |
| Green badge for applied coupon | Visual confirmation with code, discount, and remove button | 2026-01-20 |
| Cart API client pattern | Centralized fetch functions for cart-related API calls | 2026-01-20 |
| User extension pattern | Schema extension via extensions/users-permissions directory | 2026-01-20 |
| Shipping address collection | Separate collection type with user relation for multiple addresses | 2026-01-20 |
| JWT expiry 7 days | Balance security and UX for e-commerce | 2026-01-20 |
| Mailtrap dev emails | Default SMTP uses Mailtrap sandbox for safe testing | 2026-01-20 |
| Auth rate limiting | 5 requests per 5 minutes on auth endpoints | 2026-01-20 |
| jose session encryption | Lightweight JWT library for session management | 2026-01-20 |
| httpOnly cookie session | XSS protection with sameSite:lax CSRF prevention | 2026-01-20 |
| Strapi JWT wrapping | Control session expiry independent of Strapi | 2026-01-20 |
| React cache() DAL | Deduplicate session verification within same request | 2026-01-20 |
| Hungarian error messages | All zod validation in Hungarian for localized UX | 2026-01-20 |
| Email enumeration protection | forgotPassword always returns success | 2026-01-20 |
| useActionState pattern | React 19 form state with Server Actions for auth forms | 2026-01-20 |
| Checkbox B2B toggle | Company fields revealed only when checkbox checked | 2026-01-20 |
| Success state display | Forgot password shows success message not redirect | 2026-01-20 |
| Code from searchParams | Reset password code passed via URL query param | 2026-01-20 |
| Edge-compatible session module | Separate session-edge.ts for middleware runtime | 2026-01-20 |
| Middleware route protection | Protect /fiok and /penztar at middleware level | 2026-01-20 |
| Redirect URL preservation | Save original URL in query param for post-login redirect | 2026-01-20 |
| Async Server Component Header | Use getTranslations and verifySession directly | 2026-01-20 |

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
- [x] CartSheet slide-out panel (04-05)
- [x] HeaderCart integration (04-05)
- [x] Cart API client (04-07)
- [x] CouponInput component (04-07)
- [x] CouponInput integration in CartSheet (04-07)
- [x] Extended user model with B2B fields (05-01)
- [x] ShippingAddress content type (05-01)
- [x] Email provider configuration (05-01)
- [x] User/ShippingAddress TypeScript interfaces (05-01)
- [x] Session management with jose (05-02)
- [x] Data Access Layer with React cache() (05-02)
- [x] Server Actions for login/register/logout (05-02)
- [x] Password reset Server Actions (05-02)
- [x] Login page at /auth/bejelentkezes (05-03)
- [x] Registration page at /auth/regisztracio with B2B fields (05-03)
- [x] Forgot password page at /auth/elfelejtett-jelszo (05-03)
- [x] Reset password page at /auth/jelszo-visszaallitas (05-03)
- [x] Next.js middleware for route protection (05-04)
- [x] Edge-compatible session decryption (05-04)
- [x] UserMenu dropdown component (05-04)
- [x] Auth-aware Header component (05-04)

### Blockers

- **Docker Desktop must be running** - Required before Strapi can connect to PostgreSQL

## Session Continuity

### Last Session Summary

- Continued Phase 5: Authentication & User Accounts
- Completed 05-04: Middleware & Auth-Aware Header
- Created Edge-compatible session-edge.ts for middleware
- Created middleware with route protection for /fiok and /penztar
- Created UserMenu dropdown component with logout action
- Updated Header to show login button or UserMenu based on auth state

### Next Actions

1. Continue Phase 5 with 05-05: Account Management Pages
2. Create /fiok account dashboard page
3. Create /fiok/rendelesek orders page
4. Create /fiok/cimek shipping addresses management

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
*Phase 4 plan 04-05 completed: 2026-01-20*
*Phase 4 plan 04-06 completed: 2026-01-20*
*Phase 4 plan 04-07 completed: 2026-01-20*
*Phase 4 plan 04-08 completed: 2026-01-20*
*Phase 4 completed: 2026-01-20*
*Phase 5 plan 05-01 completed: 2026-01-20*
*Phase 5 plan 05-02 completed: 2026-01-20*
*Phase 5 plan 05-03 completed: 2026-01-20*
*Phase 5 plan 05-04 completed: 2026-01-20*
