# Stack Research: Hungarian Fire Safety Equipment Ecommerce

**Project:** CSZ Webshop - Fire safety equipment ecommerce
**Domain:** B2B/B2C ecommerce, Hungarian market
**Researched:** 2026-01-19
**Overall Confidence:** HIGH

---

## Executive Summary

This document recommends the 2025/2026 technology stack for building a Next.js ecommerce platform with Strapi CMS, Stripe payments, and expressive animations. The stack prioritizes:

1. **Type safety end-to-end** - TypeScript everywhere, Zod validation
2. **Performance** - Edge-ready components, optimized animations
3. **Developer experience** - Modern tooling, minimal boilerplate
4. **Hungarian market compliance** - HUF currency, 27% VAT, localization

---

## Frontend Stack

### Core Framework

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Next.js** | 16.1.x | React framework with App Router | HIGH |
| **React** | 19.x | UI library (bundled with Next.js) | HIGH |
| **TypeScript** | 5.7.x | Type safety | HIGH |

**Rationale:** Next.js 16.1.x (stable as of Dec 2025) with App Router is the production standard. Server Components by default, Turbopack as default bundler, and excellent SSR/ISR support for ecommerce SEO. The App Router provides better layouts, loading states, and error boundaries than Pages Router.

**Source:** [Next.js Official Documentation](https://nextjs.org/docs/getting-started/installation)

### Styling

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Tailwind CSS** | 4.x | Utility-first CSS framework | HIGH |
| **shadcn/ui** | latest | Component primitives (copy-paste, not dependency) | HIGH |

**Rationale:** Tailwind CSS v4 (released Jan 2025) features the Oxide engine written in Rust - 5x faster full builds, 100x faster incremental builds. CSS-first configuration, automatic content detection, and native cascade layers. shadcn/ui provides accessible, customizable components that you own (not a dependency).

**Why Tailwind v4:**
- Single CSS import: `@import "tailwindcss"`
- No more `tailwind.config.js` - configure in CSS
- OKLCH color space for vibrant colors
- P3 wide-gamut display support
- First-party Vite plugin

**Sources:**
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)

### Animation Libraries

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Motion** | 12.x | Component animations, gestures, layout transitions | HIGH |
| **GSAP** | 3.14.x | Scroll-driven animations, complex sequences | HIGH |
| **@gsap/react** | latest | GSAP React integration hook | HIGH |

**Motion (formerly Framer Motion):**
- Hybrid engine: JavaScript + native browser APIs for 120fps GPU-accelerated animations
- Built-in gestures, springs, layout transitions, scroll-linked effects
- 12+ million monthly npm downloads
- TypeScript-first, tree-shakable

**GSAP + ScrollTrigger:**
- Industry standard for scroll-driven animations
- Now 100% FREE (including ScrollTrigger, ScrollSmoother, SplitText) after Webflow acquisition
- Zero dependencies, framework-agnostic
- Use `useGSAP` hook from `@gsap/react` for proper cleanup

**Usage Pattern:**
- Motion: Component enter/exit, hover states, layout changes, micro-interactions
- GSAP: Scroll-triggered reveals, complex timelines, parallax effects, text animations

**Sources:**
- [Motion.dev](https://motion.dev/)
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [GSAP npm](https://www.npmjs.com/package/gsap)

### State Management

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **TanStack Query** | 5.x | Server state (API data, caching) | HIGH |
| **Zustand** | 5.x | Client state (cart, UI) | HIGH |
| **nuqs** | 2.5.x | URL state (filters, pagination) | HIGH |

**Rationale:** Different tools for different state types:

- **TanStack Query:** Server data fetching, caching, background updates. Essential for product lists, cart syncing.
- **Zustand:** Lightweight (~1KB), simple API for cart state, UI toggles, user preferences. No boilerplate.
- **nuqs:** Type-safe URL query parameters. Perfect for product filters, search, pagination. Shareable URLs. 5.5KB, zero dependencies.

**Why not Redux:** Overkill for this project size. Zustand + TanStack Query covers all needs with less complexity.

**Sources:**
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [nuqs](https://nuqs.dev/)

### Form Handling & Validation

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **React Hook Form** | 7.x | Form state management | HIGH |
| **Zod** | 3.x | Schema validation | HIGH |
| **@hookform/resolvers** | 3.x | RHF + Zod integration | HIGH |

**Rationale:** React Hook Form with Zod is the 2025 standard:
- Minimal re-renders (uncontrolled inputs)
- TypeScript inference from Zod schemas (`z.infer<typeof schema>`)
- Reuse validation schemas on client AND server (API routes, Server Actions)
- shadcn/ui Form component built on this stack

**Pattern:**
```typescript
const schema = z.object({
  email: z.string().email(),
  quantity: z.number().min(1).max(100),
});
type FormData = z.infer<typeof schema>;
```

**Sources:**
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [shadcn/ui Forms](https://ui.shadcn.com/docs/forms/react-hook-form)

### Internationalization

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **next-intl** | 4.x | i18n for Next.js App Router | HIGH |

**Rationale:** next-intl is the leading i18n solution for Next.js (931K weekly downloads):
- ICU message syntax (plurals, interpolation, rich text)
- Automatic date/time/number formatting via `Intl` APIs
- Hungarian locale support (`hu-HU`)
- Server Components compatible
- TypeScript-first with type-safe message keys

**Hungarian-specific considerations:**
- Number format: `1 234 567,89` (space thousands, comma decimal)
- Currency: `12 345 Ft` or `12 345 HUF`
- Date format: `2025. január 19.` (YYYY. MMMM DD.)

**Source:** [next-intl Documentation](https://next-intl.dev/)

---

## Backend API Stack

### Runtime & Framework

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Node.js** | 22.x LTS | Runtime | HIGH |
| **Fastify** | 5.x | Web framework | HIGH |
| **TypeScript** | 5.7.x | Type safety | HIGH |

**Why Fastify over Express:**
- 2-3x faster than Express (optimized JSON serialization)
- Built-in schema validation (JSON Schema)
- First-class TypeScript support
- Plugin architecture for modularity
- Better async/await handling

**Why Fastify over Hono:**
- Hono is edge-first (better for Cloudflare Workers)
- Fastify has larger ecosystem, more battle-tested for traditional backends
- Better database adapter support
- More familiar for most teams

**Alternative considered:** Hono for edge deployment, but Fastify better suits a dedicated Node.js backend with database connections.

**Sources:**
- [Fastify](https://fastify.dev/)
- [Framework Comparison 2025](https://levelup.gitconnected.com/hono-vs-express-vs-fastify-the-2025-architecture-guide-for-next-js-5a13f6e12766)

### Database & ORM

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **PostgreSQL** | 16.x | Primary database | HIGH |
| **Drizzle ORM** | 0.38.x | TypeScript ORM | MEDIUM |

**Why PostgreSQL:**
- Industry standard for ecommerce
- JSONB for flexible product attributes
- Full-text search for Hungarian language
- Excellent hosting options (Neon, Supabase, Railway)

**Why Drizzle over Prisma:**
- **Bundle size:** ~7KB vs Prisma's Rust engine binary
- **Cold starts:** Negligible vs Prisma's 100-200ms engine spawn
- **SQL control:** Write SQL-like TypeScript, no magic
- **Edge compatible:** Works in serverless/edge environments

**Trade-off acknowledged:** Prisma has better DX for complex relations and easier learning curve. Drizzle requires more SQL knowledge but gives better performance and control.

**Sources:**
- [Drizzle ORM](https://orm.drizzle.team/)
- [Drizzle vs Prisma 2025](https://www.bytebase.com/blog/drizzle-vs-prisma/)

### Authentication

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Auth.js (NextAuth v5)** | 5.x | Authentication | HIGH |

**Rationale:** Auth.js v5 is the rewritten NextAuth:
- Edge-first design (works in middleware)
- Single `auth()` function call
- Built-in providers (Google, GitHub, credentials)
- JWT or database sessions
- Environment variable auto-inference (`AUTH_*`)

**For ecommerce:** Use JWT strategy for performance, implement refresh token rotation, consider database sessions only for "sign out everywhere" requirement.

**Source:** [Auth.js Documentation](https://authjs.dev/)

---

## CMS Stack (Strapi)

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Strapi** | 5.x | Headless CMS | HIGH |
| **PostgreSQL** | 16.x | Strapi database | HIGH |

**Strapi 5 Features (GA March 2024):**
- 100% TypeScript codebase
- Draft & Publish system
- Content History (version control)
- Vite bundler (faster builds)
- Simplified API response format
- Built-in i18n plugin

**Recommended Strapi Plugins:**
- **@strapi/plugin-i18n** - Internationalization (Hungarian + English)
- **@strapi/plugin-seo** - SEO metadata management
- **@strapi/plugin-upload** - Media management (or Cloudinary integration)
- **strapi-plugin-sentry** - Error tracking

**Database:** Use PostgreSQL for production (not SQLite). Can share a PostgreSQL instance with the backend API on separate schemas.

**Sources:**
- [Strapi 5](https://strapi.io/five)
- [Strapi Market](https://market.strapi.io/)

---

## Payment Stack (Stripe)

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **stripe** (Node.js SDK) | 17.x | Server-side Stripe API | HIGH |
| **@stripe/stripe-js** | 4.x | Client-side Stripe.js | HIGH |
| **@stripe/react-stripe-js** | 3.x | React components | HIGH |

**Stripe API Version:** `2025-12-15.clover` (latest stable)

**Implementation Pattern:**
1. **Checkout Session:** Server-side creation via Server Actions or API routes
2. **Stripe Elements:** Payment Element for card + wallet payments
3. **Webhooks:** Essential for order fulfillment (signature verification required)

**Payment Methods for Hungary:**
- Card payments (Visa, Mastercard)
- Apple Pay & Google Pay (via Payment Element)
- SEPA Direct Debit (optional, for B2B)

**Hungarian VAT Handling:**
- Use Stripe Tax or calculate 27% VAT server-side
- Display prices including VAT (Hungarian requirement)
- Store VAT separately for invoicing

**Security Best Practices:**
- Never log full card numbers
- Webhook signature verification mandatory
- Use test mode extensively
- Idempotency keys for retries

**Sources:**
- [Stripe Node.js SDK](https://stripe.com/docs/api?lang=node)
- [Stripe + Next.js Guide](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/)

---

## Infrastructure & Deployment

### Recommended Architecture

| Component | Platform | Rationale |
|-----------|----------|-----------|
| **Next.js Frontend** | Vercel | Best-in-class Next.js optimization |
| **Node.js Backend API** | Railway | Built-in PostgreSQL, simple deploys |
| **Strapi CMS** | Railway | Co-locate with backend DB |
| **PostgreSQL** | Railway | Managed database |
| **Media/Assets** | Cloudinary | CDN, image optimization |

**Why this split:**
- **Vercel for Next.js:** Zero-config, automatic optimizations, preview deployments, Edge Functions
- **Railway for backend:** Docker support, built-in databases, pay-per-use, no cold starts (long-running)
- **Cloudinary:** Dedicated image CDN, automatic WebP/AVIF, responsive images

**Alternative:** All-in-one on Railway if budget is primary concern. Render also viable.

**Cost Estimate (monthly):**
- Vercel Pro: ~$20
- Railway (API + Strapi + DB): ~$30-50
- Cloudinary: Free tier sufficient initially
- **Total:** ~$50-70/month for production

### Caching Strategy

| Layer | Implementation |
|-------|----------------|
| **Browser** | Cache-Control headers, stale-while-revalidate |
| **CDN** | Vercel Edge Cache, ISR for product pages |
| **API** | TanStack Query client cache (5-minute stale time) |
| **Database** | Connection pooling, query result caching |

**ISR (Incremental Static Regeneration):**
- Product pages: `revalidate: 60` (1 minute)
- Category pages: `revalidate: 300` (5 minutes)
- Static pages: `revalidate: 3600` (1 hour)

**Sources:**
- [Railway](https://railway.app/)
- [Vercel](https://vercel.com/)
- [Railway vs Vercel Benchmarks](https://blog.railway.com/p/server-rendering-benchmarks-railway-vs-cloudflare-vs-vercel)

---

## Development Tooling

| Tool | Version | Purpose |
|------|---------|---------|
| **pnpm** | 9.x | Package manager (faster, disk efficient) |
| **ESLint** | 9.x | Linting (flat config) |
| **Prettier** | 3.x | Code formatting |
| **Vitest** | 2.x | Unit testing |
| **Playwright** | 1.49.x | E2E testing |
| **Husky** | 9.x | Git hooks |
| **lint-staged** | 15.x | Pre-commit linting |

**Why pnpm:** 2-3x faster installs, strict dependency resolution, disk space savings via hard links.

---

## Complete Installation Commands

### Frontend (Next.js)

```bash
# Create Next.js app with recommended defaults
pnpm create next-app@latest csz-webshop --yes

# Core dependencies
pnpm add zustand @tanstack/react-query nuqs zod react-hook-form @hookform/resolvers

# Animation
pnpm add motion gsap @gsap/react

# Styling (Tailwind v4 included via create-next-app)
pnpm dlx shadcn@latest init

# i18n
pnpm add next-intl

# Stripe
pnpm add @stripe/stripe-js @stripe/react-stripe-js
```

### Backend API (Fastify)

```bash
# Initialize
pnpm init

# Core
pnpm add fastify @fastify/cors @fastify/helmet @fastify/rate-limit

# Database
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit

# Auth & Validation
pnpm add zod stripe

# Dev
pnpm add -D typescript @types/node tsx
```

### Strapi CMS

```bash
# Create Strapi 5 project
pnpm create strapi@latest csz-strapi

# Recommended plugins
pnpm add @strapi/plugin-i18n @strapi/plugin-seo
```

---

## NOT Recommended

### Technologies to Avoid

| Technology | Why Avoid | Use Instead |
|------------|-----------|-------------|
| **Redux** | Overkill, excessive boilerplate | Zustand + TanStack Query |
| **CSS Modules** | Less flexible than Tailwind for rapid UI | Tailwind CSS v4 |
| **Prisma** | Slow cold starts, large bundle | Drizzle ORM |
| **Express.js** | Slower, callback-based design | Fastify |
| **Pages Router** | Legacy, App Router is the future | App Router |
| **Mongoose/MongoDB** | PostgreSQL better for structured ecommerce data | PostgreSQL + Drizzle |
| **react-spring** | Less maintained than Motion | Motion |
| **Lottie (for simple animations)** | Heavy for simple animations | CSS/Motion |
| **Custom auth** | Security risks, reinventing wheel | Auth.js |

### Anti-Patterns to Avoid

1. **Client-side data fetching for SEO-critical pages** - Use Server Components
2. **Storing cart only in localStorage** - Sync with server for cross-device
3. **DIY webhook handling without signature verification** - Security risk
4. **Hardcoded prices in frontend** - Always fetch from backend
5. **Over-animating** - Motion and GSAP are powerful; restraint is key
6. **Single massive utils file** - Split into logical modules in `lib/`

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Next.js + React | HIGH | Official docs verified, stable release |
| Tailwind CSS v4 | HIGH | Released Jan 2025, production-ready |
| Motion + GSAP | HIGH | Verified current versions |
| Stripe | HIGH | Official docs, well-documented |
| Strapi 5 | HIGH | GA since March 2024 |
| Fastify | HIGH | Battle-tested, large ecosystem |
| Drizzle ORM | MEDIUM | Newer than Prisma, still maturing |
| Deployment (Vercel + Railway) | HIGH | Well-documented, widely used |

---

## Sources

### Official Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4)
- [Strapi 5](https://strapi.io/five)
- [Stripe Documentation](https://stripe.com/docs)
- [Motion.dev](https://motion.dev/)
- [GSAP Documentation](https://gsap.com/docs/)
- [Fastify](https://fastify.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Auth.js](https://authjs.dev/)
- [TanStack Query](https://tanstack.com/query/)
- [Zustand](https://github.com/pmndrs/zustand)
- [nuqs](https://nuqs.dev/)
- [next-intl](https://next-intl.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [shadcn/ui](https://ui.shadcn.com/)

### Comparisons & Best Practices
- [Next.js 15 in eCommerce](https://www.rigbyjs.com/blog/nextjs-15-in-ecommerce)
- [Stripe + Next.js Complete Guide 2025](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/)
- [Drizzle vs Prisma 2025](https://www.bytebase.com/blog/drizzle-vs-prisma/)
- [State Management 2025](https://dev.to/saswatapal/do-you-need-state-management-in-2025-react-context-vs-zustand-vs-jotai-vs-redux-1ho)
- [Node.js Backend Framework Comparison](https://levelup.gitconnected.com/hono-vs-express-vs-fastify-the-2025-architecture-guide-for-next-js-5a13f6e12766)
- [Railway vs Vercel Benchmarks](https://blog.railway.com/p/server-rendering-benchmarks-railway-vs-cloudflare-vs-vercel)
