# Phase 6: Checkout & Payments - Research

**Researched:** 2026-01-20
**Domain:** Stripe payments, Hungarian VAT, multi-step checkout, webhooks
**Confidence:** HIGH

## Summary

This phase implements the complete checkout and payment flow for a Hungarian e-commerce store using Stripe as the payment processor. The integration must handle 27% Hungarian VAT, support card payments (including Apple Pay and Google Pay), and offer bank transfer as an alternative payment method.

The recommended approach uses **Stripe Checkout Sessions API with Embedded Checkout** for the payment form, combined with **webhook-based order fulfillment**. This provides the best balance of security (PCI compliance), developer experience, and customization. The checkout flow itself should be a **multi-step form** using Zustand for state persistence (already established pattern in the codebase) with React Hook Form for validation.

All pricing calculations (VAT, shipping, discounts) MUST happen server-side in the Fastify API, consistent with the established architecture pattern. The frontend displays prices but never calculates them.

**Primary recommendation:** Use Stripe Checkout Sessions API with Embedded Checkout component, server-side PaymentIntent creation via Fastify, and webhook-based order status updates.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| stripe | ^17.x | Server-side Stripe SDK | Official Node.js SDK, TypeScript support, handles all API calls |
| @stripe/stripe-js | ^4.x | Client-side Stripe.js loader | PCI-compliant card handling, loads from Stripe CDN |
| @stripe/react-stripe-js | ^3.x | React Stripe components | Official React bindings, EmbeddedCheckout/PaymentElement |
| react-hook-form | ^7.x | Form state management | Already in codebase pattern, excellent TypeScript support |
| zod | ^3.x | Schema validation | Already used for auth forms, Hungarian error messages |
| fastify-raw-body | ^5.x | Raw body access for webhooks | Required for Stripe webhook signature verification |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| qs | ^6.x | Query string building | Already used for Strapi queries |
| zustand | ^5.x | Checkout state persistence | Multi-step form state (already in codebase) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Embedded Checkout | Stripe-hosted Checkout | Less control over UX, redirects away from site |
| Embedded Checkout | Payment Element only | More flexibility but more code, less built-in features |
| React Hook Form | Native form handling | RHF provides better UX, validation, and controlled state |

**Installation:**
```bash
# In apps/api (Fastify backend)
pnpm add stripe fastify-raw-body

# In apps/web (Next.js frontend)
pnpm add @stripe/stripe-js @stripe/react-stripe-js react-hook-form zod @hookform/resolvers
```

## Architecture Patterns

### Recommended Project Structure
```
apps/
├── api/src/
│   ├── routes/
│   │   ├── checkout/
│   │   │   ├── create-session.ts      # Create Stripe Checkout Session
│   │   │   ├── calculate-totals.ts    # VAT, shipping, discount calculations
│   │   │   └── webhook.ts             # Stripe webhook handler
│   │   └── orders/
│   │       ├── index.ts               # Order CRUD operations
│   │       └── types.ts               # Order-related types
│   └── lib/
│       └── stripe.ts                  # Stripe client singleton
├── web/src/
│   ├── app/[locale]/penztar/
│   │   ├── page.tsx                   # Checkout page (Server Component)
│   │   ├── checkout-form.tsx          # Multi-step checkout (Client Component)
│   │   ├── steps/
│   │   │   ├── shipping-step.tsx      # Shipping address selection
│   │   │   ├── billing-step.tsx       # Billing address + PO number
│   │   │   ├── summary-step.tsx       # Order summary with VAT breakdown
│   │   │   └── payment-step.tsx       # Stripe payment form
│   │   └── success/page.tsx           # Order confirmation
│   └── lib/
│       └── checkout-api.ts            # Checkout API client functions
└── cms/src/api/
    └── order/
        └── content-types/order/       # Order content type
```

### Pattern 1: Server-Side Checkout Session Creation
**What:** Create Stripe Checkout Session on server, return client_secret to frontend
**When to use:** Every checkout initiation
**Example:**
```typescript
// apps/api/src/routes/checkout/create-session.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface CreateSessionBody {
  lineItems: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
  shippingAddressId: string;
  billingAddressId?: string;
  couponCode?: string;
  poReference?: string;
}

fastify.post<{ Body: CreateSessionBody }>('/checkout/create-session', async (request) => {
  const { lineItems, shippingAddressId, couponCode, poReference } = request.body;

  // 1. Validate cart items and fetch current prices from Strapi
  // 2. Calculate totals server-side (subtotal, discount, shipping, VAT)
  // 3. Create order in Strapi with 'pending' status
  // 4. Create Stripe Checkout Session

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    mode: 'payment',
    currency: 'huf',
    locale: 'hu',
    line_items: calculatedLineItems,
    metadata: {
      order_id: strapiOrderDocumentId,
      po_reference: poReference || '',
    },
    return_url: `${process.env.FRONTEND_URL}/hu/penztar/siker?session_id={CHECKOUT_SESSION_ID}`,
  });

  return { clientSecret: session.client_secret };
});
```

### Pattern 2: Multi-Step Checkout with Zustand Persistence
**What:** Persist checkout state across steps, survive page refreshes
**When to use:** Complex checkout with multiple steps
**Example:**
```typescript
// apps/web/src/lib/store/checkout.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CheckoutState {
  step: 'shipping' | 'billing' | 'summary' | 'payment';
  shippingAddressId: string | null;
  billingAddressId: string | null;
  useSameAsBilling: boolean;
  poReference: string;
  setStep: (step: CheckoutState['step']) => void;
  setShippingAddress: (id: string) => void;
  // ... other actions
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      step: 'shipping',
      shippingAddressId: null,
      billingAddressId: null,
      useSameAsBilling: true,
      poReference: '',
      setStep: (step) => set({ step }),
      setShippingAddress: (id) => set({ shippingAddressId: id }),
      reset: () => set({
        step: 'shipping',
        shippingAddressId: null,
        billingAddressId: null,
        useSameAsBilling: true,
        poReference: '',
      }),
    }),
    { name: 'csz-checkout' }
  )
);
```

### Pattern 3: Webhook Handler with Signature Verification
**What:** Handle Stripe webhook events securely with raw body verification
**When to use:** Payment confirmation, order status updates
**Example:**
```typescript
// apps/api/src/routes/checkout/webhook.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

fastify.post('/webhook/stripe', {
  config: { rawBody: true }, // Requires fastify-raw-body plugin
}, async (request, reply) => {
  const sig = request.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      request.rawBody as string,
      sig,
      webhookSecret
    );
  } catch (err) {
    fastify.log.error(err, 'Webhook signature verification failed');
    return reply.status(400).send({ error: 'Invalid signature' });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      // Update order status in Strapi to 'paid'
      await updateOrderStatus(orderId, 'paid', {
        paymentId: session.payment_intent as string,
        paidAt: new Date().toISOString(),
      });
      break;
    }
    case 'checkout.session.async_payment_failed': {
      // Handle failed async payment (bank transfer timeout)
      const session = event.data.object as Stripe.Checkout.Session;
      await updateOrderStatus(session.metadata?.order_id, 'cancelled');
      break;
    }
  }

  return reply.status(200).send({ received: true });
});
```

### Pattern 4: Hungarian VAT Calculation
**What:** Calculate 27% VAT server-side, display gross prices
**When to use:** All price displays and order totals
**Example:**
```typescript
// apps/api/src/lib/vat.ts
const HUNGARIAN_VAT_RATE = 0.27; // 27%

interface PriceBreakdown {
  netPrice: number;      // Price without VAT
  vatAmount: number;     // VAT amount
  grossPrice: number;    // Price with VAT (what customer pays)
}

/**
 * Calculate VAT breakdown from gross price (price includes VAT)
 * Hungarian e-commerce typically displays gross prices
 */
export function calculateVatFromGross(grossPrice: number): PriceBreakdown {
  const netPrice = Math.round(grossPrice / (1 + HUNGARIAN_VAT_RATE));
  const vatAmount = grossPrice - netPrice;
  return { netPrice, vatAmount, grossPrice };
}

/**
 * Calculate order totals with VAT breakdown
 */
export function calculateOrderTotals(
  subtotal: number,      // Sum of line items (gross prices)
  shipping: number,      // Shipping cost (gross)
  discount: number       // Discount amount
): OrderTotals {
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const total = discountedSubtotal + shipping;

  // Calculate VAT from total (prices include VAT)
  const { netPrice, vatAmount } = calculateVatFromGross(total);

  return {
    subtotal,
    discount,
    shipping,
    netTotal: netPrice,
    vatAmount,
    total,
  };
}
```

### Anti-Patterns to Avoid
- **Client-side price calculation:** NEVER calculate VAT, shipping, or discounts in the browser. Always fetch calculated totals from server.
- **Storing card details:** NEVER handle raw card numbers. Always use Stripe Elements/Checkout.
- **Trusting client prices:** ALWAYS re-fetch product prices from database when creating orders.
- **JSON-parsing webhook body:** NEVER parse webhook body before signature verification. Use raw body.
- **Sync webhook processing:** ALWAYS return 200 immediately, process asynchronously if needed.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Card input form | Custom input fields | Stripe Payment Element / Embedded Checkout | PCI compliance, fraud detection, 3D Secure handling |
| Apple Pay / Google Pay | Custom wallet integrations | Stripe Express Checkout Element | Domain verification, certificate management handled |
| Payment status tracking | Polling mechanism | Stripe Webhooks | Real-time, reliable, handles edge cases |
| VAT validation | Manual calculation | Server-side calculation with audit trail | Legal compliance, consistent rounding |
| Address autocomplete | Custom API integration | Browser native or Stripe Address Element | Better UX, maintained |
| Order number generation | Random strings | Sequential with prefix | Easier customer support, legal requirements |

**Key insight:** Payment integrations have massive edge cases (declined cards, 3D Secure, network failures, duplicate payments). Stripe handles these; custom solutions miss them.

## Common Pitfalls

### Pitfall 1: Webhook Signature Verification Failure
**What goes wrong:** Stripe webhook returns 400, order status never updates
**Why it happens:** Framework parses JSON body before signature verification, changing raw body
**How to avoid:**
- Use `fastify-raw-body` plugin and access `request.rawBody`
- Register webhook route before body parser or with raw body option
- Test with Stripe CLI: `stripe listen --forward-to localhost:4000/webhook/stripe`
**Warning signs:** Signature verification errors in logs, orders stuck in 'pending'

### Pitfall 2: HUF Zero-Decimal Currency Handling
**What goes wrong:** Prices 100x wrong (1000 Ft becomes 10 Ft or 100000 Ft)
**Why it happens:** HUF is zero-decimal currency unlike USD/EUR which use cents
**How to avoid:**
- Store prices as integers in HUF (e.g., 15900 for 15,900 Ft)
- Pass same integer to Stripe (no multiplication needed for HUF)
- Verify in Stripe dashboard that amounts are correct
**Warning signs:** Suspiciously low or high order totals

### Pitfall 3: Race Condition in Order Creation
**What goes wrong:** Duplicate orders or missing orders
**Why it happens:** Webhook arrives before redirect, or user refreshes success page
**How to avoid:**
- Create order with 'pending' status BEFORE Stripe session
- Store Stripe session ID in order, use for idempotency
- Handle webhook and success page both checking/updating order
- Use database transactions for order creation
**Warning signs:** Duplicate charges, missing orders, webhook errors

### Pitfall 4: Multi-Step Form State Loss
**What goes wrong:** User loses checkout progress on refresh or back navigation
**Why it happens:** Form state not persisted, Server Components re-render
**How to avoid:**
- Use Zustand persist middleware (already established pattern)
- Store checkout state in localStorage under 'csz-checkout'
- Clear state only on successful order completion
**Warning signs:** User complaints about lost checkout progress

### Pitfall 5: Stock Validation Timing
**What goes wrong:** Order placed for out-of-stock item
**Why it happens:** Stock checked at cart time but not at checkout
**How to avoid:**
- Re-validate stock when creating Stripe session
- Lock inventory during payment (or accept oversell risk)
- Clear error messaging if stock unavailable
**Warning signs:** Orders that can't be fulfilled

### Pitfall 6: Missing Payment Method Activation
**What goes wrong:** Apple Pay or Google Pay buttons don't appear
**Why it happens:** Domain not registered in Stripe, payment methods not enabled
**How to avoid:**
- Register domain in Stripe Dashboard for Apple Pay
- Enable payment methods in Dashboard > Settings > Payment methods
- Test on real device (simulators may not show wallets)
**Warning signs:** Express Checkout Element renders empty

## Code Examples

Verified patterns from official sources:

### Embedded Checkout Component
```typescript
// apps/web/src/app/[locale]/penztar/payment-step.tsx
'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentStepProps {
  orderId: string;
  shippingAddressId: string;
  billingAddressId?: string;
  couponCode?: string;
  poReference?: string;
}

export function PaymentStep({
  orderId,
  shippingAddressId,
  billingAddressId,
  couponCode,
  poReference,
}: PaymentStepProps) {
  const fetchClientSecret = async () => {
    const response = await fetch('/api/checkout/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        shippingAddressId,
        billingAddressId,
        couponCode,
        poReference,
      }),
    });
    const { clientSecret } = await response.json();
    return clientSecret;
  };

  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{ fetchClientSecret }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
```

### Order Success Page with Session Retrieval
```typescript
// apps/web/src/app/[locale]/penztar/siker/page.tsx
import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { getOrder } from '@/lib/order-api';
import { OrderConfirmation } from './order-confirmation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect('/hu/penztar');
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);

  if (session.status !== 'complete') {
    redirect('/hu/penztar');
  }

  const orderId = session.metadata?.order_id;
  const order = await getOrder(orderId!);

  return <OrderConfirmation order={order} />;
}
```

### Fastify Raw Body Configuration
```typescript
// apps/api/src/index.ts
import Fastify from 'fastify';
import rawBody from 'fastify-raw-body';

const fastify = Fastify({ logger: true });

// Register raw body plugin for webhook signature verification
await fastify.register(rawBody, {
  field: 'rawBody',
  global: false, // Only enable where needed
  encoding: 'utf8',
  runFirst: true,
});

// Register routes
await fastify.register(import('./routes/checkout/webhook.js'), {
  prefix: '/webhook',
});
```

### Order Schema for Strapi
```json
{
  "kind": "collectionType",
  "collectionName": "orders",
  "info": {
    "singularName": "order",
    "pluralName": "orders",
    "displayName": "Order"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "orderNumber": {
      "type": "string",
      "required": true,
      "unique": true
    },
    "status": {
      "type": "enumeration",
      "enum": ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"],
      "default": "pending",
      "required": true
    },
    "user": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user"
    },
    "subtotal": {
      "type": "integer",
      "required": true
    },
    "discount": {
      "type": "integer",
      "default": 0
    },
    "shipping": {
      "type": "integer",
      "required": true
    },
    "vatAmount": {
      "type": "integer",
      "required": true
    },
    "total": {
      "type": "integer",
      "required": true
    },
    "shippingAddress": {
      "type": "json",
      "required": true
    },
    "billingAddress": {
      "type": "json"
    },
    "lineItems": {
      "type": "json",
      "required": true
    },
    "couponCode": {
      "type": "string"
    },
    "couponDiscount": {
      "type": "integer"
    },
    "poReference": {
      "type": "string",
      "maxLength": 100
    },
    "paymentMethod": {
      "type": "string"
    },
    "paymentId": {
      "type": "string"
    },
    "stripeSessionId": {
      "type": "string"
    },
    "paidAt": {
      "type": "datetime"
    },
    "notes": {
      "type": "text"
    }
  }
}
```

### Shipping Calculation
```typescript
// apps/api/src/lib/shipping.ts
interface ShippingConfig {
  baseRate: number;           // Base flat rate in HUF
  weightThreshold: number;    // Weight threshold in kg
  weightSurcharge: number;    // Additional charge per kg over threshold
  freeShippingThreshold: number; // Order total for free shipping
}

const config: ShippingConfig = {
  baseRate: 1990,             // 1,990 Ft base
  weightThreshold: 5,         // Over 5kg
  weightSurcharge: 500,       // +500 Ft per kg over 5kg
  freeShippingThreshold: 50000, // Free over 50,000 Ft
};

export function calculateShipping(
  totalWeight: number,
  orderSubtotal: number
): number {
  // Free shipping over threshold
  if (orderSubtotal >= config.freeShippingThreshold) {
    return 0;
  }

  // Base rate
  let shipping = config.baseRate;

  // Weight surcharge
  if (totalWeight > config.weightThreshold) {
    const extraKg = Math.ceil(totalWeight - config.weightThreshold);
    shipping += extraKg * config.weightSurcharge;
  }

  return shipping;
}

export function isValidShippingAddress(country: string): boolean {
  // Only Hungary supported
  return country.toLowerCase() === 'magyarorszag' ||
         country.toLowerCase() === 'magyarország' ||
         country.toLowerCase() === 'hungary';
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Stripe Checkout (redirect) | Embedded Checkout | 2024 | Better UX, no redirect |
| Payment Request Button | Express Checkout Element | 2024 | More payment methods, simpler setup |
| Sources API | PaymentIntents API | Deprecated 2024 | Sources API deprecated April 2025 |
| Manual locale handling | Stripe locale parameter | Native | `locale: 'hu'` handles Hungarian |

**Deprecated/outdated:**
- **Stripe Sources API**: Fully deprecated, use PaymentIntents
- **Payment Request Button**: Migrated to Express Checkout Element
- **Charges API**: Use PaymentIntents for all new integrations

## Open Questions

Things that couldn't be fully resolved:

1. **Bank transfer handling in Hungary**
   - What we know: Stripe supports bank transfers via customer_balance, generates virtual account numbers
   - What's unclear: Whether Hungarian bank transfers (HUF SEPA) are fully supported in Stripe's bank transfer feature
   - Recommendation: Implement manual bank transfer option with order instructions, investigate Stripe bank transfer availability for HU

2. **Invoice requirements**
   - What we know: Hungarian invoicing has strict requirements, real-time reporting to NAV
   - What's unclear: Whether separate invoicing system integration needed
   - Recommendation: Defer to accountant consultation (noted in STATE.md), implement basic order confirmation for now

3. **Express Checkout Element availability**
   - What we know: Apple Pay requires domain verification, Google Pay requires compatible browser
   - What's unclear: Success rate for Hungarian customers with wallets
   - Recommendation: Implement but don't rely on - card payment is primary

## Sources

### Primary (HIGH confidence)
- [Stripe Checkout Embedded Documentation](https://docs.stripe.com/checkout/embedded/quickstart?client=next) - Next.js integration guide
- [Stripe Webhooks Documentation](https://docs.stripe.com/webhooks) - Webhook handling and signature verification
- [Stripe Payment Element Documentation](https://docs.stripe.com/payments/payment-element) - Payment methods and configuration
- [Stripe Metadata Documentation](https://docs.stripe.com/metadata/use-cases) - Order tracking patterns

### Secondary (MEDIUM confidence)
- [Hungary VAT Guide - Taxually](https://www.taxually.com/manuals/hungary) - VAT rates and compliance
- [Payments in Hungary - Stripe](https://stripe.com/resources/more/payments-in-hungary) - Hungarian payment landscape
- [Fastify Raw Body GitHub Issue](https://github.com/fastify/fastify/issues/1965) - Raw body handling for webhooks

### Tertiary (LOW confidence)
- Various Medium articles on multi-step checkout UX - General patterns
- Stack Overflow discussions on Stripe webhook issues - Troubleshooting reference

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Stripe documentation, well-established patterns
- Architecture: HIGH - Follows existing codebase patterns (Zustand, Fastify, Server Components)
- VAT calculation: HIGH - Hungarian 27% rate is fixed, calculation is straightforward
- Webhook handling: HIGH - Official Stripe documentation with code examples
- Bank transfer: MEDIUM - Stripe supports it but HU availability needs verification
- Pitfalls: HIGH - Well-documented issues from Stripe docs and community

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (30 days - Stripe API stable, patterns well-established)
