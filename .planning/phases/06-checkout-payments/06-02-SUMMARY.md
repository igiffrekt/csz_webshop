---
phase: 06-checkout-payments
plan: 02
subsystem: payments
tags: [stripe, webhooks, fastify, payment-processing]

# Dependency graph
requires:
  - phase: 01-infrastructure
    provides: Fastify API backend
provides:
  - Stripe SDK singleton with lazy initialization
  - Webhook handler for payment confirmation events
  - Order status updates on successful/failed payments
affects: [06-03, 06-04, 06-05, 07-admin-orders]

# Tech tracking
tech-stack:
  added: [stripe ^20.2.0, fastify-raw-body ^5.0.0]
  patterns: [lazy singleton initialization, webhook signature verification, raw body parsing]

key-files:
  created:
    - apps/api/src/lib/stripe.ts
    - apps/api/src/routes/checkout/webhook.ts
  modified:
    - apps/api/src/index.ts
    - apps/api/package.json
    - apps/api/.env.example

key-decisions:
  - "Lazy Stripe client initialization for development flexibility"
  - "Raw body plugin for webhook signature verification"
  - "API version 2025-12-15.clover (latest)"

patterns-established:
  - "Lazy singleton: Use getter function with null check for external service clients"
  - "Webhook handling: Verify signature first, then switch on event type"
  - "Order status updates: Update via Strapi API with Bearer token auth"

# Metrics
duration: 8min
completed: 2026-01-21
---

# Phase 6 Plan 2: Stripe SDK & Webhook Handler Summary

**Stripe SDK integration with webhook handler for payment confirmation via checkout.session.completed events**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-21T10:00:00Z
- **Completed:** 2026-01-21T10:08:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Stripe SDK installed with fastify-raw-body for webhook signature verification
- Lazy-initialized Stripe client singleton that allows API to start without credentials
- Webhook endpoint at POST /webhook/stripe with full signature verification
- Order status updates to 'paid' on checkout.session.completed
- Bank transfer support with async_payment_succeeded/failed handling

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Stripe SDK and fastify-raw-body** - `063ed5a` (chore)
2. **Task 2: Create Stripe client singleton** - `9f565a8` (feat)
3. **Task 3: Create Stripe webhook handler** - `c3b2196` (feat)

## Files Created/Modified
- `apps/api/src/lib/stripe.ts` - Stripe client singleton with lazy initialization
- `apps/api/src/routes/checkout/webhook.ts` - Webhook handler for payment events
- `apps/api/src/index.ts` - Register raw-body plugin and webhook routes
- `apps/api/package.json` - Added stripe and fastify-raw-body dependencies
- `apps/api/.env.example` - Added Stripe and Strapi API environment variables

## Decisions Made
- **Lazy Stripe client initialization:** Changed from eager init (throw on startup) to lazy init (throw on first use) so API can start without Stripe credentials for local development of non-payment routes
- **API version 2025-12-15.clover:** Used latest Stripe API version per SDK type definitions
- **Webhook route at /webhook/stripe:** Follows pattern of /webhook/{provider} for multiple payment provider support

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Stripe API version mismatch**
- **Found during:** Task 2 (Stripe client singleton)
- **Issue:** Plan specified API version '2024-12-18.acacia' but SDK requires '2025-12-15.clover'
- **Fix:** Updated API version to match SDK type definitions
- **Files modified:** apps/api/src/lib/stripe.ts
- **Verification:** TypeScript compiles successfully
- **Committed in:** 9f565a8 (Task 2 commit)

**2. [Rule 2 - Missing Critical] Changed Stripe client to lazy initialization**
- **Found during:** Task 2 (Stripe client singleton)
- **Issue:** Eager init throws error on startup if STRIPE_SECRET_KEY missing, blocking all API routes
- **Fix:** Changed to lazy getter pattern with proxy object for common methods
- **Files modified:** apps/api/src/lib/stripe.ts
- **Verification:** API starts without Stripe credentials, throws on first Stripe method call
- **Committed in:** c3b2196 (Task 3 commit, as part of final refinement)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 missing critical)
**Impact on plan:** Both fixes improve developer experience and correctness. No scope creep.

## Issues Encountered
None - plan executed as specified with minor API version correction.

## User Setup Required

**External services require manual configuration.** The following environment variables must be set:

| Variable | Source |
|----------|--------|
| `STRIPE_SECRET_KEY` | Stripe Dashboard > Developers > API keys > Secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard > Developers > Webhooks > Signing secret (after creating endpoint) |
| `STRAPI_API_TOKEN` | Strapi Admin > Settings > API Tokens > Create new token |

**Stripe Dashboard Configuration:**
1. Enable HUF currency: Settings > Payment methods > Currencies
2. Enable card payments: Settings > Payment methods > Cards
3. Create webhook endpoint pointing to: `https://your-api.com/webhook/stripe`
4. Subscribe to events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`

## Next Phase Readiness
- Stripe SDK ready for checkout session creation in 06-03
- Webhook handler ready to receive payment confirmations
- Order content type must be created in Strapi before webhook can update orders (06-01 dependency)

---
*Phase: 06-checkout-payments*
*Completed: 2026-01-21*
