# Research Summary

**Project:** CSZ Webshop - Hungarian Fire Safety Equipment Ecommerce
**Domain:** B2B/B2C Headless Ecommerce
**Researched:** 2026-01-19
**Confidence:** HIGH

## Executive Summary

This project is a headless ecommerce platform for fire safety equipment targeting the Hungarian market, replacing an existing WooCommerce store. The recommended approach follows the established MACH architecture (Microservices, API-first, Cloud-native, Headless): **Next.js 16 frontend** for presentation, **Node.js/Fastify API backend** for all business logic, **Strapi 5 CMS** for content management, and **Stripe** for payments. The critical architectural decision is that the frontend never calculates business-critical values (VAT, shipping, discounts) - all pricing happens server-side.

The Hungarian market introduces specific requirements: 27% VAT compliance, HUF currency, and support for cash-on-delivery (the #1 payment method in Hungary, unlike Western markets where cards dominate). B2B features like quote requests and volume pricing are differentiators, while the fire safety niche demands prominent certification displays (EN standards, CE marks) that general ecommerce platforms often neglect.

Key risks center on three areas: **Strapi schema changes** can cause catastrophic data loss if not handled through proper staging environments; **Stripe webhook failures** silently break order fulfillment and are notoriously difficult to debug; **WooCommerce migration** can destroy SEO rankings and customer history if URLs and data mappings are not meticulously planned. Mitigation requires automated backups before every deployment, webhook signature verification with idempotency keys, and a complete URL inventory before migration begins.

## Recommended Stack

Key technology choices (one line each):

- **Next.js 16.1** (App Router): Server Components for SEO, ISR for product page performance
- **Tailwind CSS v4** + **shadcn/ui**: 5x faster builds with Oxide engine, accessible components
- **Motion + GSAP**: Component animations (Motion) and scroll-driven effects (GSAP), both free
- **Fastify 5**: 2-3x faster than Express, TypeScript-first backend framework
- **Drizzle ORM**: Lightweight (~7KB) vs Prisma's engine, edge-compatible
- **Strapi 5**: Headless CMS with full TypeScript, i18n plugin for Hungarian content
- **Stripe**: Payment processing with Tax for EU VAT compliance
- **PostgreSQL 16**: Structured ecommerce data, JSONB for product attributes
- **TanStack Query + Zustand + nuqs**: Server state, client state, URL state separation

## Table Stakes Features

What must be in v1:

**Core Commerce:**
- Product catalog with search, filters by fire class/certification
- Shopping cart with variants (sizes, capacities)
- Secure checkout with progress indicator
- User accounts (required by spec for B2B features)
- Order history and confirmation emails

**Hungarian Market:**
- Hungarian language (native, not translated)
- HUF pricing with 27% VAT displayed
- Cash on delivery option (most popular in Hungary)
- Card payments via Stripe
- Hungarian-compliant invoice generation

**Fire Safety Niche:**
- Certification badges (CE, EN3, EN1866) on product pages
- Fire class compatibility matrix (A/B/C/D/K)
- Technical specification tables (not PDFs)
- Downloadable certificates and data sheets

**B2B Differentiators:**
- Quote request system for bulk orders
- Volume/tiered pricing display
- Company account profiles with VAT numbers
- Purchase order reference field

## Architecture Overview

How components connect (brief):

```
Browser/Server (Next.js) --HTTP--> API Backend (Fastify) --REST--> Strapi CMS
                                           |
                                           +--> Stripe API (payments)
                                           +--> PostgreSQL (sessions, orders)
```

**Critical rule:** Frontend displays prices calculated by API. Never trust client-submitted totals. Stripe secret key exists only in API backend.

**Data flow:** User browses (Server Components fetch from API) -> adds to cart (API validates, stores server-side) -> checkout (API calculates VAT/shipping, creates Stripe session) -> Stripe webhook (API updates order status).

**Major components:**
1. **Next.js Frontend** - Presentation, animations, Server Components for SEO
2. **Fastify API** - All business logic, price calculations, Stripe integration
3. **Strapi CMS** - Products, categories, coupons, orders, media
4. **Stripe** - Payment sessions, webhooks for fulfillment

## Critical Pitfalls

Top 5 things to avoid:

1. **Strapi Schema Data Loss** - Modifying content types in production deletes data. NEVER change schemas without staging environment and database backup. Reports of 68,000+ records lost.

2. **Stripe Webhook Signature Failures** - Use `request.text()` not `request.json()` for raw body. Exclude webhook routes from auth middleware. Store event.id for idempotency. Orders will appear paid but never fulfill if this breaks.

3. **WooCommerce Migration SEO Destruction** - Create complete URL inventory before migration. Implement 301 redirects for ALL changed URLs. Validate record counts match. Missing this tanks search rankings.

4. **Animation SSR Hydration Breaks** - Push `'use client'` down component tree. Use `motion/react` import (not `framer-motion`). Use GSAP's `autoAlpha` not `opacity`. Test production builds locally - dev hides these issues.

5. **Hungarian VAT Complexity** - B2B vs B2C requires different price displays. Validate EU VAT numbers via VIES API. Partner with Hungarian accountant for invoice compliance. 27% VAT is non-negotiable.

## Build Order Implications

What depends on what:

```
Phase 1: Infrastructure (Strapi + API scaffold)
    |
    v
Phase 2: Frontend Shell (Next.js + product display)
    |
    v
Phase 3: Cart + Auth (server-side cart, user accounts)
    |
    v
Phase 4: Checkout + Payments (Stripe, VAT, webhooks)
    |
    v
Phase 5: B2B Features (quotes, bulk orders, volume pricing)
    |
    v
Phase 6: Migration + Polish (WooCommerce data, animations)
```

**Rationale:**
- Backend before frontend: Need APIs to call
- Products before cart: Need items to add
- Cart before checkout: Need items to purchase
- Auth before B2B: Need user types for pricing
- Migration last: Migrate to working system, not work-in-progress

**Phase-Pitfall Mapping:**
- Phase 1: Avoid Pitfall #5 (Strapi ops) - PostgreSQL from day 1
- Phase 2: Avoid Pitfall #4 (animation SSR) - establish patterns early
- Phase 4: Avoid Pitfalls #2, #8 (webhooks, timeouts) - test extensively
- Phase 6: Avoid Pitfalls #1, #3 (data loss, migration) - staging + backups

**Research flags:**
- Phase 4 (Payments): Needs deep research - Hungarian invoice compliance, Stripe Tax configuration
- Phase 6 (Migration): Needs deep research - WooCommerce export format, URL mapping strategy
- Phase 2 (Frontend): Standard patterns - Next.js App Router well-documented

## Open Questions

What still needs clarification:

1. **WooCommerce data format**: Need to export and analyze actual product CSV to map fields to Strapi content types

2. **Hungarian invoice requirements**: Need accountant consultation for required fields beyond standard EU invoice

3. **Existing URL structure**: Need crawl of current site to plan redirects

4. **B2B customer tier structure**: How many pricing tiers? Automatic or manual assignment?

5. **Inventory source of truth**: Will stock be managed in Strapi or synced from external system?

6. **Quote request SLA**: What response time is expected for B2B quotes?

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified with 2025/2026 official docs |
| Features | HIGH | Cross-referenced ecommerce best practices + Hungarian market research |
| Architecture | HIGH | Standard headless commerce patterns, well-documented |
| Pitfalls | HIGH | Verified against GitHub issues and community reports |

**Overall confidence:** HIGH

**Gaps identified:**
- Hungarian invoice specifics need accountant validation
- WooCommerce export structure unknown until data examined
- Exact B2B pricing tier logic needs business input

---

## Sources (Aggregated)

**Stack:**
- Next.js 16 Official Docs, Tailwind CSS v4 Release Blog, Stripe Node.js SDK Docs
- Fastify Documentation, Drizzle ORM, Strapi 5, Auth.js v5
- Motion.dev, GSAP Documentation

**Features:**
- Baymard Institute Cart Abandonment Statistics
- Stripe Payments in Hungary Guide, PPRO Hungary Payment Methods
- Trade Fire Safety Certification Guide, EN 3 Standard (Wikipedia)

**Architecture:**
- Strapi Headless Commerce Guide, Vendure Headless Architecture 2025
- Next.js Server and Client Components Docs
- Stripe Order Fulfillment Documentation

**Pitfalls:**
- Strapi GitHub Issue #19141 (data loss)
- Next.js Discussion #48885 (webhook failures)
- GSAP Forum (Next.js performance)
- WooCommerce Headless Migration Guide

---
*Research completed: 2026-01-19*
*Ready for roadmap: yes*
