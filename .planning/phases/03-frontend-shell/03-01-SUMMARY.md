---
phase: 03-frontend-shell
plan: 01
subsystem: frontend
tags: [next.js, tailwind, shadcn, i18n, api-client]

depends_on:
  requires:
    - "01-05": Infrastructure Foundation (roles)
    - "02-04": API Permissions (public read access)
  provides:
    - Next.js 16 app with App Router
    - Tailwind CSS v4 design tokens
    - shadcn/ui component library
    - API client for Strapi
    - HUF price formatting
    - Hungarian i18n setup
  affects:
    - "03-02": Product listing (uses api.ts, formatters.ts)
    - "03-03": Product detail (uses api.ts, formatters.ts)

tech_stack:
  added:
    - next: "16.1.4"
    - tailwindcss: "4.1.18"
    - next-intl: "4.7.0"
    - "@tanstack/react-query": "5.90.19"
    - motion: "12.27.1"
    - nuqs: "2.8.6"
    - qs: "6.14.1"
    - shadcn-ui: "New York style"
  patterns:
    - Server Components default with App Router
    - CSS-first Tailwind v4 with @theme tokens
    - Workspace types package (@csz/types)
    - ISR revalidation (60s) for API fetches

key_files:
  created:
    - apps/web/package.json
    - apps/web/next.config.ts
    - apps/web/src/app/globals.css
    - apps/web/src/app/layout.tsx
    - apps/web/src/app/page.tsx
    - apps/web/src/app/[locale]/layout.tsx
    - apps/web/src/app/[locale]/page.tsx
    - apps/web/middleware.ts
    - apps/web/src/i18n/routing.ts
    - apps/web/src/i18n/request.ts
    - apps/web/src/messages/hu.json
    - apps/web/src/lib/api.ts
    - apps/web/src/lib/formatters.ts
    - apps/web/src/lib/utils.ts
    - apps/web/src/components/ui/button.tsx
    - apps/web/src/components/providers/QueryProvider.tsx
    - apps/web/components.json
  modified:
    - packages/types/src/index.ts
    - pnpm-lock.yaml

decisions:
  - id: next-16-app-router
    choice: "Next.js 16.1.4 with App Router and Turbopack"
    rationale: "Latest stable, Turbopack default, Server Components"
  - id: tailwind-v4-css-first
    choice: "Tailwind CSS v4 with @theme CSS variables"
    rationale: "No config file needed, 100x faster builds"
  - id: shadcn-new-york
    choice: "shadcn/ui New York style with neutral base"
    rationale: "Professional appearance for B2B fire safety shop"
  - id: next-intl-hu-only
    choice: "Hungarian (hu) as default and only locale"
    rationale: "Hungarian market focus, no multi-language needed initially"
  - id: workspace-types
    choice: "Add @csz/types dependency to web app"
    rationale: "Share types between api, cms, and web apps"

metrics:
  duration: "~15 minutes"
  completed: "2026-01-20"
---

# Phase 3 Plan 1: Next.js App Setup Summary

Next.js 16.1.4 frontend foundation with Tailwind CSS v4, shadcn/ui, and Strapi API client for Hungarian fire safety equipment shop.

## What Was Built

### Next.js Application (apps/web)
- Next.js 16.1.4 with App Router and Turbopack bundler
- TypeScript 5.9.3 with strict mode
- src/ directory structure for organized code
- Hungarian locale (hu) as default via next-intl

### Styling System
- Tailwind CSS v4 with CSS-first @theme configuration
- Design tokens for colors, fonts, and radii
- shadcn/ui initialized with New York style and neutral base
- Button component added as foundation

### Data Layer
- API client (`src/lib/api.ts`) with:
  - `getProducts(filters)` - paginated product listing with category/search/featured filters
  - `getProduct(slug)` - single product with all relations populated
  - `getCategories()` - hierarchical category list
  - `getFeaturedProducts()` - shortcut for featured products
- HUF price formatter using Intl.NumberFormat hu-HU locale
- Strapi media URL helper for image paths
- TanStack Query provider for client-side caching

### Shared Types Package
Updated `packages/types/src/index.ts` with:
- `Product`, `Category`, `ProductVariant` interfaces
- `StrapiMedia`, `Specification`, `Certification` types
- `StrapiResponse<T>`, `StrapiListResponse<T>` wrappers

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 16.1.4 | Turbopack default, Server Components, explicit caching |
| CSS Framework | Tailwind CSS v4 | CSS-first config eliminates tailwind.config.js |
| Component Library | shadcn/ui New York | Professional B2B appearance, ownable components |
| i18n | next-intl with hu-only | Hungarian market, minimal overhead |
| Types | Workspace dependency | Share Product/Category types across apps |

## Commits

| Hash | Description | Key Files |
|------|-------------|-----------|
| 01424a6 | Create Next.js 16 app with Tailwind CSS v4 | package.json, next.config.ts, globals.css, middleware.ts |
| ecf234f | Add shadcn/ui and shared TypeScript types | components.json, button.tsx, types/index.ts |
| 4f7649b | Create API client and formatters | api.ts, formatters.ts, QueryProvider.tsx |

## Verification Results

- [x] Next.js dev server starts on http://localhost:3000
- [x] Page renders with Hungarian locale (html lang="hu")
- [x] Tailwind CSS classes work (text-4xl, bg-background, etc.)
- [x] shadcn/ui Button component renders correctly
- [x] formatPrice(15900) returns "15 900 Ft"
- [x] TypeScript compilation passes with no errors
- [x] Production build succeeds

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for:** Plan 03-02 (Product Listing Page)
- API client available: `getProducts()`, `getCategories()`
- Formatters ready: `formatPrice()`, `getStrapiMediaUrl()`
- Component foundation: shadcn/ui Button, Tailwind utilities
- Layout structure: `[locale]` route with providers

**Prerequisites for testing:**
- Strapi CMS must be running (`pnpm dev:cms`)
- PostgreSQL database must be running (`pnpm db:start`)
- At least one published product in Strapi for API testing
