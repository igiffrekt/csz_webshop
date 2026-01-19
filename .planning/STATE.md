# Project State: CSZ Webshop

**Initialized:** 2026-01-19
**Last Session:** 2026-01-19

## Project Reference

**Core Value:** Customers can browse fire safety products with clear certification info and complete purchases reliably

**Current Focus:** Roadmap created, ready to begin Phase 1 planning

## Current Position

**Phase:** 1 - Infrastructure Foundation
**Plan:** Not yet created
**Status:** Awaiting phase planning

**Progress:**
```
Phase 1:  [ ] Infrastructure Foundation
Phase 2:  [ ] Product Catalog Backend
Phase 3:  [ ] Frontend Shell & Product Display
Phase 4:  [ ] Shopping Cart
Phase 5:  [ ] Authentication & User Accounts
Phase 6:  [ ] Checkout & Payments
Phase 7:  [ ] Admin Order Management
Phase 8:  [ ] B2B Quote System
Phase 9:  [ ] Content & Polish
Phase 10: [ ] Migration & Launch

Overall: 0/10 phases complete
```

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Plans completed | 0 | - |
| Requirements done | 0/78 | - |
| Blockers hit | 0 | - |
| Decisions made | 0 | - |

## Accumulated Context

### Key Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| (None yet) | | |

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

- [ ] Set up PostgreSQL database
- [ ] Install and configure Strapi 5
- [ ] Scaffold Fastify API backend
- [ ] Set up Next.js 16 frontend

### Blockers

(None currently)

## Session Continuity

### Last Session Summary

- Created ROADMAP.md with 10 phases
- Mapped all 78 v1 requirements to phases
- Initialized STATE.md (this file)
- Ready for Phase 1 planning

### Next Actions

1. Run `/gsd:plan-phase 1` to create detailed plan for Infrastructure Foundation
2. Execute Phase 1 plans to set up Strapi, Fastify, and role-based access

### Open Questions

From research that need resolution:
1. WooCommerce data format - need to export and analyze actual CSV
2. Hungarian invoice requirements - accountant consultation needed
3. Existing URL structure - need crawl of current site
4. Inventory source of truth - Strapi-managed or external sync?

---
*State initialized: 2026-01-19*
*Last updated: 2026-01-19*
