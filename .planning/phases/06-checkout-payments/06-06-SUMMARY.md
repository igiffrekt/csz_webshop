---
phase: 06-checkout-payments
plan: 06
subsystem: payments
tags: [stripe, checkout, payment-processing, embedded-checkout]

dependency-graph:
  requires: [06-01, 06-02, 06-03, 06-04, 06-05]
  provides: [stripe-checkout-session, payment-step, order-creation]
  affects: [06-07, 06-08]

tech-stack:
  added:
    - "@stripe/stripe-js@^8.6.3"
    - "@stripe/react-stripe-js@^5.4.1"
  patterns:
    - embedded-checkout: Stripe Embedded Checkout for card/Apple Pay/Google Pay
    - order-first-flow: Create order in Strapi before Stripe session
    - server-side-pricing: Never trust client-submitted prices

key-files:
  created:
    - apps/api/src/routes/checkout/create-session.ts
    - apps/web/src/app/[locale]/penztar/steps/PaymentStep.tsx
  modified:
    - apps/api/src/index.ts
    - apps/web/package.json
    - apps/web/.env.example
    - apps/web/src/app/[locale]/penztar/CheckoutClient.tsx
    - apps/web/src/app/[locale]/penztar/page.tsx

decisions:
  - id: embedded-checkout-pattern
    choice: "EmbeddedCheckoutProvider with fetchClientSecret"
    rationale: "Stripe recommended pattern for React integration"
  - id: order-first-flow
    choice: "Create Strapi order before Stripe session"
    rationale: "Ensures order exists even if payment abandoned, webhook has order_id in metadata"
  - id: one-time-stripe-coupon
    choice: "Create Stripe coupon per checkout for discounts"
    rationale: "Map internal coupon discounts to Stripe's discount system"

metrics:
  duration: "3 minutes"
  completed: "2026-01-21"
---

# Phase 6 Plan 06: Stripe Payment Integration Summary

Stripe Embedded Checkout integration with order-first flow and Apple Pay/Google Pay support.

## One-liner

Stripe Embedded Checkout with create-session endpoint creating orders in Strapi before payment initiation.

## What was built

### 1. Stripe React SDK Installation (Task 1)
- Installed @stripe/stripe-js and @stripe/react-stripe-js packages
- Added NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.example
- Added NEXT_PUBLIC_API_URL to .env.example

### 2. Create Session Endpoint (Task 2)
- POST /checkout/create-session endpoint at apps/api/src/routes/checkout/create-session.ts
- Order-first flow: Creates order in Strapi BEFORE Stripe session
- Server-side price verification (fetches prices from database, never trusts client)
- Generates unique order numbers (CSZ-YYYY-XXXXX format)
- Stores order_id and order_number in Stripe metadata for webhook processing
- Creates one-time Stripe coupons for discount application
- Adds shipping as separate line item when not free

### 3. Payment Step Component (Task 3)
- PaymentStep component at apps/web/src/app/[locale]/penztar/steps/PaymentStep.tsx
- Uses EmbeddedCheckoutProvider with fetchClientSecret callback
- Integrates with checkout store for address selection
- Passes userId from session for order creation
- Shows informational text about supported payment methods
- Error state for missing shipping address

## API Contract

### POST /checkout/create-session

**Request:**
```typescript
{
  lineItems: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    name: string;
    variantName?: string;
    sku: string;
    price: number;
  }>;
  shippingAddress: {
    recipientName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  billingAddress?: {
    recipientName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    companyName?: string;
    vatNumber?: string;
  };
  couponCode?: string;
  poReference?: string;
  userId: number;
}
```

**Response:**
```typescript
{
  clientSecret: string;
  orderId: string;
  orderNumber: string;
}
```

## Environment Variables Added

**apps/web/.env.example:**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Deviations from Plan

None - plan executed exactly as written.

## Verification Status

- [x] Stripe React SDK installed (@stripe/stripe-js, @stripe/react-stripe-js)
- [x] create-session.ts creates order in Strapi before Stripe session
- [x] create-session.ts uses server-side prices (not client-provided)
- [x] create-session.ts stores order_id in Stripe metadata
- [x] PaymentStep.tsx uses EmbeddedCheckout from @stripe/react-stripe-js
- [x] PaymentStep.tsx calls create-session endpoint
- [x] page.tsx passes userId to CheckoutClient
- [x] pnpm --filter @csz/web build compiles
- [x] pnpm --filter @csz/api build compiles

## Payment Methods Supported

1. **Credit/Debit Cards** (PAY-01) - Visa, Mastercard, etc.
2. **Apple Pay** (PAY-02) - On supported devices/browsers
3. **Google Pay** (PAY-03) - On supported browsers

All handled automatically by Stripe Embedded Checkout.

## Next Phase Readiness

Ready for 06-07 (Order Confirmation & Emails):
- Order created in Strapi with status: pending
- Stripe session ID stored on order for webhook correlation
- Webhook already exists at /webhook/stripe (from 06-02)
- Return URL configured: /hu/penztar/siker?session_id={CHECKOUT_SESSION_ID}

## Commits

| Hash | Message |
|------|---------|
| c8f7192 | feat(06-06): install Stripe React SDK |
| c08c412 | feat(06-06): create Stripe checkout session endpoint |
| 818e43c | feat(06-06): create PaymentStep with Stripe Embedded Checkout |
