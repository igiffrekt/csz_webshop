# Phase 3: Frontend Shell & Product Display - Research

**Researched:** 2026-01-20
**Domain:** Next.js 16 App Router, Tailwind CSS v4, Product Catalog UI
**Confidence:** HIGH

## Summary

This phase establishes the customer-facing frontend for browsing the fire safety equipment catalog. The research confirms Next.js 16.1.x with App Router as the standard framework, featuring explicit caching via "use cache" directive, Turbopack as default bundler, and React 19.2 features including View Transitions. Tailwind CSS v4's CSS-first configuration eliminates the need for tailwind.config.js, and shadcn/ui provides accessible, ownable components.

The key architectural insight is that Server Components should handle all data fetching from the Strapi API, while Client Components (marked with "use client") are reserved for interactivity and animations. For product filtering and search, nuqs provides type-safe URL state management that works seamlessly with the App Router.

**Primary recommendation:** Use Server Components for all product listing/detail pages, fetch data via the existing Fastify API (not Strapi directly), push animations to isolated Client Components, and use nuqs for filter/search URL state.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.x | React framework with App Router | Production standard, Turbopack default, explicit caching |
| React | 19.2.x | UI library (bundled with Next.js) | Bundled with Next.js 16, View Transitions, useEffectEvent |
| TypeScript | 5.7.x | Type safety | Next.js 16 default, excellent DX |
| Tailwind CSS | 4.x | Utility-first CSS | CSS-first config, 100x faster incremental builds, no config file needed |
| shadcn/ui | latest | Component primitives | Ownable code, accessible, works with Tailwind v4 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nuqs | 2.5+ | URL state (filters, search, pagination) | Product filters, search queries, sort options |
| TanStack Query | 5.x | Client-side data fetching, caching | Mutations, optimistic updates, cart state sync |
| Motion | 12.x | Component animations, gestures | Hover states, layout transitions, micro-interactions |
| GSAP | 3.14.x | Scroll-driven animations | Hero parallax, scroll reveals (use sparingly) |
| next-intl | 4.x | Internationalization | Hungarian UI text, HUF formatting |
| qs | latest | Query string building | Strapi API populate queries |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| nuqs | useSearchParams directly | nuqs provides type safety, debouncing, throttling |
| TanStack Query | SWR | TanStack has better mutation support for cart |
| Motion | CSS animations | Motion provides gesture support, layout animations |
| next-intl | react-intl | next-intl has better App Router integration |

**Installation:**
```bash
# In apps/web (after create-next-app)
pnpm add nuqs @tanstack/react-query motion gsap @gsap/react next-intl qs

# Dev dependencies
pnpm add -D @types/qs

# shadcn/ui init (after project setup)
pnpm dlx shadcn@latest init
```

## Architecture Patterns

### Recommended Project Structure
```
apps/web/
  src/
    app/
      [locale]/              # i18n route segment
        layout.tsx           # Root layout with providers
        page.tsx             # Home page (Server Component)
        termekek/            # Products (Hungarian)
          page.tsx           # Product listing (Server Component)
          [slug]/
            page.tsx         # Product detail (Server Component)
        kategoriak/          # Categories
          [slug]/
            page.tsx         # Category page (Server Component)
      api/                   # API routes if needed
    components/
      ui/                    # shadcn/ui components
      product/               # Product-specific components
        ProductCard.tsx      # Server Component
        ProductGallery.tsx   # Client Component (images, zoom)
        ProductFilters.tsx   # Client Component (nuqs integration)
        SpecsTable.tsx       # Server Component
        CertBadge.tsx        # Server Component
      layout/
        Header.tsx           # Server Component with client nav
        Footer.tsx           # Server Component
        MobileNav.tsx        # Client Component
      animations/
        MotionDiv.tsx        # Client wrapper for motion.div
        ScrollReveal.tsx     # Client GSAP wrapper
    lib/
      api.ts                 # API client for Fastify backend
      strapi.ts              # Strapi types and helpers
      formatters.ts          # HUF formatting, dates
      queries.ts             # TanStack Query keys and functions
    i18n/
      routing.ts             # Locale configuration
      request.ts             # Server-side i18n config
    messages/
      hu.json                # Hungarian translations
      en.json                # English translations (future)
```

### Pattern 1: Server Component Data Fetching
**What:** Fetch all product data in Server Components using the Fastify API
**When to use:** Product listing pages, product detail pages, category pages
**Example:**
```typescript
// app/[locale]/termekek/page.tsx
// Source: Next.js App Router docs

import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilters } from '@/components/product/ProductFilters';
import { getProducts } from '@/lib/api';

interface Props {
  searchParams: Promise<{
    category?: string;
    fireClass?: string;
    certification?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const products = await getProducts({
    category: params.category,
    fireClass: params.fireClass,
    certification: params.certification,
    search: params.q,
    page: Number(params.page) || 1,
  });

  return (
    <main>
      <ProductFilters />
      <ProductGrid products={products.data} />
    </main>
  );
}
```

### Pattern 2: Client Component URL State with nuqs
**What:** Type-safe URL query parameters for filters and search
**When to use:** Product filters, search input, pagination controls
**Example:**
```typescript
// components/product/ProductFilters.tsx
// Source: nuqs.dev documentation
'use client';

import { useQueryState, parseAsString, parseAsArrayOf } from 'nuqs';

export function ProductFilters() {
  const [category, setCategory] = useQueryState('category', parseAsString);
  const [fireClass, setFireClass] = useQueryState(
    'fireClass',
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [search, setSearch] = useQueryState('q', parseAsString.withOptions({
    throttleMs: 300,
    shallow: false, // Trigger server re-render
  }));

  return (
    <div className="flex gap-4">
      <input
        type="search"
        value={search ?? ''}
        onChange={(e) => setSearch(e.target.value || null)}
        placeholder="Kereses..."
      />
      {/* Filter UI components */}
    </div>
  );
}
```

### Pattern 3: Animation Client Component Wrappers
**What:** Isolate animations in small Client Components to preserve SSR
**When to use:** Any component needing Motion or GSAP animations
**Example:**
```typescript
// components/animations/MotionDiv.tsx
// Source: Motion.dev Next.js guide
'use client';

import { motion, type HTMLMotionProps } from 'motion/react';

export function MotionDiv(props: HTMLMotionProps<'div'>) {
  return <motion.div {...props} />;
}

// Usage in Server Component:
// import { MotionDiv } from '@/components/animations/MotionDiv';
// <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//   {children}
// </MotionDiv>
```

### Pattern 4: Hungarian Currency Formatting
**What:** Format prices in HUF using Intl.NumberFormat
**When to use:** All price displays throughout the application
**Example:**
```typescript
// lib/formatters.ts
// Source: MDN Intl.NumberFormat documentation

const hufFormatter = new Intl.NumberFormat('hu-HU', {
  style: 'currency',
  currency: 'HUF',
  maximumFractionDigits: 0, // HUF doesn't use decimals
});

export function formatPrice(amount: number): string {
  return hufFormatter.format(amount);
}

// formatPrice(15900) => "15 900 Ft"
```

### Pattern 5: Strapi API Population with qs
**What:** Build complex populate queries for Strapi REST API
**When to use:** Fetching products with relations, categories, variants
**Example:**
```typescript
// lib/api.ts
// Source: Strapi 5 REST API documentation

import qs from 'qs';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getProduct(slug: string) {
  const query = qs.stringify({
    filters: { slug: { $eq: slug } },
    populate: {
      images: { fields: ['url', 'alternativeText', 'width', 'height'] },
      documents: { fields: ['url', 'name'] },
      categories: { fields: ['name', 'slug'] },
      variants: {
        populate: {
          image: { fields: ['url', 'alternativeText'] }
        }
      },
      specifications: true,
      certifications: {
        populate: {
          certificate: { fields: ['url', 'name'] }
        }
      }
    }
  }, { encodeValuesOnly: true });

  const res = await fetch(`${API_URL}/api/products?${query}`);
  return res.json();
}
```

### Pattern 6: Image Optimization for Product Gallery
**What:** Use next/image with proper sizing for product images
**When to use:** Product cards, galleries, hero images
**Example:**
```typescript
// components/product/ProductCard.tsx
// Source: Next.js Image Optimization guide

import Image from 'next/image';
import { formatPrice } from '@/lib/formatters';

interface ProductCardProps {
  product: {
    name: string;
    slug: string;
    basePrice: number;
    images: Array<{ url: string; alternativeText: string }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0];

  return (
    <article className="group">
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <Image
          src={image?.url ?? '/placeholder.jpg'}
          alt={image?.alternativeText ?? product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <h3 className="mt-2 font-medium">{product.name}</h3>
      <p className="text-lg font-bold">{formatPrice(product.basePrice)}</p>
    </article>
  );
}
```

### Anti-Patterns to Avoid
- **Fetching Strapi directly from frontend:** Always go through the Fastify API backend for business logic isolation
- **Using 'use client' at page level:** Push client directives as far down the component tree as possible
- **Hardcoding prices:** Always fetch from API, never store prices in frontend code
- **Animating layout properties:** Avoid animating width/height/margin - use transform/opacity instead
- **Single massive component file:** Split into logical Server/Client components

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL query state | Custom useSearchParams wrapper | nuqs | Type safety, debouncing, throttling, shallow routing |
| Image optimization | Custom srcset logic | next/image | Automatic format conversion, lazy loading, sizing |
| Currency formatting | Manual string manipulation | Intl.NumberFormat | Locale-aware, handles edge cases |
| Animation wrappers | Direct GSAP in useEffect | @gsap/react useGSAP hook | Proper cleanup, context scoping |
| Component library | Custom from scratch | shadcn/ui | Accessible, tested, themeable |
| i18n | Manual JSON loading | next-intl | ICU syntax, number/date formatting, SSR compatible |
| Search debouncing | Custom debounce util | nuqs throttleMs option | Built-in, URL sync aware |

**Key insight:** The frontend ecosystem has mature solutions for common ecommerce UI patterns. Custom solutions introduce bugs and maintenance burden.

## Common Pitfalls

### Pitfall 1: Animation SSR Hydration Mismatch
**What goes wrong:** Animations work in development but break in production with hydration errors
**Why it happens:** Motion/GSAP use browser APIs unavailable during SSR; CSS Modules conflict with AnimatePresence
**How to avoid:**
- Push 'use client' to smallest possible components
- Use Tailwind CSS instead of CSS Modules with Motion
- Import from 'motion/react' not 'framer-motion' for Next.js 16
- Test production builds locally (`pnpm build && pnpm start`)
**Warning signs:** "window is not defined" errors, layout jumps on page load, CLS > 0.1

### Pitfall 2: Missing Strapi Populate Parameters
**What goes wrong:** API returns empty relations, images missing from products
**Why it happens:** Strapi 5 REST API returns no relations by default; find permission must be enabled
**How to avoid:**
- Always use explicit populate parameters
- Use qs library for complex queries
- Verify API permissions in Strapi admin for all related content types
**Warning signs:** Empty arrays for relations, null image fields

### Pitfall 3: nuqs Triggering Full Page Reloads
**What goes wrong:** Filter changes cause slow full-page reloads instead of smooth updates
**Why it happens:** Default shallow:true skips server re-render; wrong options for use case
**How to avoid:**
- Use `shallow: false` when Server Component needs updated data
- Use `throttleMs` for search inputs to prevent excessive requests
- Combine with TanStack Query for client-side caching
**Warning signs:** Slow filter interactions, stale data after URL change

### Pitfall 4: HUF Formatting Inconsistencies
**What goes wrong:** Prices display differently across pages/components
**Why it happens:** Multiple formatter instances, different locales used
**How to avoid:**
- Create single formatPrice utility function
- Use consistent locale ('hu-HU') everywhere
- Prices stored as integers (fillertelen Forint) - no decimals needed
**Warning signs:** "15,900 Ft" vs "15 900 Ft" vs "HUF 15900"

### Pitfall 5: Image Priority Overuse
**What goes wrong:** All images load immediately, hurting performance
**Why it happens:** Setting priority={true} on multiple images
**How to avoid:**
- Only ONE image per page gets priority (LCP candidate)
- Product detail hero: priority=true
- All other images: default lazy loading
- Monitor with Network panel during scroll
**Warning signs:** All images in Network tab on initial load, high LCP

### Pitfall 6: next-intl Middleware Blocking API Routes
**What goes wrong:** API routes return 404 or redirect incorrectly
**Why it happens:** Middleware matches API paths and tries to add locale prefix
**How to avoid:**
- Configure matcher to exclude api routes: `'/((?!api|_next|.*\\..*)*)'`
- Test all API routes after middleware setup
**Warning signs:** /api/* routes failing, unexpected redirects

## Code Examples

Verified patterns from official sources:

### Home Page with Featured Products
```typescript
// app/[locale]/page.tsx
import { getCategories, getFeaturedProducts } from '@/lib/api';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoryGrid } from '@/components/home/CategoryGrid';

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <main>
      <HeroSection />
      <FeaturedProducts products={featuredProducts} />
      <CategoryGrid categories={categories} />
    </main>
  );
}
```

### Product Detail Page with SEO
```typescript
// app/[locale]/termekek/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/api';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { SpecsTable } from '@/components/product/SpecsTable';
import { CertBadges } from '@/components/product/CertBadges';
import { formatPrice } from '@/lib/formatters';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return {};

  return {
    title: product.name,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: product.images[0]?.url,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.basePrice,
      priceCurrency: 'HUF',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid md:grid-cols-2 gap-8">
        <ProductGallery images={product.images} />
        <div>
          <ProductInfo product={product} />
          <CertBadges certifications={product.certifications} />
        </div>
      </div>
      <SpecsTable specifications={product.specifications} />
    </>
  );
}
```

### TanStack Query Provider Setup
```typescript
// components/providers/QueryProvider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### next-intl Setup Files
```typescript
// i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['hu'],
  defaultLocale: 'hu',
});

// i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

### Tailwind CSS v4 Global Styles
```css
/* app/globals.css */
@import 'tailwindcss';

/* Dark mode support (if needed later) */
@variant dark (&:where(.dark, .dark *));

/* Custom CSS variables for design tokens */
@theme {
  --color-brand: oklch(0.6 0.15 250);
  --color-accent: oklch(0.7 0.2 30);
  --font-sans: 'Inter Variable', system-ui, sans-serif;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router | App Router | Next.js 13 (2022), stable in 14+ | Server Components default, better data fetching |
| tailwind.config.js | CSS-first @theme directive | Tailwind v4 (Jan 2025) | No config file needed, faster builds |
| Implicit caching | Explicit "use cache" directive | Next.js 16 (Dec 2025) | Predictable caching, better DX |
| framer-motion import | motion/react import | Motion 12 (2025) | Better Next.js integration |
| middleware.ts | proxy.ts | Next.js 16 (Dec 2025) | Clearer network boundary |
| Webpack dev server | Turbopack | Next.js 16 (default) | 5-10x faster Fast Refresh |
| Manual i18n middleware | next-intl with App Router | next-intl 3+ | Simpler setup, better typing |

**Deprecated/outdated:**
- **Pages Router:** Still works but App Router is recommended for new projects
- **tailwind.config.js:** Replaced by CSS-first configuration in v4
- **framer-motion package name:** Now just "motion" with motion/react import
- **tailwindcss-animate:** Replace with tw-animate-css for Tailwind v4 compatibility

## Open Questions

Things that couldn't be fully resolved:

1. **Strapi media URL handling**
   - What we know: Strapi returns relative URLs for media
   - What's unclear: Exact base URL configuration for production CDN
   - Recommendation: Configure STRAPI_URL env var, may need URL rewriting for CDN

2. **Search implementation depth**
   - What we know: Basic text search via API filters supported
   - What's unclear: Full-text search with Hungarian stemming requirements
   - Recommendation: Start with basic filter-based search, evaluate Meilisearch if advanced search needed

3. **Animation scope for Phase 3**
   - What we know: Motion/GSAP are in the stack
   - What's unclear: Exact animation requirements for product pages
   - Recommendation: Implement basic hover states and page transitions, defer complex scroll animations to Phase 9 (Polish)

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) - Cache Components, Turbopack, React 19.2
- [Next.js App Router Documentation](https://nextjs.org/docs/app) - Routing, Server Components
- [Tailwind CSS v4 Release](https://tailwindcss.com/blog/tailwindcss-v4) - CSS-first config, Oxide engine
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) - Component setup
- [nuqs Documentation](https://nuqs.dev/) - URL state management
- [TanStack Query SSR Guide](https://tanstack.com/query/v5/docs/react/guides/advanced-ssr) - Server Components integration
- [Motion for React](https://motion.dev/docs/react) - Animation library
- [next-intl Documentation](https://next-intl.dev/) - i18n for Next.js
- [Strapi 5 REST API Populate](https://docs.strapi.io/cms/api/rest/populate-select) - Relation fetching
- [MDN Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) - Currency formatting

### Secondary (MEDIUM confidence)
- [Next.js Image Optimization Guide](https://nextjs.org/docs/app/getting-started/images) - Product image best practices
- [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld) - SEO structured data
- [GSAP React Integration](https://gsap.com/docs/v3/GSAP/gsap.registerPlugin()) - useGSAP hook

### Tertiary (LOW confidence)
- Community tutorials on specific integration patterns - verify against official docs before use

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All major libraries verified against official documentation
- Architecture: HIGH - Patterns from official Next.js and library guides
- Pitfalls: HIGH - Documented in prior project research, verified against community reports

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (30 days - stable ecosystem)
