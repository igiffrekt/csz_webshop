# CSZ Tűzvédelem Webshop

Modern e-commerce platform for fire safety equipment, built with a headless architecture.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **CMS**: Strapi 5 (headless)
- **API**: Fastify 5
- **Database**: PostgreSQL 16
- **Payments**: Stripe
- **Language**: TypeScript 5.x

## Project Structure

```
csz-webshop/
├── apps/
│   ├── web/          # Next.js frontend
│   ├── api/          # Fastify API backend
│   └── cms/          # Strapi CMS
├── packages/
│   └── types/        # Shared TypeScript types
├── scripts/
│   └── migration/    # WooCommerce migration tools
└── docker-compose.yml
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for PostgreSQL)

### Development Setup

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd csz-webshop
   pnpm install
   ```

2. **Start database**
   ```bash
   docker compose up -d postgres
   ```

3. **Configure environment**
   ```bash
   cp apps/cms/.env.example apps/cms/.env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   ```

4. **Start all services**
   ```bash
   pnpm dev
   ```

   This starts:
   - CMS at http://localhost:1337
   - API at http://localhost:3001
   - Web at http://localhost:3000

### First-Time Setup

1. Visit http://localhost:1337/admin
2. Create your admin account
3. Import sample data or migrate from WooCommerce

## Development

### Available Scripts

```bash
# Start all apps in development
pnpm dev

# Build all apps
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint

# Run specific app
pnpm --filter web dev
pnpm --filter api dev
pnpm --filter cms dev
```

### Code Architecture

- **Feature-first organization**: Components grouped by feature
- **Server Components**: Default for Next.js pages
- **Client Components**: Interactive elements only
- **API Routes**: Minimal, most logic in Fastify API

## Migration from WooCommerce

See [scripts/migration/README.md](./scripts/migration/README.md) for detailed migration instructions.

Quick version:
```bash
# Export products from WooCommerce as CSV
# Place in data/woocommerce-products.csv

# Run migration
npx tsx scripts/migration/woocommerce-import.ts data/woocommerce-products.csv
```

## Deployment

### Prerequisites

- Docker and Docker Compose
- PostgreSQL database (or use Docker)
- Stripe account with live keys
- SMTP email service
- Domain with SSL certificate

### Environment Setup

1. Copy `.env.production.example` to `.env.production`
2. Fill in all required values:
   - Database credentials
   - Stripe live keys
   - SMTP configuration
   - JWT secrets (generate secure random strings)

### Deploy with Docker Compose

```bash
# Build all images
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Run Strapi migrations (if needed)
docker compose -f docker-compose.prod.yml exec cms pnpm strapi database:migrate
```

### Deploy to Vercel (Web only)

```bash
cd apps/web
vercel --prod
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_STRAPI_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Post-Deployment Checklist

- [ ] Configure DNS records
- [ ] Verify SSL certificates
- [ ] Set up Stripe webhooks (`/api/webhooks/stripe`)
- [ ] Test checkout flow with live payments
- [ ] Verify email delivery
- [ ] Submit sitemap to Google Search Console
- [ ] Set up monitoring/alerting

## Features

### Customer Features

- Product catalog with search and filters
- Category navigation with mega-menu
- Shopping cart (persisted to localStorage)
- Guest and registered checkout
- Stripe payment integration
- Order history and tracking
- B2B quote request system
- User account management

### Admin Features

- Product management (CRUD)
- Category hierarchy
- Order management
- Customer management
- Content management (pages, blog)
- B2B quote management

### Technical Features

- SEO optimized (meta tags, structured data, sitemap)
- URL redirects for WooCommerce migration
- Responsive design (mobile-first)
- i18n ready (Hungarian default)
- Image optimization
- Performance optimized (Core Web Vitals)

## API Endpoints

### Public API

- `GET /api/products` - List products
- `GET /api/products/:slug` - Get product
- `GET /api/categories` - List categories
- `POST /api/cart/checkout` - Create checkout session

### Protected API (requires auth)

- `GET /api/orders` - User's orders
- `POST /api/quotes` - Create quote request
- `GET /api/user/profile` - User profile

## Contributing

1. Create feature branch from `master`
2. Make changes with tests
3. Run `pnpm lint` and `pnpm typecheck`
4. Submit PR with clear description

## License

Proprietary - CSZ Tűzvédelmi Kft.
