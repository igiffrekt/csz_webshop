# Requirements: CSZ Webshop

**Defined:** 2025-01-19
**Core Value:** Customers can browse fire safety products with clear certification info and complete purchases reliably

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Product Catalog

- [ ] **PROD-01**: User can browse products by category
- [ ] **PROD-02**: User can search products by name or keyword
- [ ] **PROD-03**: User can filter products by category, fire class, certification
- [ ] **PROD-04**: User can view product details with images and description
- [ ] **PROD-05**: User can see product variants (size, type, capacity)
- [ ] **PROD-06**: User can see certification badges (CE, EN standards) on product pages
- [ ] **PROD-07**: User can view technical specifications in table format
- [ ] **PROD-08**: User can download certificates and data sheets

### Shopping Cart

- [ ] **CART-01**: User can add products to cart
- [ ] **CART-02**: User can select product variants when adding to cart
- [ ] **CART-03**: User can view cart contents
- [ ] **CART-04**: User can update quantities in cart
- [ ] **CART-05**: User can remove items from cart
- [ ] **CART-06**: Cart persists across browser sessions
- [ ] **CART-07**: User can apply coupon code to cart

### Authentication

- [ ] **AUTH-01**: User can create account with email and password
- [ ] **AUTH-02**: User can log in with email and password
- [ ] **AUTH-03**: User can log out
- [ ] **AUTH-04**: User session persists across browser refresh
- [ ] **AUTH-05**: User can reset password via email link

### User Account

- [ ] **ACCT-01**: User can view order history
- [ ] **ACCT-02**: User can view order details and status
- [ ] **ACCT-03**: User can update profile information
- [ ] **ACCT-04**: User can manage shipping addresses
- [ ] **ACCT-05**: User can add company information (name, VAT number)

### Checkout

- [ ] **CHKT-01**: User must be logged in to checkout
- [ ] **CHKT-02**: User can enter shipping address
- [ ] **CHKT-03**: User can select from saved addresses
- [ ] **CHKT-04**: User can enter billing address (or use shipping)
- [ ] **CHKT-05**: User can see itemized order summary with VAT breakdown
- [ ] **CHKT-06**: User can see shipping cost before payment
- [ ] **CHKT-07**: User can enter purchase order reference number
- [ ] **CHKT-08**: User sees 27% Hungarian VAT calculated correctly

### Payments

- [ ] **PAY-01**: User can pay with credit/debit card via Stripe
- [ ] **PAY-02**: User can pay with Apple Pay
- [ ] **PAY-03**: User can pay with Google Pay
- [ ] **PAY-04**: User can select bank transfer and receive payment instructions
- [ ] **PAY-05**: User receives order confirmation after successful payment
- [ ] **PAY-06**: Order status updates when Stripe webhook confirms payment

### Shipping

- [ ] **SHIP-01**: Shipping calculated as flat rate base
- [ ] **SHIP-02**: Weight-based surcharge added when applicable
- [ ] **SHIP-03**: Shipping restricted to Hungarian addresses only
- [ ] **SHIP-04**: Shipping cost displayed during checkout

### Quote Requests (B2B)

- [ ] **QUOT-01**: User can request quote for bulk order
- [ ] **QUOT-02**: User can specify products, quantities, and notes in quote request
- [ ] **QUOT-03**: User receives confirmation when quote request submitted
- [ ] **QUOT-04**: User can view quote request history in account

### Content Pages

- [ ] **CONT-01**: Home page with hero section, featured products, categories
- [ ] **CONT-02**: Category listing pages with product grid
- [ ] **CONT-03**: Product detail pages
- [ ] **CONT-04**: About page (CMS-managed)
- [ ] **CONT-05**: FAQ page with accordion (CMS-managed)
- [ ] **CONT-06**: Contact page
- [ ] **CONT-07**: Privacy Policy page
- [ ] **CONT-08**: Terms and Conditions page
- [ ] **CONT-09**: Refund Policy page
- [ ] **CONT-10**: Instagram placeholder section on home page

### Admin - Products

- [ ] **ADMN-01**: Admin can create products with title, description, images
- [ ] **ADMN-02**: Admin can set product price and compare-at price
- [ ] **ADMN-03**: Admin can create product variants
- [ ] **ADMN-04**: Admin can assign products to categories
- [ ] **ADMN-05**: Admin can add certification information to products
- [ ] **ADMN-06**: Admin can upload technical specification data
- [ ] **ADMN-07**: Admin can upload downloadable documents (certificates, data sheets)
- [ ] **ADMN-08**: Admin can manage inventory quantities
- [ ] **ADMN-09**: Admin can set product as featured or on sale

### Admin - Orders

- [ ] **ADMN-10**: Admin can view all orders
- [ ] **ADMN-11**: Admin can filter orders by status, date, customer
- [ ] **ADMN-12**: Admin can view order details
- [ ] **ADMN-13**: Admin can update order status
- [ ] **ADMN-14**: Admin can view customer information for order

### Admin - Coupons

- [ ] **ADMN-15**: Admin can create coupon codes
- [ ] **ADMN-16**: Admin can set coupon as percentage or fixed discount
- [ ] **ADMN-17**: Admin can set coupon usage limits
- [ ] **ADMN-18**: Admin can set coupon expiration date
- [ ] **ADMN-19**: Admin can enable/disable coupons

### Admin - Quotes

- [ ] **ADMN-20**: Admin can view quote requests
- [ ] **ADMN-21**: Admin can respond to quote requests
- [ ] **ADMN-22**: Admin can mark quotes as converted/declined

### Admin - Content

- [ ] **ADMN-23**: Content manager can edit CMS pages
- [ ] **ADMN-24**: Content manager can upload media assets
- [ ] **ADMN-25**: Content manager can manage SEO metadata

### Admin - Access

- [ ] **ADMN-26**: System supports Admin role (full access)
- [ ] **ADMN-27**: System supports Store Manager role (products, orders, coupons)
- [ ] **ADMN-28**: System supports Content Manager role (pages, media, SEO)

### Animations & UX

- [ ] **ANIM-01**: Home page has animated hero section with scroll-driven storytelling
- [ ] **ANIM-02**: Section reveals animate on scroll
- [ ] **ANIM-03**: Page transitions are smooth cross-fades
- [ ] **ANIM-04**: Product cards have hover interactions
- [ ] **ANIM-05**: Add-to-cart has visual feedback animation
- [ ] **ANIM-06**: Buttons and inputs have micro-interactions
- [ ] **ANIM-07**: Loading states have skeleton/shimmer animations
- [ ] **ANIM-08**: Animations respect reduced-motion preference
- [ ] **ANIM-09**: Animations do not block checkout or add-to-cart actions

### Migration

- [ ] **MIGR-01**: Products imported from WooCommerce
- [ ] **MIGR-02**: Product categories imported from WooCommerce
- [ ] **MIGR-03**: Customer accounts imported from WooCommerce
- [ ] **MIGR-04**: Order history imported from WooCommerce
- [ ] **MIGR-05**: URL redirects implemented for SEO preservation

### Performance & SEO

- [ ] **PERF-01**: Product pages are SEO-optimized with meta tags
- [ ] **PERF-02**: Site loads fast (target: good Lighthouse scores)
- [ ] **PERF-03**: Images are optimized and lazy-loaded
- [ ] **PERF-04**: Site is mobile-responsive

### Language & Localization

- [ ] **LANG-01**: All UI text is in Hungarian
- [ ] **LANG-02**: All CMS content is in Hungarian
- [ ] **LANG-03**: Date and number formats follow Hungarian conventions
- [ ] **LANG-04**: Currency displayed as HUF

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Content

- **BLOG-01**: Blog/news section with articles
- **BLOG-02**: Blog categories and tags
- **BLOG-03**: Blog search

### Social

- **SOCL-01**: Live Instagram feed integration
- **SOCL-02**: Social sharing buttons on products

### Payments

- **PAY-07**: Cash on delivery payment option

### B2B

- **B2B-01**: Volume pricing tiers displayed on product pages
- **B2B-02**: Automatic quantity discounts at checkout

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multi-language | Hungarian only for v1, complexity not justified |
| International shipping | Hungary only per business requirements |
| Subscription/recurring payments | One-time purchases only |
| Real-time ERP sync | Manual inventory management via Strapi for v1 |
| AI chatbot | Over-engineering for 200-product catalog |
| AR/VR product views | Not relevant for fire safety equipment |
| Voice search | Low ROI for niche B2B market |
| Wishlist | Defer to v2, not critical for conversion |
| Product reviews | Defer to v2, adds moderation complexity |
| Multi-currency | HUF only for Hungarian market |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (To be filled by roadmapper) | | |

**Coverage:**
- v1 requirements: 78 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 78

---
*Requirements defined: 2025-01-19*
*Last updated: 2025-01-19 after initial definition*
