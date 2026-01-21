---
phase: "06"
plan: "01"
subsystem: "orders"
tags: ["strapi", "content-type", "order", "typescript", "api"]
dependency-graph:
  requires: ["05-07"]
  provides: ["order-content-type", "order-typescript-interface"]
  affects: ["06-02", "06-03", "06-04", "06-05", "06-06", "06-07"]
tech-stack:
  added: []
  patterns: ["JSON-snapshot-addresses", "JSON-line-items", "integer-pricing-HUF"]
key-files:
  created:
    - "apps/cms/src/api/order/content-types/order/schema.json"
    - "apps/cms/src/api/order/controllers/order.ts"
    - "apps/cms/src/api/order/routes/order.ts"
    - "apps/cms/src/api/order/services/order.ts"
  modified:
    - "packages/types/src/index.ts"
    - "apps/cms/README.md"
    - "apps/web/src/app/[locale]/fiok/rendelesek/[id]/page.tsx"
decisions:
  - "draftAndPublish:false for orders - no draft workflow needed"
  - "JSON for addresses and line items - immutable snapshots at order time"
  - "vatAmount field name (not tax) - matches Hungarian VAT terminology"
  - "Authenticated findOne+create only - no order listing for customers"
metrics:
  duration: "15min"
  completed: "2026-01-21"
---

# Phase 6 Plan 01: Order Content Type Summary

Order content type created in Strapi with JSON snapshots for addresses and line items, all pricing fields, and payment tracking.

## What Was Built

### Task 1: Order Content Type in Strapi

Created complete Order collection type with all fields required for checkout and payment processing:

**Identification:**
- `orderNumber` - Unique sequential ID (e.g., "CSZ-2026-00001")
- `status` - Enumeration: pending, paid, processing, shipped, delivered, cancelled, refunded

**Pricing (all integers in HUF):**
- `subtotal` - Sum of line items
- `discount` - Total discount amount
- `shipping` - Shipping cost
- `vatAmount` - 27% Hungarian VAT
- `total` - Final amount

**Data Snapshots (JSON):**
- `shippingAddress` - Address snapshot frozen at order time
- `billingAddress` - Optional billing address with B2B fields
- `lineItems` - Array of OrderLineItem objects

**Payment:**
- `paymentMethod` - Card, bank transfer, etc.
- `paymentId` - Stripe payment intent ID
- `stripeSessionId` - Checkout session for idempotency
- `paidAt` - Payment confirmation timestamp

**B2B:**
- `poReference` - Purchase order reference number
- `couponCode` / `couponDiscount` - Applied coupon tracking

### Task 2: TypeScript Interface Updates

Enhanced Order interface in @csz/types:

```typescript
// New address snapshot types
export interface OrderAddressSnapshot {
  recipientName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface BillingAddressSnapshot extends OrderAddressSnapshot {
  companyName?: string;
  vatNumber?: string;
}

// Updated Order interface
export interface Order {
  // ... all fields including:
  vatAmount: number;      // Renamed from tax
  poReference?: string;   // B2B support
  stripeSessionId?: string; // Stripe tracking
  notes?: string;         // Internal notes
}
```

Fixed order detail page to use `vatAmount` instead of `tax`.

### Task 3: Permission Documentation

Updated CMS README with complete permission matrix:

| Role | findOne | create | update | delete |
|------|---------|--------|--------|--------|
| Public | - | - | - | - |
| Authenticated | YES* | YES | - | - |
| Store Manager | YES | YES | YES | YES |

*With note about implementing user-filtered findOne controller.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| draftAndPublish: false | Orders don't need draft workflow |
| JSON for addresses | Immutable snapshots at order time (address changes don't affect past orders) |
| JSON for line items | Same immutability - prices frozen at checkout |
| vatAmount field name | Matches Hungarian VAT terminology |
| Integer pricing in HUF | No decimal issues, consistent with existing patterns |
| Authenticated findOne+create | Customers view own orders, checkout creates; no listing |

## Deviations from Plan

### Prior Work Discovered

**Task 1 Order content type was already created in commit e7ef62e** from a previous session. The schema was identical to plan requirements. No deviation in actual implementation - just noted that work had already been done.

### Auto-fixed Issue

**[Rule 1 - Bug] Fixed tax to vatAmount reference**

- **Found during:** Task 2 TypeScript update
- **Issue:** Order detail page referenced `order.tax` but field was renamed to `vatAmount`
- **Fix:** Updated reference in order detail page
- **Files modified:** apps/web/src/app/[locale]/fiok/rendelesek/[id]/page.tsx
- **Commit:** a3fcc63

## Commits

| Hash | Type | Description |
|------|------|-------------|
| e7ef62e | feat | Create Order content type (prior session) |
| a3fcc63 | feat | Update Order TypeScript interface |
| ae80fb5 | docs | Document Order API permissions |

## Verification Results

- [x] Strapi builds: `pnpm --filter @csz/cms build` succeeds
- [x] TypeScript compiles: Web app builds without errors
- [x] Order schema contains all required fields
- [x] Order interface matches Strapi schema
- [x] Permission documentation complete

## Next Phase Readiness

**Ready for 06-02:** Stripe Integration

The Order content type provides:
- `stripeSessionId` for checkout session tracking
- `paymentId` for payment intent reference
- `paidAt` for payment confirmation timestamp
- `status` enumeration for order state management

No blockers identified.
