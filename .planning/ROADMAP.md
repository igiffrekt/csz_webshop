# Roadmap: CSZ Webshop

**Created:** 2026-01-19
**Depth:** Comprehensive
**Phases:** 10
**Requirements:** 78 mapped

## Overview

This roadmap transforms the existing WooCommerce fire safety equipment store into a modern headless ecommerce platform. Phases follow the natural dependency chain: infrastructure enables products, products enable cart, cart enables checkout, checkout enables B2B features, and migration comes last to migrate into a working system. Animation and polish are integrated throughout rather than isolated, ensuring premium UX from the start.

---

## Phase 1: Infrastructure Foundation

**Goal:** Backend systems are operational and ready to serve data to frontend

**Dependencies:** None (starting point)

**Requirements:**
- ADMN-26: System supports Admin role (full access)
- ADMN-27: System supports Store Manager role (products, orders, coupons)
- ADMN-28: System supports Content Manager role (pages, media, SEO)

**Success Criteria:**
1. Strapi CMS is running with PostgreSQL database and accessible at admin URL
2. API backend (Fastify) responds to health check endpoint
3. Admin can log in to Strapi with Admin role and access all features
4. Store Manager can log in and access products/orders/coupons (not roles)
5. Content Manager can log in and access pages/media/SEO (not products/orders)

**Plans:** 5 plans in 3 waves

Plans:
- [x] 01-01-PLAN.md — Initialize pnpm monorepo structure (Wave 1)
- [x] 01-02-PLAN.md — Set up PostgreSQL via Docker Compose (Wave 1)
- [x] 01-03-PLAN.md — Install and configure Strapi 5 CMS (Wave 2)
- [x] 01-04-PLAN.md — Scaffold Fastify 5 API backend (Wave 2)
- [x] 01-05-PLAN.md — Configure admin roles in Strapi (Wave 3)

---

## Phase 2: Product Catalog Backend

**Goal:** Admin can manage complete product catalog with all fire safety metadata

**Dependencies:** Phase 1 (Strapi + API running)

**Requirements:**
- ADMN-01: Admin can create products with title, description, images
- ADMN-02: Admin can set product price and compare-at price
- ADMN-03: Admin can create product variants
- ADMN-04: Admin can assign products to categories
- ADMN-05: Admin can add certification information to products
- ADMN-06: Admin can upload technical specification data
- ADMN-07: Admin can upload downloadable documents (certificates, data sheets)
- ADMN-08: Admin can manage inventory quantities
- ADMN-09: Admin can set product as featured or on sale

**Success Criteria:**
1. Admin can create a complete product with images, price, variants, and category assignment
2. Admin can add fire safety certifications (CE, EN3, EN1866) and they display in product data
3. Admin can upload PDF certificates and spec sheets that are downloadable via API
4. Admin can mark products as featured or on sale and filter by these flags

**Plans:** 4 plans in 4 waves

Plans:
- [x] 02-01-PLAN.md — Create Specification/Certification components and Category content type (Wave 1)
- [x] 02-02-PLAN.md — Create Product content type with all fields (Wave 2)
- [x] 02-03-PLAN.md — Create ProductVariant content type and configure upload plugin (Wave 3)
- [x] 02-04-PLAN.md — Configure API permissions and verify complete catalog (Wave 4)

---

## Phase 3: Frontend Shell & Product Display

**Goal:** Users can browse and search the complete product catalog with certification info

**Dependencies:** Phase 2 (Product data available via API)

**Requirements:**
- PROD-01: User can browse products by category
- PROD-02: User can search products by name or keyword
- PROD-03: User can filter products by category, fire class, certification
- PROD-04: User can view product details with images and description
- PROD-05: User can see product variants (size, type, capacity)
- PROD-06: User can see certification badges (CE, EN standards) on product pages
- PROD-07: User can view technical specifications in table format
- PROD-08: User can download certificates and data sheets
- CONT-01: Home page with hero section, featured products, categories
- CONT-02: Category listing pages with product grid
- CONT-03: Product detail pages
- LANG-01: All UI text is in Hungarian
- LANG-04: Currency displayed as HUF
- PERF-03: Images are optimized and lazy-loaded
- PERF-04: Site is mobile-responsive

**Success Criteria:**
1. User can navigate from home page to category to product detail and back
2. User can search "tuzolto keszulek" and see relevant extinguisher products
3. User can filter products by fire class (A/B/C) and certification (CE, EN3)
4. User can view product page with images, specs table, certification badges, and downloadable PDFs
5. All UI text displays in Hungarian with HUF currency formatting

**Plans:** 5 plans in 4 waves

Plans:
- [x] 03-01-PLAN.md — Initialize Next.js 16 with Tailwind CSS v4, shadcn/ui, and API client (Wave 1)
- [x] 03-02-PLAN.md — Create layout shell and home page with featured products (Wave 2)
- [x] 03-03-PLAN.md — Build product listing page with search and filters (Wave 3)
- [x] 03-04-PLAN.md — Build product detail page with gallery, specs, and downloads (Wave 3)
- [x] 03-05-PLAN.md — Create category pages and verify complete frontend (Wave 4)

---

## Phase 4: Shopping Cart

**Goal:** Users can build and manage persistent shopping carts with variants and coupons

**Dependencies:** Phase 3 (Products displayable and selectable)

**Requirements:**
- CART-01: User can add products to cart
- CART-02: User can select product variants when adding to cart
- CART-03: User can view cart contents
- CART-04: User can update quantities in cart
- CART-05: User can remove items from cart
- CART-06: Cart persists across browser sessions
- CART-07: User can apply coupon code to cart
- ADMN-15: Admin can create coupon codes
- ADMN-16: Admin can set coupon as percentage or fixed discount
- ADMN-17: Admin can set coupon usage limits
- ADMN-18: Admin can set coupon expiration date
- ADMN-19: Admin can enable/disable coupons
- ANIM-05: Add-to-cart has visual feedback animation

**Success Criteria:**
1. User can add product variant to cart and see cart update with animation feedback
2. User can close browser, return next day, and cart contents are preserved
3. User can enter valid coupon code and see discount applied to cart total
4. Admin can create coupon with 10% off, 100 uses max, expiring in 30 days

**Plans:** 8 plans in 4 waves

Plans:
- [x] 04-01-PLAN.md — Create Coupon content type in Strapi CMS (Wave 1)
- [x] 04-02-PLAN.md — Create Zustand cart store with localStorage persistence (Wave 1)
- [x] 04-03-PLAN.md — Implement add-to-cart with variant selection and animation (Wave 2)
- [x] 04-04-PLAN.md — Create cart UI foundation components (CartIcon, CartItem, CartSummary) (Wave 2)
- [x] 04-05-PLAN.md — Create CartSheet slide-out panel and Header integration (Wave 3)
- [x] 04-06-PLAN.md — Create Fastify coupon validation API endpoint (Wave 2)
- [x] 04-07-PLAN.md — Integrate coupon input into cart with API validation (Wave 4)
- [x] 04-08-PLAN.md — Verify complete shopping cart functionality (Wave 5)

---

## Phase 5: Authentication & User Accounts

**Goal:** Users can create accounts, manage profiles, and view order history

**Dependencies:** Phase 4 (Cart exists to associate with account)

**Requirements:**
- AUTH-01: User can create account with email and password
- AUTH-02: User can log in with email and password
- AUTH-03: User can log out
- AUTH-04: User session persists across browser refresh
- AUTH-05: User can reset password via email link
- ACCT-01: User can view order history
- ACCT-02: User can view order details and status
- ACCT-03: User can update profile information
- ACCT-04: User can manage shipping addresses
- ACCT-05: User can add company information (name, VAT number)

**Success Criteria:**
1. User can create account, log out, and log back in with same credentials
2. User can reset forgotten password via email link and log in with new password
3. User can add company name and VAT number to profile for B2B invoicing
4. User can save multiple shipping addresses and edit/delete them
5. User can view past orders with status (order history empty until checkout works)

**Plans:** 8 plans in 5 waves

Plans:
- [x] 05-01-PLAN.md — Extend Strapi user model and create ShippingAddress content type (Wave 1)
- [x] 05-02-PLAN.md — Create Next.js session management and auth actions (Wave 1)
- [x] 05-03-PLAN.md — Create auth pages (login, register, password reset) (Wave 2)
- [x] 05-04-PLAN.md — Create middleware and Header auth integration (Wave 2)
- [x] 05-05-PLAN.md — Create account dashboard and profile management (Wave 3)
- [x] 05-06-PLAN.md — Create shipping address management (Wave 3)
- [x] 05-07-PLAN.md — Create order history pages (placeholder for Phase 6) (Wave 4)
- [x] 05-08-PLAN.md — Verify complete authentication and account functionality (Wave 5)

---

## Phase 6: Checkout & Payments

**Goal:** Users can complete purchases with Hungarian VAT compliance and Stripe payments

**Dependencies:** Phase 5 (User accounts required for checkout)

**Requirements:**
- CHKT-01: User must be logged in to checkout
- CHKT-02: User can enter shipping address
- CHKT-03: User can select from saved addresses
- CHKT-04: User can enter billing address (or use shipping)
- CHKT-05: User can see itemized order summary with VAT breakdown
- CHKT-06: User can see shipping cost before payment
- CHKT-07: User can enter purchase order reference number
- CHKT-08: User sees 27% Hungarian VAT calculated correctly
- PAY-01: User can pay with credit/debit card via Stripe
- PAY-02: User can pay with Apple Pay
- PAY-03: User can pay with Google Pay
- PAY-04: User can select bank transfer and receive payment instructions
- PAY-05: User receives order confirmation after successful payment
- PAY-06: Order status updates when Stripe webhook confirms payment
- SHIP-01: Shipping calculated as flat rate base
- SHIP-02: Weight-based surcharge added when applicable
- SHIP-03: Shipping restricted to Hungarian addresses only
- SHIP-04: Shipping cost displayed during checkout
- LANG-03: Date and number formats follow Hungarian conventions

**Success Criteria:**
1. Anonymous user attempting checkout is redirected to login/register
2. User can complete checkout with saved address, see 27% VAT calculated, and pay with card
3. User can pay with Apple Pay or Google Pay where device supports it
4. User selecting bank transfer receives account details and order shows "Awaiting Payment"
5. Order status automatically updates to "Paid" when Stripe webhook confirms payment

**Plans:** 8 plans in 4 waves

Plans:
- [x] 06-01-PLAN.md — Create Order content type in Strapi CMS (Wave 1)
- [x] 06-02-PLAN.md — Set up Stripe SDK and webhook handler (Wave 1)
- [x] 06-03-PLAN.md — Create checkout store and calculation endpoints (Wave 1)
- [x] 06-04-PLAN.md — Create checkout page with shipping step (Wave 2)
- [x] 06-05-PLAN.md — Create billing step and order summary step (Wave 2)
- [x] 06-06-PLAN.md — Create payment step with Stripe Embedded Checkout (Wave 3)
- [x] 06-07-PLAN.md — Create success page and order confirmation (Wave 3)
- [x] 06-08-PLAN.md — Add bank transfer option and verify phase (Wave 4)

---

## Phase 7: Admin Order Management

**Goal:** Admin can manage orders and view customer information

**Dependencies:** Phase 6 (Orders exist to manage)

**Requirements:**
- ADMN-10: Admin can view all orders
- ADMN-11: Admin can filter orders by status, date, customer
- ADMN-12: Admin can view order details
- ADMN-13: Admin can update order status
- ADMN-14: Admin can view customer information for order

**Success Criteria:**
1. Admin can see list of all orders with status, date, customer, and total
2. Admin can filter to "Pending" orders placed this week
3. Admin can view full order details including line items, shipping address, and payment info
4. Admin can update order from "Processing" to "Shipped" and customer sees updated status

**Plans:** 3 plans in 2 waves

Plans:
- [x] 07-01-PLAN.md — Configure Order admin views and verify permissions (Wave 1)
- [x] 07-02-PLAN.md — Add lifecycle hooks for status change notifications (Wave 1)
- [x] 07-03-PLAN.md — Verify all admin requirements (Wave 2)

---

## Phase 8: B2B Quote System

**Goal:** B2B customers can request and track bulk order quotes

**Dependencies:** Phase 5 (User accounts with company info)

**Requirements:**
- QUOT-01: User can request quote for bulk order
- QUOT-02: User can specify products, quantities, and notes in quote request
- QUOT-03: User receives confirmation when quote request submitted
- QUOT-04: User can view quote request history in account
- ADMN-20: Admin can view quote requests
- ADMN-21: Admin can respond to quote requests
- ADMN-22: Admin can mark quotes as converted/declined

**Success Criteria:**
1. User can submit quote request specifying "50x ABC extinguishers" with delivery notes
2. User receives confirmation email and sees quote in account history
3. Admin can view quote, respond with pricing via email, and mark as converted
4. User can see quote status updated from "Pending" to "Converted" in their account

**Plans:** 5 plans in 3 waves

Plans:
- [x] 08-01-PLAN.md — Create QuoteRequest content type in Strapi (Wave 1)
- [x] 08-02-PLAN.md — Create quote request form and submission (Wave 1)
- [x] 08-03-PLAN.md — Create quote history pages in account (Wave 2)
- [x] 08-04-PLAN.md — Add email notifications and lifecycle hooks (Wave 2)
- [x] 08-05-PLAN.md — Verify all requirements (Wave 3)

---

## Phase 9: Content & Polish

**Goal:** All content pages are live and animations deliver premium UX

**Dependencies:** Phase 3 (Frontend shell exists)

**Requirements:**
- CONT-04: About page (CMS-managed)
- CONT-05: FAQ page with accordion (CMS-managed)
- CONT-06: Contact page
- CONT-07: Privacy Policy page
- CONT-08: Terms and Conditions page
- CONT-09: Refund Policy page
- CONT-10: Instagram placeholder section on home page
- ADMN-23: Content manager can edit CMS pages
- ADMN-24: Content manager can upload media assets
- ADMN-25: Content manager can manage SEO metadata
- ANIM-01: Home page has animated hero section with scroll-driven storytelling
- ANIM-02: Section reveals animate on scroll
- ANIM-03: Page transitions are smooth cross-fades
- ANIM-04: Product cards have hover interactions
- ANIM-06: Buttons and inputs have micro-interactions
- ANIM-07: Loading states have skeleton/shimmer animations
- ANIM-08: Animations respect reduced-motion preference
- ANIM-09: Animations do not block checkout or add-to-cart actions
- PERF-01: Product pages are SEO-optimized with meta tags
- PERF-02: Site loads fast (target: good Lighthouse scores)
- LANG-02: All CMS content is in Hungarian

**Success Criteria:**
1. User can navigate to About, FAQ, Contact, and legal pages with all content in Hungarian
2. Content manager can edit FAQ accordion content in Strapi and changes appear on site
3. Home page hero animates on scroll with smooth storytelling effect
4. User with reduced-motion preference sees no jarring animations
5. Lighthouse performance score is 80+ on product pages

**Plans:** 10 plans in 5 waves

Plans:
- [x] 09-01-PLAN.md — Create Page and FAQ content types with SEO component (Wave 1)
- [x] 09-02-PLAN.md — Create static content pages (About, Privacy, Terms, Refund) (Wave 2)
- [x] 09-03-PLAN.md — Create FAQ page with accordion (Wave 2)
- [x] 09-04-PLAN.md — Create Contact page with form (Wave 2)
- [x] 09-05-PLAN.md — Add Instagram placeholder to home page (Wave 3)
- [x] 09-06-PLAN.md — Add scroll animations and section reveals (Wave 3)
- [x] 09-07-PLAN.md — Add product card hover and micro-interactions (Wave 4)
- [x] 09-08-PLAN.md — Add skeleton loaders and page transitions (Wave 4)
- [x] 09-09-PLAN.md — SEO optimization and Lighthouse audit (Wave 5)
- [x] 09-10-PLAN.md — Verify all requirements (Wave 5)

---

## Phase 10: Design Implementation, Migration & Launch

**Goal:** Implement reference design, migrate WooCommerce data, and launch production site

**Dependencies:** All previous phases (design builds on existing frontend, migration into working system)

**Requirements:**
- DSGN-01: Header with mega-menu and search
- DSGN-02: Hero banner with CTA
- DSGN-03: Trust badges section
- DSGN-04: Category grid
- DSGN-05: Product collections with tabs
- DSGN-06: Deals section with countdown
- DSGN-07: Promotional banners
- DSGN-08: Blog section
- DSGN-09: Enhanced product cards
- DSGN-10: Multi-column footer
- MIGR-01: Products imported from WooCommerce
- MIGR-02: Product categories imported from WooCommerce
- MIGR-03: Customer accounts imported from WooCommerce
- MIGR-04: Order history imported from WooCommerce
- MIGR-05: URL redirects implemented for SEO preservation

**Success Criteria:**
1. Home page matches reference design (01_Home.jpg) adapted for fire safety
2. All design components responsive on mobile/tablet/desktop
3. All ~200 products from WooCommerce appear in new catalog with correct data
4. Old WooCommerce URLs redirect to new URLs with 301 status
5. Site passes Lighthouse audit with 80+ scores
6. Google Search Console shows no spike in 404 errors after launch

**Plans:** 14 plans in 7 waves

Plans:
- [ ] 10-01-PLAN.md — Design system (colors, typography, spacing) (Wave 1)
- [ ] 10-02-PLAN.md — Header redesign with mega-menu (Wave 1)
- [ ] 10-03-PLAN.md — Hero banner and trust badges (Wave 2)
- [ ] 10-04-PLAN.md — Category grid section (Wave 2)
- [ ] 10-05-PLAN.md — Product collections with tabs (Wave 2)
- [ ] 10-06-PLAN.md — Deals section and promo banners (Wave 3)
- [ ] 10-07-PLAN.md — Blog section and enhanced footer (Wave 3)
- [ ] 10-08-PLAN.md — Home page assembly (Wave 4)
- [ ] 10-09-PLAN.md — Product pages polish (Wave 4)
- [ ] 10-10-PLAN.md — Design verification (Wave 5)
- [ ] 10-11-PLAN.md — WooCommerce migration scripts (Wave 6)
- [ ] 10-12-PLAN.md — URL redirects and SEO preservation (Wave 6)
- [ ] 10-13-PLAN.md — Production deployment configuration (Wave 7)
- [ ] 10-14-PLAN.md — Final verification and launch (Wave 7)

---

## Progress

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 1 | Infrastructure Foundation | Complete | 5/5 plans |
| 2 | Product Catalog Backend | Complete | 4/4 plans |
| 3 | Frontend Shell & Product Display | Complete | 5/5 plans |
| 4 | Shopping Cart | Complete | 8/8 plans |
| 5 | Authentication & User Accounts | Complete | 8/8 plans |
| 6 | Checkout & Payments | Complete | 8/8 plans |
| 7 | Admin Order Management | Complete | 3/3 plans |
| 8 | B2B Quote System | Complete | 5/5 plans |
| 9 | Content & Polish | Complete | 10/10 plans |
| 10 | Design, Migration & Launch | Planned | 0/14 plans |

---
*Roadmap created: 2026-01-19*
*Last updated: 2026-01-21 (Phase 10 planned)*
