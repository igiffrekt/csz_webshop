---
phase: 03-frontend-shell
plan: 04
subsystem: frontend
tags: [next.js, product-detail, seo, components]
requires: [03-02]
provides: [product-detail-page, product-components, seo-metadata]
affects: [04-shopping-cart]
tech-stack:
  added: []
  patterns: [server-components, client-components, json-ld, seo]
key-files:
  created:
    - apps/web/src/app/[locale]/termekek/[slug]/page.tsx
    - apps/web/src/app/[locale]/termekek/[slug]/not-found.tsx
    - apps/web/src/components/product/ProductGallery.tsx
    - apps/web/src/components/product/ProductInfo.tsx
    - apps/web/src/components/product/SpecsTable.tsx
    - apps/web/src/components/product/CertBadges.tsx
    - apps/web/src/components/product/VariantSelector.tsx
    - apps/web/src/components/product/DocumentList.tsx
  modified:
    - apps/web/src/messages/hu.json
decisions:
  - Native Tailwind classes for rich text styling (Tailwind v4 incompatible with typography plugin)
  - Server Components for data-fetching components (ProductInfo, SpecsTable, CertBadges, DocumentList)
  - Client Components only for interactive elements (ProductGallery, VariantSelector)
metrics:
  duration: ~15 minutes
  completed: 2026-01-20
---

# Phase 03 Plan 04: Product Detail Page Summary

**One-liner:** Full product detail page with image gallery, variant selection, certification badges, specs table, and JSON-LD SEO

## Objective Achievement

Built the complete product detail page at `/termekek/[slug]` enabling users to:
- View product images in a gallery with thumbnail navigation
- See product name, description, price in HUF, and stock status
- Select product variants with live price updates
- View certification badges (CE, EN standards) for fire safety compliance
- Review specifications in a structured table
- Download product documents (PDFs, certificates)

## Implementation Summary

### Components Created

| Component | Type | Purpose |
|-----------|------|---------|
| ProductGallery | Client | Image gallery with thumbnail selection |
| ProductInfo | Server | Name, SKU, price, badges, stock, add-to-cart |
| VariantSelector | Client | Interactive variant selection buttons |
| CertBadges | Server | Fire safety certification display |
| SpecsTable | Server | Product specifications table |
| DocumentList | Server | Downloadable documents list |

### Page Features

1. **Dynamic SEO**
   - generateMetadata for title, description, OpenGraph
   - JSON-LD structured data (Product schema)
   - Proper 404 handling with not-found.tsx

2. **Product Display**
   - 2-column responsive layout (gallery | info)
   - Badge indicators for featured/on-sale products
   - Stock status with visual indicators
   - Compare-at-price with strikethrough for discounts

3. **Fire Safety Focus**
   - Certification badges prominently displayed
   - Documents section for downloadable certificates
   - Standards shown (CE marking, EN standards)

### Hungarian Localization

Added product-specific translations:
- Cikksz: SKU label
- Keszleten / Nincs keszleten: Stock status
- Muszaki adatok: Specifications
- Tanusitvanyok: Certifications
- Letoltheto dokumentumok: Documents

## Commits

| Hash | Description |
|------|-------------|
| 50feae3 | Create ProductGallery and ProductInfo components |
| d5cfdf6 | Create SpecsTable, CertBadges, VariantSelector, DocumentList |
| 2a3b03e | Build product detail page with SEO |

## Verification Results

- [x] Product detail page at /termekek/[slug] displays full product information
- [x] Image gallery allows browsing multiple product images (PROD-04)
- [x] Variants display and are selectable (PROD-05)
- [x] Certification badges visible (PROD-06)
- [x] Specifications shown in table format (PROD-07)
- [x] Documents downloadable via links (PROD-08)
- [x] SEO metadata and JSON-LD structured data present
- [x] 404 page for invalid product slugs

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Tailwind Typography v4 Incompatibility**
- **Found during:** Task 3
- **Issue:** @tailwindcss/typography plugin (v0.5) is incompatible with Tailwind CSS v4
- **Fix:** Removed typography plugin, used native Tailwind classes with descendant selectors for rich text styling
- **Files modified:** apps/web/src/app/globals.css, page.tsx

## Technical Notes

### Server vs Client Components

Decision to use Server Components for most product display:
- ProductInfo, SpecsTable, CertBadges, DocumentList are Server Components
- Only ProductGallery (image selection state) and VariantSelector (selection state) are Client Components
- Minimizes JavaScript bundle, improves performance

### SEO Implementation

JSON-LD structured data follows schema.org Product type:
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "...",
  "sku": "...",
  "offers": {
    "@type": "Offer",
    "price": "...",
    "priceCurrency": "HUF",
    "availability": "https://schema.org/InStock"
  }
}
```

## Phase 3 Completion Status

With this plan complete:
- [x] Plan 03-01: Next.js App Setup
- [x] Plan 03-02: Layout Shell & Home Page
- [ ] Plan 03-03: Product Listing Page (in progress)
- [x] Plan 03-04: Product Detail Page

## Next Phase Readiness

Phase 4 (Shopping Cart) can begin. Prerequisites met:
- Product detail page with "Add to Cart" button (currently disabled placeholder)
- Variant selector ready for cart integration
- Product data structure includes all fields needed for cart items
