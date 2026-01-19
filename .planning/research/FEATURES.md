# Feature Landscape

**Domain:** Fire Safety Equipment Ecommerce (B2B/B2C Hybrid)
**Market:** Hungary
**Researched:** 2026-01-19
**Confidence:** HIGH (multiple authoritative sources cross-referenced)

## Table Stakes

Features users expect from any modern ecommerce site. Missing these = users leave.

### Core Shopping Experience

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Product catalog with search** | Users can't shop without finding products | Medium | Must handle ~200 products with variants; needs filters by category, fire class, certification |
| **Product filtering & sorting** | 69% of users filter before purchase | Medium | Filter by: price, fire rating class (A/B/C/D/K), certification, capacity/size |
| **Product detail pages** | Users need specs before safety equipment purchase | Medium | Critical for safety equipment - must show certifications prominently |
| **Shopping cart** | Cannot complete purchase without it | Medium | Must handle product variants (sizes, capacities) |
| **Secure checkout** | Trust is non-negotiable for any purchase | High | SSL, payment security badges, GDPR compliance |
| **User accounts** | Required per project spec; enables B2B features | Medium | Required for checkout per requirements |
| **Order history** | B2B buyers need purchase records for compliance | Low | Essential for fire safety - buyers need proof of purchase for inspections |
| **Mobile-responsive design** | 70%+ of ecommerce traffic is mobile in 2025 | Medium | Mobile abandonment rate is 85.65% vs 69.99% desktop |

### Hungarian Market Requirements

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Hungarian language** | Local market expects native language | Low | Not just translation - original Hungarian copy |
| **Hungarian Forint (HUF) pricing** | Local currency expected | Low | 27% VAT must be displayed clearly |
| **Local payment methods** | Cash on delivery is #1 in Hungary; cards only 34% | High | Must support: Cash on Delivery, Barion, Simple by OTP, card payments |
| **Bank transfer option** | Hungarian instant payment system (Azonnali Fizetes) popular | Medium | Common for B2B transactions |
| **Electronic payment acceptance** | Required by Hungarian law since Jan 2021 | Medium | At least one electronic option legally required |

### Trust & Compliance

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Clear shipping costs upfront** | 48% abandon carts due to surprise costs | Low | Display before checkout; Hungarian buyers sensitive to this |
| **Contact information** | Legal requirement + trust signal | Low | Phone, email, physical address required |
| **Privacy policy & terms** | GDPR compliance mandatory | Low | Must be in Hungarian |
| **Return/refund policy** | EU consumer protection law | Low | 14-day return right for B2C |
| **SSL certificate** | Basic security expectation | Low | Non-negotiable |

### Checkout Essentials

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Progress indicator** | Reduces perceived complexity | Low | 22% abandon due to long checkout |
| **Order confirmation** | Users expect immediate confirmation | Low | Email + on-screen confirmation |
| **Invoice generation** | B2B requires proper invoices; Hungarian tax law | Medium | Must comply with Hungarian invoicing requirements |
| **Shipping address validation** | Reduces failed deliveries | Low | Hungarian address format support |

## Differentiators

Features that set apart a fire safety equipment store. Not expected, but highly valued.

### Fire Safety Niche Features (HIGH VALUE)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Certification display system** | Fire safety equipment MUST show CE marks, EN standards | Medium | Display EN3, EN1866, EN1869, PED compliance prominently on product pages |
| **Fire class compatibility matrix** | Helps buyers choose correct extinguisher | Medium | Visual guide: Class A (solids), B (liquids), C (gases), D (metals), K (cooking) |
| **Technical specification tables** | Industrial buyers need detailed specs before purchase | Medium | Pressure ratings, capacities, dimensions, agent types in HTML (not just PDF) |
| **Downloadable documentation** | Compliance officers need certificates, data sheets | Low | PDF certificates, safety data sheets, installation guides per product |
| **Product comparison tool** | B2B buyers compare multiple options | Medium | Side-by-side specs for similar products |
| **Unit toggle (metric/imperial)** | Some specs use both systems | Low | Toggle for international standards references |

### B2B Features (HIGH VALUE for target market)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Quote request system** | Required per project spec; B2B expects negotiated pricing | High | RFQ flow: product selection -> quantity -> contact info -> admin response |
| **Bulk order form** | B2B buyers order 10-100+ items at once | Medium | CSV upload or quick-add by SKU; matrix ordering for variants |
| **Volume/tiered pricing display** | B2B expects quantity discounts | Medium | Show: "1-9: X HUF, 10-49: Y HUF, 50+: Request quote" |
| **Purchase order reference field** | B2B accounting requires PO numbers | Low | Simple field in checkout, appears on invoice |
| **Company account profiles** | B2B buyers manage multiple addresses, contacts | Medium | Company name, VAT number, multiple shipping addresses |
| **Reorder functionality** | B2B buyers repeat orders (maintenance cycles) | Low | "Reorder" button on order history |
| **Net pricing option** | B2B prefers net + VAT display | Low | Toggle or automatic based on account type |

### Coupon & Promotions (Required per spec)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Coupon code system** | Required per project spec | Medium | Percentage, fixed amount, minimum order, expiry dates |
| **Coupon validation feedback** | Clear UX for applied/invalid codes | Low | Real-time validation in cart |
| **Admin coupon management** | Create, track, expire coupons | Medium | Dashboard for coupon CRUD, usage tracking |

### Enhanced UX (MEDIUM VALUE)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Persistent cart** | Users return to complete purchase | Low | Save cart to account or localStorage |
| **Wishlist/saved items** | B2B buyers research before purchasing | Low | Save products for later, share with colleagues |
| **Stock availability display** | Prevents disappointment at checkout | Low | "In stock", "Low stock", "Out of stock" indicators |
| **Estimated delivery date** | Sets expectations, reduces inquiries | Medium | Calculate based on stock + shipping method |
| **Related products** | Cross-sell complementary items | Low | Fire extinguisher -> bracket, signage, inspection tag |
| **Recently viewed** | Helps users find products again | Low | Session or account-based history |

### Admin & Operations (MEDIUM VALUE)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Order management dashboard** | Efficient order processing | Medium | View, filter, process, fulfill orders |
| **Inventory management** | Track stock levels | Medium | Stock counts, low stock alerts |
| **Customer management** | View customer history, notes | Medium | Account details, order history, B2B vs B2C flag |
| **Quote management** | Process B2B quote requests | Medium | View requests, respond with pricing, convert to order |
| **Basic analytics** | Understand sales performance | Medium | Sales by product, category, customer type |
| **Export capabilities** | Accounting integration, reporting | Low | Export orders to CSV for accounting software |

## Anti-Features

Features to deliberately NOT build. Common mistakes in this domain.

### Dark Patterns (Ethical & Legal Risk)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Forced account creation before browsing** | 26% abandon due to mandatory registration; frustrates researchers | Allow browsing without account; require account only at checkout (per spec) |
| **Hidden costs until checkout** | 48% abandonment; damages trust irreparably | Show shipping estimates on product page; display all costs in cart |
| **Pre-checked newsletter signup** | GDPR violation risk; annoys users | Unchecked opt-in checkbox; clear consent |
| **Confirmshaming ("No thanks, I hate savings")** | Manipulative; damages brand perception | Neutral decline options: "No thanks" or "Skip" |
| **Fake urgency ("Only 2 left!")** | Once discovered, destroys trust permanently | Use real stock data or omit scarcity indicators |
| **Auto-add items to cart** | Sneak-into-basket is a known dark pattern | Only add items user explicitly selects |
| **Difficult unsubscribe** | GDPR violation; "roach motel" pattern | One-click unsubscribe in all emails |

### Over-Engineering (Waste of Resources)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **AI-powered chatbot** | Overkill for ~200 products; high complexity | Simple contact form + FAQ page; phone number |
| **AR/VR product visualization** | Fire extinguishers don't need AR try-on | Good product photos from multiple angles |
| **Voice search** | Niche B2B audience; low ROI | Standard search with good filters |
| **Social login** | Adds complexity; B2B users prefer email | Email/password accounts only |
| **Cryptocurrency payments** | Hungarian market doesn't use; regulatory complexity | Stick to cards, bank transfer, cash on delivery |
| **Real-time inventory sync** | ~200 products don't need complex ERP integration | Daily or manual stock updates sufficient |
| **Multi-language support** | Hungarian market only per spec | Hungarian only; save localization complexity |
| **Multi-currency** | Hungarian market only | HUF only |
| **Subscription/recurring orders** | Fire safety equipment isn't consumable | One-time purchase focus; reorder button sufficient |

### Feature Creep Risks

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Full B2B portal with approval workflows** | ~200 products, smaller operation | Simple quote system; grow into complexity |
| **Complex product configurator** | Fire extinguishers are standard products | Variants (size/capacity) handled via standard options |
| **User reviews system** | B2B buyers trust certifications over reviews; moderation burden | Rely on certification badges; add reviews later if needed |
| **Blog/content marketing system** | Separate concern from commerce | Can add later; not MVP |
| **Loyalty/points program** | Complexity for small catalog; B2B discounts work differently | Volume pricing and quote system instead |
| **Live chat** | Support burden for small team | Contact form, phone, email with response time expectations |
| **Guest checkout** | Spec requires accounts; B2B needs account features | Account required but streamlined registration |

### WooCommerce Migration Pitfalls

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **1:1 feature replication** | WooCommerce has accumulated cruft; fresh start opportunity | Evaluate each feature's actual usage before migrating |
| **Migrating all historical orders** | Old data has diminishing value; migration complexity | Migrate recent orders (1-2 years); archive old data |
| **Preserving URL structure exactly** | May carry SEO debt; new structure opportunity | 301 redirects from old URLs; new clean structure |
| **Migrating all plugins' data** | Plugin-specific data may not transfer | Focus on core: products, customers, orders |

## Feature Dependencies

Understanding what must be built before other features can work.

```
DEPENDENCY GRAPH

User Accounts (required by spec)
    |
    +---> Order History
    +---> Saved Addresses
    +---> Wishlist
    +---> Quote Requests (B2B)
    +---> Company Profiles (B2B)
    +---> Reorder Functionality

Product Catalog
    |
    +---> Product Search
    +---> Filtering & Sorting
    +---> Product Comparison
    +---> Related Products
    +---> Recently Viewed

Shopping Cart
    |
    +---> Coupon System
    +---> Checkout Flow
          |
          +---> Payment Integration
          +---> Order Confirmation
          +---> Invoice Generation

Admin Dashboard
    |
    +---> Order Management
    +---> Quote Management
    +---> Inventory Management
    +---> Customer Management
    +---> Coupon Management
```

### Critical Path for MVP

The following must be built in order:

1. **Product Catalog** - Foundation for everything
2. **User Accounts** - Required by spec; enables B2B features
3. **Shopping Cart** - Core commerce
4. **Checkout + Payments** - Revenue generation
5. **Order Management** - Operations capability

### Parallel Workstreams

Can be built independently after core:

- **Quote System** (after accounts)
- **Coupon System** (after cart)
- **Product Comparison** (after catalog)
- **Certification Display** (during catalog build)

## MVP Recommendation

For MVP, prioritize:

### Must Have (Phase 1)
1. Product catalog with certification display
2. User accounts with B2B fields
3. Search and filtering by fire class, certification
4. Shopping cart with variants
5. Checkout with Hungarian payment methods (card + cash on delivery minimum)
6. Order management (admin)
7. Invoice generation (Hungarian compliance)

### Should Have (Phase 2)
1. Quote request system (B2B differentiator)
2. Coupon system (per spec)
3. Bulk order form
4. Volume pricing display
5. Technical documentation downloads

### Nice to Have (Phase 3)
1. Product comparison tool
2. Reorder functionality
3. Wishlist
4. Advanced analytics
5. Barion/Simple payment integration

### Defer Indefinitely
- AI features (chatbots, recommendations)
- AR/VR
- Multi-language/currency
- Subscription features
- Loyalty program
- Blog/CMS

## Sources

### Ecommerce Features (General)
- [LitExtension - 30+ Must-Have eCommerce Website Features](https://litextension.com/blog/ecommerce-website-features/)
- [Qualdev - Essential Features Every eCommerce Website Needs in 2025](https://qualdev.com/top-essential-features-every-ecommerce-website-needs-in-2025/)
- [Shopify - How to Reduce Shopping Cart Abandonment](https://www.shopify.com/enterprise/blog/44272899-how-to-reduce-shopping-cart-abandonment-by-optimizing-the-checkout)
- [Baymard Institute - Cart Abandonment Statistics](https://baymard.com/lists/cart-abandonment-rate)

### B2B Ecommerce
- [Shopify - B2B Ecommerce Features Checklist](https://www.shopify.com/enterprise/blog/b2b-ecommerce-features-wholesale)
- [SparkLayer - B2B Quoting Solution](https://www.sparklayer.io/quoting-engine/)
- [KVY Technology - Quote-Based Ordering in B2B](https://kvytechnology.com/blog/ecommerce/quote-based-ordering-in-b2b/)
- [ECI Solutions - Must-Have B2B Ecommerce Features for Industrial Distributors](https://www.ecisolutions.com/blog/distribution/evolutionx/must-have-b2b-ecommerce-features-for-industrial-safety-and-mro-distributors/)

### Hungarian Market
- [Stripe - Payments in Hungary Guide](https://stripe.com/resources/more/payments-in-hungary)
- [PPRO - Hungary Payment Methods](https://www.ppro.com/countries/hungary/)
- [Trade.gov - Hungary eCommerce](https://www.trade.gov/country-commercial-guides/hungary-ecommerce)
- [Transfi - Popular Local Payment Methods in Hungary](https://www.transfi.com/blog/popular-local-payment-methods-and-solutions-in-hungary)

### Fire Safety Certifications
- [Trade Fire Safety - Certification Mark Guide](https://tradefiresafety.co.uk/Certification%20mark%20guide%202023.pdf)
- [Applus - CE Marking of Fire Safety Systems](https://www.appluslaboratories.com/global/en/what-we-do/service-sheet/ce-marking-of-fire-safety-systems)
- [Wikipedia - EN 3 Standard](https://en.wikipedia.org/wiki/EN_3)

### UX Anti-Patterns
- [ConvertCart - eCommerce UX Mistakes and Dark Patterns](https://www.convertcart.com/blog/ecommerce-ux-mistakes-dark-patterns)
- [Net Solutions - Dark Patterns in UX](https://www.netsolutions.com/insights/dark-patterns-in-ux-disadvantages/)
- [NN/g - B2B Product Specifications Guidelines](https://www.nngroup.com/articles/b2b-specs/)

### WooCommerce Migration
- [WooCommerce - Product CSV Importer and Exporter](https://woocommerce.com/document/product-csv-importer-exporter/)
- [WooCommerce - Migrating Products Between Sites](https://woocommerce.com/document/migrating-products-between-sites/)
