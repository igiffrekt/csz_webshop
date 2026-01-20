# Project State: CSZ Webshop

**Initialized:** 2026-01-19
**Last Session:** 2026-01-20

## Project Reference

**Core Value:** Customers can browse fire safety products with clear certification info and complete purchases reliably

**Current Focus:** Phase 1 complete - ready for Phase 2

## Current Position

**Phase:** 1 of 10 (Infrastructure Foundation) - COMPLETE
**Plan:** 5 of 5 complete (01-01, 01-02, 01-03, 01-04, 01-05)
**Status:** Phase complete
**Last activity:** 2026-01-20 - Completed 01-05-PLAN.md (Strapi Admin Roles)

**Progress:**
```
Phase 1:  [==========] Infrastructure Foundation (5/5 plans) COMPLETE
Phase 2:  [          ] Product Catalog Backend
Phase 3:  [          ] Frontend Shell & Product Display
Phase 4:  [          ] Shopping Cart
Phase 5:  [          ] Authentication & User Accounts
Phase 6:  [          ] Checkout & Payments
Phase 7:  [          ] Admin Order Management
Phase 8:  [          ] B2B Quote System
Phase 9:  [          ] Content & Polish
Phase 10: [          ] Migration & Launch

Overall: 1/10 phases complete
```

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Plans completed | 5 | 01-01, 01-02, 01-03, 01-04, 01-05 |
| Phases completed | 1 | Infrastructure Foundation |
| Requirements done | 3/78 | ADMN-26, ADMN-27, ADMN-28 (admin roles) |
| Blockers hit | 1 | Docker daemon (resolved by user starting Docker) |
| Decisions made | 14 | See below |

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

### Blockers

- **Docker Desktop must be running** - Required before Strapi can connect to PostgreSQL

## Session Continuity

### Last Session Summary

- Completed Phase 1: Infrastructure Foundation (all 5 plans)
- Final plan 01-05: Configured Strapi admin roles via UI
- Super Admin: Tamas Horvath (stickerey@gmail.com)
- Store Manager and Content Manager roles created
- All RBAC requirements satisfied (ADMN-26, ADMN-27, ADMN-28)

### Next Actions

1. Begin Phase 2: Product Catalog Backend
2. Create Product, Category content types in Strapi
3. Update Store Manager role with product permissions

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
