---
phase: 03-frontend-shell
plan: 02
subsystem: frontend
tags: [layout, header, footer, hero, product-card, home-page]

depends_on:
  requires:
    - "03-01": Next.js App Setup (base app, api client, formatters)
  provides:
    - Layout shell (Header, Footer, MobileNav)
    - Home page with hero, featured products, categories
    - ProductCard component for grids
    - Hungarian translations for navigation and home
  affects:
    - "03-03": Product detail page (uses ProductCard, layout)
    - "04-*": Shopping cart (cart icon in Header)

tech_stack:
  added:
    - "@radix-ui/react-dialog": "sheet dependency"
  patterns:
    - Server Components for data fetching (async page.tsx)
    - Client Components for interactivity (MobileNav with useState)
    - Promise.allSettled for parallel API calls with error resilience
    - Responsive design with Tailwind breakpoints

key_files:
  created:
    - apps/web/src/components/layout/Logo.tsx
    - apps/web/src/components/layout/Header.tsx
    - apps/web/src/components/layout/Footer.tsx
    - apps/web/src/components/layout/MobileNav.tsx
    - apps/web/src/components/home/HeroSection.tsx
    - apps/web/src/components/home/FeaturedProducts.tsx
    - apps/web/src/components/home/CategoryGrid.tsx
    - apps/web/src/components/product/ProductCard.tsx
    - apps/web/src/components/ui/sheet.tsx
    - apps/web/src/components/ui/badge.tsx
    - apps/web/public/placeholder.svg
  modified:
    - apps/web/src/app/[locale]/layout.tsx
    - apps/web/src/app/[locale]/page.tsx
    - apps/web/src/messages/hu.json
    - apps/web/src/lib/formatters.ts

decisions:
  - id: sheet-for-mobile-nav
    choice: "shadcn/ui Sheet component for mobile navigation"
    rationale: "Accessible, animated slide-out drawer with proper focus trap"
  - id: promise-allsettled
    choice: "Promise.allSettled for parallel data fetching"
    rationale: "Graceful degradation - page renders even if one API fails"
  - id: server-component-home
    choice: "Home page as async Server Component"
    rationale: "Data fetching at build/request time, no client-side loading states"

metrics:
  duration: "~10 minutes"
  completed: "2026-01-20"
---

# Phase 3 Plan 2: Layout Shell & Home Page Summary

Complete layout shell with Header, Footer, and MobileNav, plus home page with hero section, featured products grid, and category navigation - all connected to Strapi API.

## What Was Built

### Layout Shell Components

**Logo.tsx (Server Component):**
- CSZ text logo with fire safety equipment tagline
- Link to home page with hover effect

**Header.tsx (Server Component):**
- Sticky header with backdrop blur effect
- Navigation links: Termekek, Kategoriak, Kapcsolat
- Search and cart icon placeholders (ready for Phase 4)
- Responsive design - hamburger menu on mobile

**MobileNav.tsx (Client Component):**
- Slide-out Sheet drawer from left side
- Full navigation links matching desktop
- Search and cart buttons
- Proper focus management and accessibility

**Footer.tsx (Server Component):**
- Three-column layout (Logo, Quick Links, Contact)
- Contact info placeholder (address, phone, email)
- Copyright with dynamic year
- Responsive stacking on mobile

### Home Page Components

**HeroSection.tsx:**
- Full-width gradient background with decorative blur elements
- Main headline: "Tuzvedelmi eszkozok szakertoktol"
- Subtitle with value proposition
- CTA button linking to products
- Trust indicators (certified, fast shipping, expert advice)

**ProductCard.tsx:**
- Product image with next/image optimization
- Name, price with HUF formatting
- Compare at price with strikethrough
- Sale badge and CE certification badge
- Hover effects (scale, shadow)
- Link to product detail page

**FeaturedProducts.tsx:**
- Section title with "View all" link
- 4-column responsive grid (4/2/1 on desktop/tablet/mobile)
- Gracefully hides if no products

**CategoryGrid.tsx:**
- 3-column responsive grid
- Category cards with background image overlay
- Subcategory count indicator
- Filters to top-level categories only

### Home Page Assembly

**page.tsx (async Server Component):**
- Parallel data fetching with Promise.allSettled
- Error-resilient rendering (empty arrays on API failure)
- HeroSection + FeaturedProducts + CategoryGrid sections

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Mobile nav | Sheet drawer | Accessible, animated, focus trapped |
| Data fetching | Promise.allSettled | Page renders even if API partially fails |
| Image handling | placeholder.svg | Graceful fallback for missing images |
| Component pattern | Server Components default | Data fetching without client hydration |

## Commits

| Hash | Description | Key Files |
|------|-------------|-----------|
| 0834550 | Create layout shell components | Header, Footer, Logo, MobileNav, Sheet |
| c8c2362 | Create ProductCard and home sections | ProductCard, HeroSection, FeaturedProducts, CategoryGrid, Badge |
| cfa49cf | Assemble home page with real data | page.tsx, formatters.ts, placeholder.svg |

## Verification Results

- [x] TypeScript compilation passes
- [x] Production build succeeds
- [x] Header renders with navigation links
- [x] Footer renders with three columns
- [x] MobileNav Sheet component accessible via hamburger
- [x] HeroSection displays hero banner
- [x] ProductCard shows product with price formatting
- [x] Home page fetches and displays from Strapi (with graceful empty state)
- [x] All Hungarian text renders correctly

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for:** Plan 03-03 (Product Detail Page)
- ProductCard component available for reuse
- Layout shell wraps all pages
- API client has getProduct() function
- Hungarian translations structure established

**Prerequisites for full testing:**
- Strapi CMS must be running (`pnpm dev:cms`)
- PostgreSQL database must be running (`pnpm db:start`)
- Published products/categories in Strapi for live data display
