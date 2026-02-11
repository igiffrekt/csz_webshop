# CSZ Tűzvédelem Webshop

Modern e-commerce platform for fire safety equipment, built with a headless architecture.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **CMS**: Sanity (headless, hosted)
- **Database**: MariaDB (Prisma ORM)
- **Auth**: NextAuth.js
- **Payments**: Stripe
- **Language**: TypeScript 5.x

## Project Structure

```
csz-webshop/
├── apps/
│   ├── web/          # Next.js frontend + API routes
│   └── studio/       # Sanity Studio CMS
├── packages/
│   └── types/        # Shared TypeScript types
├── scripts/
│   ├── deploy.sh     # Production deployment script
│   └── seed-prisma.ts # Database seed data
└── docker/           # Local MariaDB for development
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for local MariaDB)

### Development Setup

1. **Clone and install**
   ```bash
   git clone <repo-url>
   cd csz-webshop
   pnpm install
   ```

2. **Start database**
   ```bash
   pnpm db:start
   ```

3. **Configure environment**
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

4. **Run database migrations**
   ```bash
   cd apps/web && npx prisma migrate deploy && cd ../..
   ```

5. **Start development**
   ```bash
   pnpm dev
   ```

   This starts:
   - Web at http://localhost:3000
   - Sanity Studio at http://localhost:3333

## Development

### Available Scripts

```bash
# Start all apps in development
pnpm dev

# Build for production
pnpm build

# Run specific app
pnpm --filter web dev
pnpm --filter studio dev

# Database
pnpm db:start    # Start MariaDB
pnpm db:stop     # Stop MariaDB
pnpm db:reset    # Reset database (destroys data)
```

## Deployment

Target: `igifftest.cc` — bare-metal Linux with OpenLiteSpeed + Node.js.

### First-time deploy

1. Copy `.env.production.example` to `apps/web/.env.production` and fill in values
2. Run `./scripts/deploy.sh --initial`
3. Configure OpenLiteSpeed reverse proxy to `127.0.0.1:3000`
4. Register Stripe webhook at `https://igifftest.cc/api/checkout/webhook`

### Updates

```bash
./scripts/deploy.sh
```

The script handles: git pull, install, migrate, build, copy assets. Auto-rollback on build failure. Restart the Node.js app in OpenLiteSpeed after.

## Features

- Product catalog with search, filters, and category navigation
- Shopping cart (persisted to localStorage)
- Stripe checkout (embedded)
- User accounts with NextAuth (register, login, order history)
- B2B quote request system
- SEO optimized (meta tags, structured data, sitemap, redirects)
- Responsive design (mobile-first)
- Hungarian language (i18n via next-intl)
- Image optimization via Sanity CDN

## License

Proprietary - CSZ Tűzvédelmi Kft.
