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
- [ ] 01-01-PLAN.md — Initialize pnpm monorepo structure (Wave 1)
- [ ] 01-02-PLAN.md — Set up PostgreSQL via Docker Compose (Wave 1)
- [ ] 01-03-PLAN.md — Install and configure Strapi 5 CMS (Wave 2)
- [ ] 01-04-PLAN.md — Scaffold Fastify 5 API backend (Wave 2)
- [ ] 01-05-PLAN.md — Configure admin roles in Strapi (Wave 3)

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

---

## Phase 10: Migration & Launch

**Goal:** WooCommerce data migrated and site ready for production traffic

**Dependencies:** All previous phases (migrating into working system)

**Requirements:**
- MIGR-01: Products imported from WooCommerce
- MIGR-02: Product categories imported from WooCommerce
- MIGR-03: Customer accounts imported from WooCommerce
- MIGR-04: Order history imported from WooCommerce
- MIGR-05: URL redirects implemented for SEO preservation

**Success Criteria:**
1. All ~200 products from WooCommerce appear in new catalog with correct data
2. Existing customers can log in with migrated accounts (password reset required)
3. Migrated customers can see their historical orders in account
4. Old WooCommerce URLs redirect to new URLs with 301 status
5. Google Search Console shows no spike in 404 errors after launch

---

## Progress

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 1 | Infrastructure Foundation | Planned | 5 plans |
| 2 | Product Catalog Backend | Pending | [ ] |
| 3 | Frontend Shell & Product Display | Pending | [ ] |
| 4 | Shopping Cart | Pending | [ ] |
| 5 | Authentication & User Accounts | Pending | [ ] |
| 6 | Checkout & Payments | Pending | [ ] |
| 7 | Admin Order Management | Pending | [ ] |
| 8 | B2B Quote System | Pending | [ ] |
| 9 | Content & Polish | Pending | [ ] |
| 10 | Migration & Launch | Pending | [ ] |

---
*Roadmap created: 2026-01-19*
*Last updated: 2026-01-19*
