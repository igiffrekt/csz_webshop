# Project State: CSZ Webshop

**Initialized:** 2026-01-19
**Last Session:** 2026-01-19

## Project Reference

**Core Value:** Customers can browse fire safety products with clear certification info and complete purchases reliably

**Current Focus:** Executing Phase 1 infrastructure plans

## Current Position

**Phase:** 1 of 10 (Infrastructure Foundation)
**Plan:** 2 of 5 complete
**Status:** In progress
**Last activity:** 2026-01-19 - Completed 01-02-PLAN.md (PostgreSQL Docker Setup)

**Progress:**
```
Phase 1:  [==        ] Infrastructure Foundation (2/5 plans)
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
| Plans completed | 2 | 01-01, 01-02 |
| Requirements done | 0/78 | Infrastructure only so far |
| Blockers hit | 1 | Docker daemon (resolved by user starting Docker) |
| Decisions made | 4 | See below |

## Accumulated Context

### Key Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| postgres:16-alpine | Smaller image size for faster pulls | 2026-01-19 |
| Named volume for postgres_data | Cleaner Docker management, portability | 2026-01-19 |
| Health check with pg_isready | Container readiness detection | 2026-01-19 |
| npm scripts for db management | Consistent developer experience | 2026-01-19 |

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
- [ ] Install and configure Strapi 5
- [ ] Scaffold Fastify API backend
- [ ] Set up Next.js 16 frontend

### Blockers

- **Docker Desktop must be running** - Required before Strapi can connect to PostgreSQL

## Session Continuity

### Last Session Summary

- Executed 01-02-PLAN.md (PostgreSQL Docker Setup)
- Created docker/docker-compose.yml with PostgreSQL 16 config
- Added db:start, db:stop, db:logs, db:reset scripts to package.json
- Docker daemon was not running (acceptable per plan)

### Next Actions

1. Start Docker Desktop
2. Run `pnpm db:start` to verify PostgreSQL starts
3. Execute 01-03-PLAN.md (Strapi CMS Installation)

### Open Questions

From research that need resolution:
1. WooCommerce data format - need to export and analyze actual CSV
2. Hungarian invoice requirements - accountant consultation needed
3. Existing URL structure - need crawl of current site
4. Inventory source of truth - Strapi-managed or external sync?

---
*State initialized: 2026-01-19*
*Last updated: 2026-01-19*
