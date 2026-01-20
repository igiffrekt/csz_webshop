---
phase: 03-frontend-shell
plan: 03
subsystem: frontend
tags: [product-listing, filters, search, pagination, nuqs, url-state]

depends_on:
  requires:
    - "03-02": Layout Shell & Home Page (ProductCard, layout)
  provides:
    - Product listing page at /termekek with grid display
    - URL-based filter state (search, category, fireClass, certification)
    - Pagination with nuqs URL state management
    - Fire class (A/B/C) and certification (CE, EN3) filters
  affects:
    - "04-*": Shopping cart (product listing links to detail)
    - Future SEO: URL structure for product discovery

tech_stack:
  added:
    - "@radix-ui/react-select": "shadcn select component"
    - "@radix-ui/react-checkbox": "shadcn checkbox component"
    - "@radix-ui/react-label": "shadcn label component"
  patterns:
    - nuqs for URL state management (searchParams sync)
    - Client Components for filter UI (useQueryState)
    - Server Component for page (data fetching)
    - Graceful error handling with try/catch and empty arrays

key_files:
  created:
    - apps/web/src/components/product/SearchInput.tsx
    - apps/web/src/components/product/ProductFilters.tsx
    - apps/web/src/components/product/ProductGrid.tsx
    - apps/web/src/components/product/Pagination.tsx
    - apps/web/src/components/product/EmptyState.tsx
    - apps/web/src/app/[locale]/termekek/page.tsx
    - apps/web/src/components/ui/input.tsx
    - apps/web/src/components/ui/select.tsx
    - apps/web/src/components/ui/checkbox.tsx
    - apps/web/src/components/ui/label.tsx
  modified:
    - apps/web/src/app/[locale]/layout.tsx
    - apps/web/src/lib/api.ts
    - apps/web/src/messages/hu.json

decisions:
  - id: nuqs-url-state
    choice: "nuqs for URL state management"
    rationale: "Type-safe URL params with shallow:false for server re-render"
  - id: filter-throttle
    choice: "500ms throttle on search input"
    rationale: "Debounce user typing to reduce API calls"
  - id: fireclass-specification-filter
    choice: "Filter by specification name 'Tuzosztaly' or 'Fire Class'"
    rationale: "Fire class stored in product specifications component"
  - id: certification-name-filter
    choice: "Filter certifications by name field"
    rationale: "Products have certifications relation with name (CE, EN3)"

metrics:
  duration: "~8 minutes"
  completed: "2026-01-20"
---

# Phase 3 Plan 3: Product Listing Page Summary

Product listing page at /termekek with search, category filter, fire class filter, certification filter, and pagination - all managed via URL state with nuqs.

## What Was Built

### Filter Components (Client Components)

**SearchInput.tsx:**
- Search icon with text input
- 500ms throttle via nuqs options
- Updates URL with ?q=... parameter
- Clears q param when input empty

**ProductFilters.tsx:**
- Category dropdown (from Strapi categories)
- Fire class dropdown (A, B, C)
- Certification checkboxes (CE, EN3)
- All filters update URL state via nuqs
- shallow: false triggers server re-render

### Display Components

**ProductGrid.tsx (Server Component):**
- Responsive grid: 1 column mobile, 2 tablet, 3 laptop, 4 desktop
- Renders ProductCard for each product
- Returns null for empty state (parent handles)

**Pagination.tsx (Client Component):**
- Previous/Next buttons with disabled states
- Shows "X. oldal / Y" in Hungarian
- Updates URL with ?page=N parameter
- Hides when totalPages <= 1

**EmptyState.tsx (Server Component):**
- Package icon with "no results" message
- "Clear filters" button when filters active
- Links back to /termekek

### Product Listing Page

**termekek/page.tsx (Server Component):**
- Reads searchParams from URL
- Fetches categories for filter dropdown
- Fetches products with all filters applied
- Combines: category, q, fireClass, cert, page
- Graceful error handling (empty arrays on API failure)
- Metadata with Hungarian title

### API Enhancements

**api.ts updates:**
- ProductFilters interface with fireClass and certification
- Fire class filter searches specifications component
- Certification filter uses $in operator for array match
- Specifications now populated in response

### Hungarian Translations

**hu.json additions:**
- products.allCategories: "Minden kategoria"
- products.allFireClasses: "Minden tuzosztaly"
- products.fireClass: "Tuzosztaly"
- products.certifications: "Tanusitvanyok"
- products.showing: "{count} termek megjeleniteve"
- products.clearFilters: "Szurok torlese"
- pagination.previous/next/showing

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| URL state | nuqs library | Type-safe, server-compatible, shareable URLs |
| Search throttle | 500ms | Balance between responsiveness and API load |
| Fire class filter | Specification search | Fire class stored in specifications component |
| Cert filter | Name $in query | Multi-select with OR logic |

## Commits

| Hash | Description | Key Files |
|------|-------------|-----------|
| 49b3977 | Create SearchInput and ProductFilters with nuqs | SearchInput, ProductFilters, layout, ui components |
| 76bda4b | Create ProductGrid and Pagination components | ProductGrid, Pagination |
| 348e749 | Build product listing page with filters | termekek/page, EmptyState, api.ts |

## Verification Results

- [x] TypeScript compilation passes
- [x] Production build succeeds
- [x] /termekek route renders product listing page
- [x] Search input updates URL with ?q=... after 500ms
- [x] Category dropdown updates URL with ?category=...
- [x] Fire class dropdown updates URL with ?fireClass=A|B|C
- [x] Certification checkboxes update URL with ?cert=CE,EN3
- [x] Pagination controls update URL with ?page=N
- [x] Multiple filters combine in URL
- [x] Empty state shows with "clear filters" when no results
- [x] All UI text in Hungarian

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Phase 3 Complete:** All 3 plans executed
- 03-01: Next.js app setup
- 03-02: Layout shell & home page
- 03-03: Product listing page

**Ready for:** Phase 4 (Shopping Cart)
- Product listing and detail pages complete
- Add to cart buttons ready to implement
- Layout shell wraps all pages

**Prerequisites for full testing:**
- Strapi CMS running with products that have:
  - Categories assigned
  - Specifications with "Tuzosztaly" name and A/B/C values
  - Certifications with "CE" or "EN3" names
