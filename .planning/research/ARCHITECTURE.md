# Architecture Research: CSZ Webshop

**Domain:** Headless Ecommerce (Fire Safety Equipment)
**Researched:** 2026-01-19
**Confidence:** HIGH (well-established patterns, multiple authoritative sources)

## Executive Summary

This architecture separates concerns into four distinct layers: a **Next.js frontend** for presentation, a **Node.js API backend** for business logic, **Strapi CMS** for content management, and **Stripe** for payments. The key architectural decision is that the **frontend never calculates business-critical values** (VAT, shipping, coupon discounts) — all pricing calculations happen server-side in the API backend.

This follows the established headless commerce pattern where the frontend is decoupled from the backend, connected only by APIs. According to the 2025 MACH Alliance Global Annual Research Report, 92% of US brands have adopted composable commerce related to MACH principles (Microservices, API-first, Cloud-native, Headless).

---

## System Components

### Layer 1: Next.js Frontend (Presentation)

**Responsibility:** User interface, rendering, client-side interactivity, animations

| Component | Technology | Role |
|-----------|------------|------|
| Pages/Routes | Next.js App Router | Route handling, server-side rendering |
| Server Components | React Server Components | Data fetching, initial rendering |
| Client Components | React + Motion.dev/GSAP | Interactivity, animations |
| State Management | React Context or Zustand | Cart state, UI state |

**What it DOES:**
- Render product pages, category listings, checkout flow
- Handle user interactions (add to cart, form inputs)
- Execute animations and transitions
- Display prices and totals received from API
- Manage ephemeral UI state

**What it NEVER does:**
- Calculate VAT amounts
- Calculate shipping costs
- Apply coupon discounts
- Validate inventory availability for checkout
- Store payment credentials
- Make decisions about order validity

**Data Fetching Pattern:**
```
Server Component:
  async function ProductPage({ params }) {
    // Fetch from API backend, not Strapi directly
    const product = await fetch(`${API_URL}/products/${params.slug}`)
    return <ProductDisplay product={product} />
  }
```

The frontend fetches from the API backend, which acts as a facade. This maintains the rule that the frontend never touches business logic — even "read-only" product data comes through the API which can enrich it with calculated fields (availability, pricing tiers, etc.).

---

### Layer 2: Node.js API Backend (Business Logic)

**Responsibility:** All business rules, calculations, orchestration, security enforcement

| Component | Role |
|-----------|------|
| Product API | Fetch from Strapi, enrich with availability |
| Cart API | Manage cart state, calculate totals |
| Checkout API | Validate, calculate final amounts, create Stripe session |
| Webhook Handler | Process Stripe events, update order status |
| Quote API | Handle bulk quote requests |

**Critical Calculations (server-side only):**

```
Hungarian VAT: 27% (non-negotiable, legal requirement)
Shipping: Flat rate + weight-based surcharge
Coupon: Validate code, apply discount rules
Final Total: (Subtotal - Discount) + Shipping + VAT
```

**Why a Separate Backend (not Next.js API Routes):**

1. **Clear Separation**: Business logic is framework-agnostic, not tied to Next.js
2. **Testability**: API can be unit-tested independently
3. **Reusability**: Same API can serve mobile app, admin tools, etc.
4. **Deployment Independence**: Can scale API separately from frontend
5. **Security Boundary**: Frontend deployment cannot access Stripe secret keys

**API Endpoints Structure:**

```
GET  /api/products              - List products (paginated, filtered)
GET  /api/products/:slug        - Single product with variants
GET  /api/categories            - Category tree
GET  /api/cart                  - Get current cart (session-based or user-based)
POST /api/cart/items            - Add item to cart
PUT  /api/cart/items/:id        - Update quantity
DELETE /api/cart/items/:id      - Remove item
POST /api/cart/coupon           - Apply coupon code
POST /api/checkout              - Create Stripe checkout session
POST /api/webhooks/stripe       - Handle Stripe webhooks
GET  /api/orders                - User's order history (authenticated)
GET  /api/orders/:id            - Order details (authenticated)
POST /api/quotes                - Submit bulk quote request
```

---

### Layer 3: Strapi CMS (Content & Product Management)

**Responsibility:** Store and manage all content — products, categories, pages, coupons

**Content Types:**

| Content Type | Fields | Relationships |
|--------------|--------|---------------|
| Product | name, slug, description, basePrice, sku, images, specs, certifications, stock | hasMany Variants, belongsTo Category |
| ProductVariant | name, sku, price, stock, attributes (size, type) | belongsTo Product |
| Category | name, slug, description, image, seoMeta | hasMany Products, self-referential parent/children |
| Coupon | code, discountType (percent/fixed), value, minOrder, maxUses, validFrom, validTo, active | — |
| Order | orderNumber, status, items, totals, customerInfo, stripeSessionId | belongsTo User |
| Page | title, slug, content (dynamic zones), seoMeta | — |
| User | email, name, addresses, passwordHash | hasMany Orders |

**Strapi's Role:**
- Source of truth for product catalog
- Admin interface for content management
- REST/GraphQL APIs for data access
- Media library for product images
- User management for customers

**Important:** The API backend calls Strapi's REST API to fetch data. The frontend does NOT call Strapi directly — this maintains the single entry point through the API backend.

---

### Layer 4: Stripe (Payments)

**Responsibility:** Payment processing, checkout sessions, webhooks

**Integration Pattern:**

```
Frontend                API Backend              Stripe
   |                         |                      |
   |-- POST /checkout ------>|                      |
   |                         |-- Create Session --->|
   |                         |<-- Session URL ------|
   |<-- Redirect URL --------|                      |
   |-- Redirect to Stripe --------------------------->|
   |                         |                      |
   |                         |<-- Webhook: payment_intent.succeeded
   |                         |-- Update Order ------|
   |<-- Poll/Websocket ------|                      |
```

**Key Stripe Objects:**
- **Checkout Session**: Server-created, contains line items, prices, tax, shipping
- **PaymentIntent**: Created by Stripe, tracks payment status
- **Webhook Events**: `checkout.session.completed`, `payment_intent.succeeded`

**Security Rule:** Stripe secret key ONLY exists in API backend. Frontend only receives the publishable key and checkout session URL.

---

## Communication Patterns

### Request Flow Diagram

```
                                    +------------------+
                                    |     Strapi CMS   |
                                    | (Content Store)  |
                                    +--------^---------+
                                             |
                                             | REST API
                                             |
+-------------------+                +-------+--------+               +-----------+
|   Next.js         |   HTTP/HTTPS   |   Node.js      |   Stripe API  |  Stripe   |
|   Frontend        |--------------->|   API Backend  |<------------->|  Servers  |
| (Browser/Server)  |<---------------|  (Business     |               |           |
+-------------------+                |   Logic)       |               +-----------+
        |                            +-------+--------+
        |                                    |
        +------------------------------------+
              Stripe Checkout Redirect
```

### Data Flow: Add to Cart

```
1. User clicks "Add to Cart"
2. Frontend sends POST /api/cart/items { productId, variantId, quantity }
3. API Backend:
   a. Fetches product from Strapi (validates exists)
   b. Checks stock availability
   c. Adds to cart (session or DB)
   d. Calculates subtotal
   e. Returns updated cart with server-calculated totals
4. Frontend displays updated cart (trusts server totals)
```

### Data Flow: Checkout

```
1. User clicks "Proceed to Checkout"
2. Frontend sends POST /api/checkout { cartId, shippingAddress, couponCode? }
3. API Backend:
   a. Fetches cart and validates all items still available
   b. Fetches coupon from Strapi (if provided), validates
   c. Calculates:
      - Subtotal (sum of item prices)
      - Discount (coupon applied)
      - Shipping (flat + weight-based)
      - VAT (27% on subtotal - discount + shipping)
      - Total
   d. Creates Stripe Checkout Session with exact amounts
   e. Creates Order in Strapi with status "pending"
   f. Returns Stripe checkout URL
4. Frontend redirects user to Stripe
5. User completes payment on Stripe
6. Stripe sends webhook to API Backend
7. API Backend:
   a. Verifies webhook signature
   b. Updates Order status to "paid"
   c. Clears cart
   d. Triggers confirmation email
8. User redirected to success page
9. Frontend fetches order details from API
```

### Data Flow: Browse Products

```
1. User navigates to category page
2. Next.js Server Component fetches GET /api/products?category=slug
3. API Backend:
   a. Fetches products from Strapi
   b. Enriches with stock status, calculated fields
   c. Returns product list
4. Server Component renders HTML
5. Client Component hydrates for interactivity
```

---

## Data Models

### Product Model (Strapi)

```json
{
  "id": 1,
  "name": "Porral olt 6kg-os tuzolto keszulek",
  "slug": "porral-olto-6kg",
  "description": "...",
  "basePrice": 15900,
  "sku": "PO-6KG-001",
  "images": [{ "url": "...", "alt": "..." }],
  "specifications": {
    "weight": 6,
    "height": 520,
    "diameter": 160,
    "fireRating": "21A 113B C"
  },
  "certifications": ["CE", "EN3-7:2004+A1:2007"],
  "stock": 45,
  "category": { "id": 2, "name": "Tuzolto keszulekek" },
  "variants": [
    { "id": 1, "name": "Standard", "sku": "PO-6KG-001-STD", "price": 15900, "stock": 30 },
    { "id": 2, "name": "With bracket", "sku": "PO-6KG-001-BRK", "price": 17900, "stock": 15 }
  ]
}
```

### Cart Model (API Backend Session/DB)

```json
{
  "id": "cart_abc123",
  "userId": null,
  "sessionId": "sess_xyz789",
  "items": [
    {
      "id": "item_1",
      "productId": 1,
      "variantId": 1,
      "quantity": 2,
      "unitPrice": 15900,
      "lineTotal": 31800
    }
  ],
  "couponCode": "SUMMER10",
  "subtotal": 31800,
  "discount": 3180,
  "shipping": 1990,
  "vat": 8255,
  "total": 38865,
  "calculatedAt": "2026-01-19T10:30:00Z"
}
```

### Order Model (Strapi)

```json
{
  "id": 1,
  "orderNumber": "CSZ-2026-00001",
  "status": "paid",
  "items": [
    {
      "productId": 1,
      "variantId": 1,
      "name": "Porral olto 6kg-os tuzolto keszulek - Standard",
      "sku": "PO-6KG-001-STD",
      "quantity": 2,
      "unitPrice": 15900,
      "lineTotal": 31800
    }
  ],
  "subtotal": 31800,
  "discount": 3180,
  "couponCode": "SUMMER10",
  "shipping": 1990,
  "vat": 8255,
  "total": 38865,
  "customer": {
    "userId": 5,
    "email": "customer@example.com",
    "name": "Kiss Janos",
    "phone": "+36201234567"
  },
  "shippingAddress": {
    "street": "Fo utca 1",
    "city": "Budapest",
    "postalCode": "1011",
    "country": "HU"
  },
  "billingAddress": { ... },
  "stripeSessionId": "cs_live_...",
  "stripePaymentIntentId": "pi_...",
  "createdAt": "2026-01-19T10:35:00Z",
  "paidAt": "2026-01-19T10:38:00Z"
}
```

---

## Build Order

Based on dependencies between components, here is the recommended build sequence:

### Phase 1: Foundation (Backend First)

**Why backend first:** Frontend needs something to call. Strapi provides data, API provides business logic.

1. **Strapi Setup**
   - Install and configure Strapi
   - Create content types: Product, Category, ProductVariant
   - Seed with sample data
   - Configure media library

2. **API Backend Scaffolding**
   - Express.js project setup
   - Environment configuration
   - Strapi client setup (fetch products)
   - Basic product endpoints

**Deliverable:** API returns products from Strapi

### Phase 2: Frontend Shell

**Why after backend:** Can now fetch real data

3. **Next.js Project Setup**
   - App Router configuration
   - TypeScript setup
   - Tailwind CSS + design tokens
   - Layout components (header, footer)

4. **Product Display**
   - Product listing page (Server Component)
   - Product detail page
   - Category navigation
   - Search functionality

**Deliverable:** Users can browse products (read-only)

### Phase 3: Cart & User Management

**Why this order:** Need products before cart, need cart before checkout

5. **Cart System (API Backend)**
   - Cart model (session-based initially)
   - Add/update/remove items
   - Server-side total calculation
   - Coupon validation

6. **User Authentication**
   - Strapi user management
   - Login/register in frontend
   - Session/JWT handling in API
   - Guest cart to user cart merge

7. **Cart UI (Frontend)**
   - Cart page
   - Mini-cart component
   - Quantity controls
   - Coupon input

**Deliverable:** Users can add items to cart, apply coupons

### Phase 4: Checkout & Payments

**Why last of core:** Requires all previous pieces

8. **Checkout Calculation (API Backend)**
   - Shipping calculation (flat + weight)
   - VAT calculation (27%)
   - Final total assembly
   - Stripe Checkout Session creation

9. **Stripe Integration**
   - Stripe configuration
   - Checkout session creation
   - Webhook handler
   - Signature verification

10. **Order Creation**
    - Order content type in Strapi
    - Order creation on checkout
    - Status updates from webhooks
    - Order confirmation emails

11. **Checkout UI (Frontend)**
    - Checkout flow pages
    - Address forms
    - Order summary
    - Success/cancel pages

**Deliverable:** Complete purchase flow

### Phase 5: Polish & Migration

12. **Account Area**
    - Order history
    - Address management
    - Profile settings

13. **CMS Pages**
    - Dynamic page content type
    - Legal pages
    - FAQ accordion

14. **Migration Scripts**
    - WooCommerce product import
    - Customer migration
    - Order history import

15. **Animations & Polish**
    - Motion.dev component animations
    - GSAP scroll effects
    - Page transitions

**Deliverable:** Production-ready site

---

## Security Boundaries

### Trust Boundaries

```
UNTRUSTED                          TRUSTED
+------------------+          +------------------+
|    Browser       |          |   API Backend    |
|    (Frontend)    |   <-->   |   (Node.js)      |
+------------------+          +------------------+
        |                              |
        | Never receives:              | Has access to:
        | - Stripe secret key          | - Stripe secret key
        | - Strapi admin token         | - Strapi admin token
        | - Webhook secrets            | - Webhook secrets
        | - DB credentials             | - DB credentials
        |                              |
        | Never calculates:            | Calculates:
        | - VAT                        | - VAT (27%)
        | - Final prices               | - Shipping
        | - Discounts                  | - Discounts
        |                              | - Final totals
```

### API Security Rules

1. **Authentication**: All user-specific endpoints require valid JWT/session
2. **Input Validation**: All inputs validated server-side (never trust frontend)
3. **Rate Limiting**: Protect against abuse (especially checkout, coupon validation)
4. **CORS**: Only allow requests from frontend domain
5. **Webhook Verification**: Always verify Stripe signatures
6. **Secrets Management**: Environment variables, never in code

### Data Security

| Data Type | Storage | Access |
|-----------|---------|--------|
| User passwords | Strapi (hashed) | Never exposed via API |
| Payment cards | Stripe only | Never touches our servers |
| Order details | Strapi | Authenticated user or admin |
| Session data | API backend | HttpOnly cookies or server-side |

---

## Anti-Patterns to Avoid

### 1. Frontend Price Calculation

**Wrong:**
```javascript
// In frontend
const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
const vat = total * 0.27
const finalTotal = total + vat + shipping
```

**Right:**
```javascript
// Frontend displays what API returns
const { total, vat, shipping, finalTotal } = await fetch('/api/cart').then(r => r.json())
```

### 2. Direct Strapi Calls from Frontend

**Wrong:**
```javascript
// In Next.js Server Component
const products = await fetch('http://strapi:1337/api/products')
```

**Right:**
```javascript
// In Next.js Server Component
const products = await fetch(`${API_URL}/api/products`)
```

### 3. Trusting Frontend Cart State for Checkout

**Wrong:**
```javascript
// API endpoint
app.post('/checkout', (req, res) => {
  const { items, total } = req.body // Trusting frontend-calculated total
  stripe.checkout.sessions.create({ amount: total })
})
```

**Right:**
```javascript
// API endpoint
app.post('/checkout', async (req, res) => {
  const cart = await getCartFromSession(req) // Server-side cart
  const total = calculateTotal(cart) // Server-calculated
  stripe.checkout.sessions.create({ amount: total })
})
```

### 4. Storing Stripe Keys in Frontend

**Wrong:**
```javascript
// In frontend .env
STRIPE_SECRET_KEY=sk_live_... // NEVER
```

**Right:**
```javascript
// Only in API backend .env
STRIPE_SECRET_KEY=sk_live_...
// Frontend only has
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## Scalability Considerations

| Concern | Initial (100 users) | Growth (10K users) | Scale (100K users) |
|---------|---------------------|--------------------|--------------------|
| API Backend | Single instance | Horizontal scaling, load balancer | Kubernetes, auto-scaling |
| Strapi | Single instance | Add caching layer (Redis) | Read replicas, CDN for media |
| Sessions | In-memory or cookies | Redis session store | Redis cluster |
| Database | SQLite or PostgreSQL | PostgreSQL | PostgreSQL with read replicas |
| Media | Strapi local | CDN (Cloudflare/S3) | CDN with multiple origins |

---

## Sources

**Architecture Patterns:**
- [Strapi Headless Commerce Guide](https://strapi.io/blog/headless-commerce-guide)
- [Vendure Headless Architecture Guide 2025](https://vendure.io/resources/headless-architecture-the-complete-guide-for-modern-commerce)
- [Shopify Headless Commerce Guide 2025](https://www.shopify.com/enterprise/blog/headless-commerce)

**Next.js Patterns:**
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js Data Fetching](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Next.js Backend for Frontend Pattern](https://nextjs.org/docs/app/guides/backend-for-frontend)

**Stripe Integration:**
- [Stripe Order Fulfillment Documentation](https://docs.stripe.com/checkout/fulfillment)
- [Stripe Webhook Handling](https://docs.stripe.com/webhooks/handling-payment-events)
- [Stripe Node.js GitHub](https://github.com/stripe/stripe-node)

**Strapi Ecommerce:**
- [Strapi in Ecommerce Applications](https://strapi.io/blog/strapi-in-ecommerce)
- [Strapi Ecommerce Microservices](https://strapi.io/blog/ecommerce-microservices-architecture-benefits-guide)

**Data Modeling:**
- [Ecommerce Database Design - Vertabelo](https://vertabelo.com/blog/er-diagram-for-online-shop/)
- [Product Variants Database Design](https://martinbean.dev/blog/2023/01/27/product-variants-laravel/)
