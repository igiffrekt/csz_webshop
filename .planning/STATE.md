# Project State: CSZ Webshop

**Initialized:** 2026-01-19
**Last Session:** 2026-01-19

## Project Reference

**Core Value:** Customers can browse fire safety products with clear certification info and complete purchases reliably

**Current Focus:** Executing Phase 1 infrastructure plans

## Current Position

**Phase:** 1 of 10 (Infrastructure Foundation)
**Plan:** 4 of 5 complete (01-01, 01-02, 01-03, 01-04)
**Status:** In progress
**Last activity:** 2026-01-19 - Completed 01-04-PLAN.md (Fastify API Backend)

**Progress:**
```
Phase 1:  [========  ] Infrastructure Foundation (4/5 plans)
Phase 2:  [          ] Product Catalog Backend
Phase 3:  [          ] Frontend Shell & Product Display
Phase 4:  [          ] Shopping Cart
Phase 5:  [          ] Authentication & User Accounts
Phase 6:  [          ] Checkout & Payments
Phase 7:  [          ] Admin Order Management
Phase 8:  [          ] B2B Quote System
Phase 9:  [          ] Content & Polish
Phase 10: [          ] Migration & Launch

Overall: 0/10 phases complete (Phase 1 in progress)
```

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Plans completed | 4 | 01-01, 01-02, 01-03, 01-04 |
| Requirements done | 0/78 | Infrastructure only so far |
| Blockers hit | 1 | Docker daemon (resolved by user starting Docker) |
| Decisions made | 11 | See below |

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
- [ ] Set up Next.js 16 frontend (01-05)

### Blockers

- **Docker Desktop must be running** - Required before Strapi can connect to PostgreSQL

## Session Continuity

### Last Session Summary

- Executed 01-03-PLAN.md (Strapi CMS Setup)
- Created Strapi 5.33.3 CMS at apps/cms
- PostgreSQL connection verified (csz_strapi database)
- Admin panel accessible at http://localhost:1337/admin
- Workspace scripts (dev:cms, build:cms) working

### Next Actions

1. Execute 01-05-PLAN.md (Next.js Frontend Setup)
2. Verify all Phase 1 infrastructure components can run together

### Open Questions

From research that need resolution:
1. WooCommerce data format - need to export and analyze actual CSV
2. Hungarian invoice requirements - accountant consultation needed
3. Existing URL structure - need crawl of current site
4. Inventory source of truth - Strapi-managed or external sync?

---
*State initialized: 2026-01-19*
*Last updated: 2026-01-19 21:56 UTC*
