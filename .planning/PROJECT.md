# CSZ Webshop — Fire Safety Equipment E-commerce

## What This Is

A full-featured e-commerce platform for selling fire safety equipment, parts, and accessories to Hungarian customers. The platform serves both businesses (offices, factories, restaurants needing compliance equipment) and individuals (homeowners buying personal safety gear). Built with a modern architecture featuring expressive animations, headless CMS, and robust checkout — replacing an existing WooCommerce site with a faster, more visually compelling experience.

## Core Value

**Customers can browse fire safety products with clear certification info and complete purchases reliably** — whether buying a single smoke detector or requesting a quote for 50 extinguishers.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Product Catalog**
- [ ] Browse ~200 products with variants (size, type, etc.)
- [ ] View product certifications (CE marks, EN standards)
- [ ] Filter by category
- [ ] Search products
- [ ] View product details with specs and compliance info

**Shopping & Checkout**
- [ ] Add products to persistent cart
- [ ] User account required for checkout
- [ ] Apply coupon codes
- [ ] Automatic 27% Hungarian VAT calculation
- [ ] Flat-rate shipping + weight-based surcharge
- [ ] Pay via Stripe (card, Apple Pay, Google Pay)
- [ ] Receive order confirmation
- [ ] View order history in account

**Quote Requests**
- [ ] Request quote for bulk orders
- [ ] Submit company details and quantities
- [ ] Admin receives and responds to quote requests

**Content & Pages**
- [ ] Home page with hero, categories, featured products, deals
- [ ] Category listing pages
- [ ] Product detail pages
- [ ] Cart and checkout flow
- [ ] User account area
- [ ] CMS-driven pages (About, FAQ, etc.)
- [ ] Legal pages (Privacy Policy, Terms, Refund Policy)
- [ ] Instagram section (placeholder, no live feed yet)

**Admin & CMS**
- [ ] Manage products, categories, inventory
- [ ] Manage orders
- [ ] Manage coupons
- [ ] Manage CMS pages and content blocks
- [ ] Manage media assets
- [ ] Role-based access (Admin, Store Manager, Content Manager)

**Migration**
- [ ] Import products from WooCommerce
- [ ] Import customer accounts
- [ ] Import order history

**Animation & UX**
- [ ] Bold, premium animation style
- [ ] Motion.dev for component animations
- [ ] GSAP for scroll-driven storytelling
- [ ] Smooth page transitions
- [ ] Mobile-first responsive design
- [ ] Respect reduced-motion preferences

### Out of Scope

- Blog/news section — v2, not critical for launch
- Live Instagram feed integration — v2, placeholder only for now
- Multi-language support — Hungarian only
- International shipping — Hungary only
- Subscription/recurring payments — one-time purchases only
- Real-time inventory sync with external ERP — manual management via Strapi
- Automatic quantity discounts — using quote request system instead

## Context

**Current State:**
- Existing WooCommerce site with ~200 products
- Established customer base to migrate
- Order history to preserve
- Site feels slow and design is dated

**Why Rebuild:**
- Fresh, modern design with premium feel
- Expressive animations that convey quality
- Faster performance (Next.js vs WordPress)
- Better admin experience (Strapi vs WooCommerce)
- Clean architecture for future expansion

**Product Domain:**
- Fire safety equipment: extinguishers, smoke detectors, fire blankets, signage
- Parts and accessories: replacement parts, mounting hardware
- Compliance-driven: certifications (CE, EN standards) are key buying factors
- Mixed audience: businesses need compliance docs, consumers need simplicity

**Reference Design:**
- `reference/01_Home.jpg` — layout structure (mega menu, hero, category grid, product tabs, deals, FAQ accordion, footer)
- Apply fire safety branding and color scheme
- Same structural approach, different content

## Constraints

- **Language**: Hungarian only — all UI, content, legal pages
- **Geography**: Hungary only — shipping, VAT, payment processing
- **Tax**: 27% Hungarian VAT — calculated server-side, non-negotiable
- **Payments**: Stripe only — includes Apple Pay, Google Pay via Stripe
- **Hosting**: Custom environment (not Vercel/Netlify) — deployment config needed
- **Design**: Pixel-accurate implementation of provided designs
- **Performance**: Animations must not degrade checkout or add-to-cart responsiveness

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Strapi for CMS | Headless, flexible, self-hosted, good admin UX | — Pending |
| Separate API backend | All business logic (VAT, shipping, coupons) server-side, frontend never source of truth | — Pending |
| Quote requests over auto-discounts | Bulk pricing is negotiated, not formulaic | — Pending |
| Motion.dev + GSAP split | Motion for component state, GSAP for scroll/timeline | — Pending |
| Full migration before launch | Preserve customer relationships and order history | — Pending |

---
*Last updated: 2025-01-19 after initialization*
