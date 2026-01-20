# Project State: CSZ Webshop

**Initialized:** 2026-01-19
**Last Session:** 2026-01-20

## Project Reference

**Core Value:** Customers can browse fire safety products with clear certification info and complete purchases reliably

**Current Focus:** Phase 2 in progress - Product Catalog Backend

## Current Position

**Phase:** 2 of 10 (Product Catalog Backend) - IN PROGRESS
**Plan:** 1 of 4 complete (02-01)
**Status:** In progress
**Last activity:** 2026-01-20 - Completed 02-01-PLAN.md (Product Catalog Foundation)

**Progress:**
```
Phase 1:  [==========] Infrastructure Foundation (5/5 plans) COMPLETE
Phase 2:  [==        ] Product Catalog Backend (1/4 plans)
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
| Plans completed | 6 | 01-01 through 01-05, 02-01 |
| Phases completed | 1 | Infrastructure Foundation |
| Requirements done | 3/78 | ADMN-26, ADMN-27, ADMN-28 (admin roles) |
| Blockers hit | 1 | Docker daemon (resolved by user starting Docker) |
| Decisions made | 15 | See below |

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
- [ ] Create Product content type (02-02)
- [ ] Add Category-Product relation (02-02)

### Blockers

- **Docker Desktop must be running** - Required before Strapi can connect to PostgreSQL

## Session Continuity

### Last Session Summary

- Completed Plan 02-01: Product Catalog Foundation
- Created Specification component (key/value/unit)
- Created Certification component (name/standard/validUntil/certificate)
- Created Category content type with parent/children hierarchy
- Fixed blocking issue: removed products relation until Product exists

### Next Actions

1. Continue Phase 2: Execute 02-02-PLAN.md (Product content type)
2. Add bidirectional Category-Product relation
3. Create ProductVariant content type

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
*Plan 02-01 completed: 2026-01-20*
