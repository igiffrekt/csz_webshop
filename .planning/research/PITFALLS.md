# Domain Pitfalls

**Domain:** Next.js + Strapi + Stripe Ecommerce (Hungarian B2B/B2C)
**Researched:** 2026-01-19
**Confidence:** HIGH (verified against official docs and community reports)

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or major production failures.

### Pitfall 1: Strapi Schema Changes Causing Data Loss

**What goes wrong:** Modifying content type schemas in production (adding/removing fields, changing draft settings) can cause Strapi to delete all records in affected tables. Users have reported losing ~68,000 records after routine schema modifications.

**Why it happens:** Strapi syncs database tables with content-type schemas on restart. Unknown tables or mismatched schemas trigger automatic deletion. There is no down migration support - rollbacks must be done manually.

**Consequences:**
- Complete data loss in affected content types
- No automatic recovery
- Production downtime during manual restoration

**Warning signs:**
- Schema files modified directly in production
- No staging environment for testing changes
- Missing database backups before deployments

**Prevention:**
1. NEVER modify content types in production - use Development -> Staging -> Production flow
2. Always backup database before ANY deployment
3. Test all schema changes in staging with production data copy
4. Use migration files with `strapi.db.transaction()` wrapper for custom migrations
5. Enable automated backups before each deployment

**When to address:** Phase 1 (Infrastructure Setup) - establish CI/CD pipeline with mandatory backup step

**Sources:**
- [Strapi Data Loss Issue #19141](https://github.com/strapi/strapi/issues/19141)
- [Strapi Database Migrations Docs](https://docs.strapi.io/cms/database-migrations)

---

### Pitfall 2: Stripe Webhook Signature Verification Failures

**What goes wrong:** Webhooks fail silently in production. Orders appear paid on Stripe but database shows unpaid. Payment success pages work but fulfillment never triggers.

**Why it happens:**
- Using `request.json()` instead of `request.text()` for raw body
- Wrong webhook secret (test vs production, or outdated after endpoint recreation)
- Middleware/route configuration blocking webhook paths
- Next.js App Router body parsing interfering with signature verification

**Consequences:**
- Orders marked paid but never fulfilled
- Customer complaints about missing orders
- Manual reconciliation required
- Revenue loss if not detected quickly

**Warning signs:**
- Success page shows but order status doesn't update
- Stripe Dashboard shows webhook failures (non-200 responses)
- "Signature verification failed" errors in logs
- Works locally with Stripe CLI but fails in production

**Prevention:**
1. Use `await request.text()` for webhook body (NOT `request.json()`)
2. Store webhook secret per environment (dev/staging/prod)
3. Exclude webhook routes from middleware matchers: `'/api((?!/webhook).*)'`
4. Implement webhook event logging before processing
5. Set up Stripe Dashboard alerts for failed webhooks
6. Use idempotency keys to handle retries safely

**When to address:** Phase 3 (Payment Integration) - critical path, requires extensive testing

**Code example (correct approach):**
```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  const body = await request.text(); // NOT request.json()
  const signature = request.headers.get('stripe-signature')!;

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  // Process event...
}
```

**Sources:**
- [Next.js Stripe Webhook Discussion #48885](https://github.com/vercel/next.js/discussions/48885)
- [Stripe Webhook Troubleshooting](https://support.stripe.com/questions/troubleshooting-webhook-delivery-issues)

---

### Pitfall 3: WooCommerce Migration Data Loss

**What goes wrong:** Product data, customer history, order records, or SEO rankings lost during migration. Store launches with incomplete data or broken URLs.

**Why it happens:**
- Data model mismatches between WooCommerce and Strapi
- Missing 301 redirects for changed URLs
- Incomplete content audit before migration
- Session/cart handling breaks during transition
- Differences in taxonomy structure not mapped

**Consequences:**
- Lost customer purchase history
- Broken product relationships
- SEO rankings drop (traffic loss)
- Customer complaints about missing order history
- B2B customers lose pricing agreements

**Warning signs:**
- No complete URL inventory created before migration
- Migration script runs but record counts don't match
- SEO tool shows orphaned pages or broken links
- Customer logins fail after migration

**Prevention:**
1. Create complete URL inventory with `screaming frog` before migration
2. Map WooCommerce taxonomies to Strapi content types explicitly
3. Implement 301 redirects for ALL changed URLs
4. Validate record counts: WooCommerce export count = Strapi import count
5. Test customer login migration in staging with real accounts
6. Preserve B2B customer pricing in migration scripts
7. Run post-migration validation comparing source and target data

**When to address:** Phase 5 (Migration) - dedicated phase with rollback plan

**Sources:**
- [WooCommerce Headless Migration Guide](https://wooninjas.com/headless-woocommerce-migration/)
- [WordPress Migration SEO Preservation](https://pagepro.co/blog/wordpress-cms-migration-seo/)

---

### Pitfall 4: Motion/GSAP Animations Breaking SSR Hydration

**What goes wrong:** Animations work in development but break in production. Layout shifts, flash of unstyled content, or complete hydration failures. Core Web Vitals scores plummet.

**Why it happens:**
- GSAP/Motion rely on browser APIs (`window`, `document`) unavailable during SSR
- AnimatePresence conflicts with CSS Modules in production builds
- Shared layout animations broken in Next.js App Router
- Heavy JS execution blocking LCP (target: <2.5s)
- Animations causing Cumulative Layout Shift (CLS)

**Consequences:**
- Poor Core Web Vitals = SEO ranking drop
- Janky animations on initial load
- Hydration mismatches causing React errors
- Mobile users see broken layouts

**Warning signs:**
- "window is not defined" errors during build
- Development looks smooth, production looks janky
- Lighthouse CLS score > 0.1
- Layout "jumps" after page loads

**Prevention:**
1. Push `'use client'` directive as far down component tree as possible
2. Isolate animated elements into small Client Components
3. Use `motion/react` import (not `framer-motion`) for Next.js 15+
4. Use `will-change` CSS property on animated elements
5. Use `autoAlpha` instead of `opacity` for GSAP fades
6. Avoid animating layout-affecting properties (`width`, `height`, `margin`)
7. Use Tailwind CSS instead of CSS Modules with AnimatePresence
8. Test production build locally before deployment

**When to address:** Phase 2 (Frontend Foundation) - establish animation architecture early

**Code example (correct GSAP setup):**
```typescript
// components/AnimatedSection.tsx
'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

export function AnimatedSection({ children }) {
  const container = useRef(null);

  useGSAP(() => {
    gsap.from('.animate-item', {
      autoAlpha: 0, // Better than opacity
      y: 50,
      stagger: 0.1,
    });
  }, { scope: container });

  return <div ref={container}>{children}</div>;
}
```

**Sources:**
- [GSAP Next.js Performance Issues Forum](https://gsap.com/community/forums/topic/34822-gsap-animation-causing-performance-issues-nextjs/)
- [Optimizing GSAP in Next.js 15](https://medium.com/@thomasaugot/optimizing-gsap-animations-in-next-js-15-best-practices-for-initialization-and-cleanup-2ebaba7d0232)
- [Motion React Upgrade Guide](https://motion.dev/docs/react-upgrade-guide)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or degraded UX.

### Pitfall 5: Strapi Self-Hosted Operational Burden

**What goes wrong:** Team underestimates maintenance overhead. Security patches pile up. Performance degrades under load. Scaling becomes manual firefighting.

**Why it happens:**
- Self-hosted Strapi requires 312-1,300 developer hours annually for security patching alone
- SQLite default database not suitable for production (data wiped on rebuild)
- No automatic scaling
- Media asset management requires separate configuration
- pnpm breaks native modules in Kubernetes deployments

**Consequences:**
- Security vulnerabilities accumulate
- Performance issues during traffic spikes
- Developer time consumed by ops instead of features
- Media uploads fail or get lost

**Warning signs:**
- Using SQLite in production (check `.tmp/data.db`)
- No monitoring/alerting set up
- Using pnpm with Kubernetes
- No CDN for media assets
- Manual deployments

**Prevention:**
1. Use PostgreSQL or MySQL from day one (NOT SQLite)
2. Use npm instead of pnpm for Kubernetes deployments
3. Set up monitoring (health checks, response times, error rates)
4. Configure separate media storage (S3, Cloudinary)
5. Use pm2 for process management in production
6. Document runbooks for common operations
7. Consider Strapi Cloud if team <3 developers

**Minimum production setup:**
- Node.js v18/20/22 LTS
- PostgreSQL 14+ or MySQL 8+
- 4GB RAM, 2 CPU cores minimum
- Reverse proxy (nginx)
- SSL certificate
- Automated backups

**When to address:** Phase 1 (Infrastructure Setup) - foundational decision

**Sources:**
- [Strapi Self-Hosting vs Managed](https://strapi.io/blog/self-hosting-vs-managed-hosting)
- [Strapi Deployment Docs](https://docs.strapi.io/cms/deployment)

---

### Pitfall 6: Hungarian VAT and B2B Pricing Complexity

**What goes wrong:** Tax calculations incorrect for B2B vs B2C. Invoices missing required Hungarian fields. VAT number validation missing. B2B customers see wrong prices.

**Why it happens:**
- Hungarian VAT (27%) requires specific invoice fields
- B2B intra-EU requires reverse charge handling
- Mixed B2B/B2C requires customer-type-aware pricing
- Stripe Tax helps but doesn't solve invoice compliance
- 2025 ViDA changes affect e-invoicing requirements

**Consequences:**
- Tax authority penalties
- Invalid invoices for B2B customers
- Incorrect margins on B2B sales
- Manual invoice correction overhead
- Losing B2B customers to compliant competitors

**Warning signs:**
- Single price shown regardless of customer type
- No VAT number collection for B2B
- Invoices generated without required Hungarian fields
- No reverse charge logic for EU B2B

**Prevention:**
1. Implement customer type detection early (B2B vs B2C)
2. Validate EU VAT numbers via VIES API
3. Store both net and gross prices, calculate display price by customer type
4. Use Stripe Tax but verify Hungarian compliance separately
5. Partner with Hungarian accountant for invoice template validation
6. Implement reverse charge for intra-EU B2B
7. Track 2025-2030 ViDA changes for e-invoicing requirements

**Data model requirements:**
```
Product:
  - price_net: number (base price)
  - vat_rate: number (27% default for Hungary)

Customer:
  - type: 'B2B' | 'B2C'
  - vat_number: string (for B2B)
  - country: string (for reverse charge determination)
```

**When to address:** Phase 3 (Payment Integration) - requires tax logic before launch

**Sources:**
- [Stripe EU VAT Documentation](https://docs.stripe.com/tax/supported-countries/european-union)
- [VAT in Digital Age (ViDA) Overview](https://stripe.com/resources/more/vida)

---

### Pitfall 7: Cart State Synchronization Failures

**What goes wrong:** Items disappear from cart. Prices change between cart and checkout. Inventory shows available but order fails. Cart state lost on page refresh.

**Why it happens:**
- Cart stored only in client state (lost on refresh)
- No real-time inventory validation
- Price cached at add-to-cart time, not re-validated at checkout
- Session handling breaks across devices
- API latency causes race conditions

**Consequences:**
- Abandoned carts from frustration
- Overselling (selling items not in stock)
- Price discrepancies leading to disputes
- Lost cross-device shopping sessions

**Warning signs:**
- Cart empty after page refresh
- "Item no longer available" at checkout
- Price different at checkout than product page
- Cart contents different across devices for same user

**Prevention:**
1. Store cart server-side (Strapi or Redis)
2. Re-validate inventory at checkout initiation
3. Re-fetch prices at checkout (don't trust cached prices)
4. Implement optimistic UI with server reconciliation
5. Use WebSocket or polling for real-time inventory updates
6. Associate cart with user ID for cross-device sync

**Cart validation flow:**
```
Add to Cart -> Store in Server Cart -> Display (optimistic)
                     |
Checkout Start -> Validate Inventory -> Validate Prices -> Create Order
                     |                      |
              (fail: show error)    (change: show updated price)
```

**When to address:** Phase 4 (Ecommerce Features) - before payment integration

**Sources:**
- [Inventory Management in Headless](https://www.skunexus.com/ebooks/ecommerce-headless/chapter-8)
- [Headless Commerce Strategy](https://www.netsolutions.com/insights/headless-commerce-strategy/)

---

### Pitfall 8: Stripe Timeout and Duplicate Processing

**What goes wrong:** Webhook handlers take too long. Stripe retries. Order gets processed multiple times. Customer charged once but receives multiple shipments.

**Why it happens:**
- Stripe expects webhook response within 5 seconds
- Heavy processing (inventory update, email, PDF generation) exceeds timeout
- No idempotency checking
- Stripe retries failed webhooks for up to 3 days

**Consequences:**
- Duplicate orders in database
- Multiple shipments sent
- Inventory counts wrong
- Customer complaints

**Warning signs:**
- Same order appearing multiple times
- Webhook logs showing retries
- Order processing taking >5 seconds
- No idempotency key tracking

**Prevention:**
1. Return 200 immediately, process asynchronously (queue)
2. Store and check `event.id` before processing (idempotency)
3. Use database transactions for order creation
4. Move heavy operations (email, PDF) to background jobs
5. Set up dead letter queue for failed processing

**Architecture pattern:**
```
Webhook Received -> Validate Signature -> Check Idempotency Key
        |                                        |
        |                              (if seen: return 200, skip)
        |                                        |
        +-----> Return 200 -----> Queue Job -----> Process Order
                                              |
                                    (inventory, email, fulfillment)
```

**When to address:** Phase 3 (Payment Integration) - design webhook architecture upfront

**Sources:**
- [Stripe Webhook Best Practices](https://support.stripe.com/questions/troubleshooting-webhook-delivery-issues)
- [Stripe + Next.js 15 Complete Guide](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/)

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable without major rework.

### Pitfall 9: Strapi Plugin Compatibility Issues

**What goes wrong:** Plugins break after Strapi updates. Essential functionality unavailable without plugins. Community plugins unmaintained.

**Prevention:**
- Pin plugin versions in package.json
- Test plugin updates in staging before production
- Prefer official plugins over community
- Have fallback plan for critical plugin features

**When to address:** Phase 1 - evaluate plugin needs during setup

---

### Pitfall 10: Next.js Middleware Blocking API Routes

**What goes wrong:** Authentication middleware blocks webhook routes. API routes return 401/403 unexpectedly.

**Prevention:**
- Use explicit matcher patterns excluding webhooks
- Test all API routes with middleware enabled
- Log middleware execution for debugging

**When to address:** Phase 2 - when setting up authentication

---

### Pitfall 11: Environment Variable Mismatch

**What goes wrong:** Works locally, fails in production. Wrong API keys used. Secrets exposed in client bundles.

**Prevention:**
- Use `NEXT_PUBLIC_` prefix only for client-safe vars
- Verify all env vars exist in production before deploy
- Use different Stripe keys per environment
- Never commit `.env` files

**When to address:** Phase 1 - establish env management pattern

---

### Pitfall 12: Content Migration Timing

**What goes wrong:** Schema and data get out of sync during migration. Foreign key constraints fail.

**Prevention:**
- Always restore schema before data
- Create placeholder foreign key records first
- Use transactions for data imports
- Maintain detailed migration logs

**When to address:** Phase 5 - during WooCommerce migration

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| Phase 1: Infrastructure | #5 Strapi Ops Burden | Choose PostgreSQL, set up monitoring, automate backups |
| Phase 2: Frontend | #4 Animation SSR Issues | Establish animation architecture with `use client` isolation |
| Phase 3: Payments | #2 Webhook Failures, #6 VAT Complexity, #8 Timeouts | Test webhooks extensively, implement idempotency, validate Hungarian compliance |
| Phase 4: Ecommerce | #7 Cart Sync | Server-side cart, inventory validation at checkout |
| Phase 5: Migration | #1 Schema Data Loss, #3 WooCommerce Loss | Staging environment, complete backups, URL inventory |
| Phase 6: Launch | All above | Pre-launch checklist verifying each pitfall addressed |

---

## Pre-Launch Checklist

Before going live, verify:

**Strapi:**
- [ ] Using PostgreSQL (not SQLite)
- [ ] Backups automated and tested
- [ ] Media assets on CDN
- [ ] Admin panel built for production (`npm run build`)
- [ ] Environment-specific API tokens configured

**Payments:**
- [ ] Production Stripe keys configured
- [ ] Webhook endpoint registered in Stripe Dashboard
- [ ] Webhook signature verification working
- [ ] Idempotency keys implemented
- [ ] Test purchase completed end-to-end
- [ ] Hungarian VAT compliance verified with accountant

**Frontend:**
- [ ] Production build tested locally
- [ ] Core Web Vitals passing (LCP <2.5s, CLS <0.1)
- [ ] No hydration errors in console
- [ ] Cart persists across refresh
- [ ] Works on mobile

**Migration:**
- [ ] All WooCommerce data imported
- [ ] Record counts validated
- [ ] 301 redirects in place
- [ ] SEO audit passed
- [ ] Customer logins working

---

## Sources

### Official Documentation
- [Strapi Deployment](https://docs.strapi.io/cms/deployment)
- [Strapi Database Migrations](https://docs.strapi.io/cms/database-migrations)
- [Stripe EU VAT](https://docs.stripe.com/tax/supported-countries/european-union)
- [Motion React Upgrade Guide](https://motion.dev/docs/react-upgrade-guide)

### Community Reports
- [Strapi Data Loss Issue #19141](https://github.com/strapi/strapi/issues/19141)
- [Next.js Stripe Webhook Discussion #48885](https://github.com/vercel/next.js/discussions/48885)
- [GSAP Next.js Performance Forum](https://gsap.com/community/forums/topic/34822-gsap-animation-causing-performance-issues-nextjs/)
- [Strapi Production Readiness Discussion](https://forum.strapi.io/t/is-strapi-production-ready-to-self-host/39982)

### Guides and Best Practices
- [WooCommerce Headless Migration](https://wooninjas.com/headless-woocommerce-migration/)
- [Stripe + Next.js 15 Guide](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/)
- [Optimizing GSAP in Next.js 15](https://medium.com/@thomasaugot/optimizing-gsap-animations-in-next-js-15-best-practices-for-initialization-and-cleanup-2ebaba7d0232)
- [WordPress Migration SEO](https://pagepro.co/blog/wordpress-cms-migration-seo/)
