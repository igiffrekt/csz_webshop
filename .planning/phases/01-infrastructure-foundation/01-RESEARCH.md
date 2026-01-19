# Phase 1: Infrastructure Foundation - Research

**Researched:** 2026-01-19
**Domain:** Backend Infrastructure (Strapi 5 CMS, Fastify 5 API, PostgreSQL)
**Confidence:** HIGH

## Summary

This research covers the foundational infrastructure setup for the CSZ Webshop ecommerce platform. The phase establishes three core backend components: Strapi 5 CMS for content management, Fastify 5 API backend for business logic, and PostgreSQL 16 for data storage. The research also covers custom admin roles (Admin, Store Manager, Content Manager) required by ADMN-26/27/28.

The standard approach is to:
1. Use pnpm workspaces for monorepo structure with `apps/` for deployables and `packages/` for shared code
2. Configure Strapi 5 with PostgreSQL from the start (never use SQLite in production)
3. Set up Fastify 5 with TypeScript and a health check endpoint
4. Create custom administrator roles via Strapi's RBAC system (Settings > Administration Panel > Roles)

**Primary recommendation:** Initialize the monorepo structure first, then set up PostgreSQL via Docker Compose for local development, followed by Strapi 5 with PostgreSQL configuration, and finally scaffold the Fastify 5 API backend with TypeScript.

---

## Standard Stack

The established libraries/tools for this phase:

### Core

| Technology | Version | Purpose | Why Standard |
|------------|---------|---------|--------------|
| **Strapi** | 5.31.x | Headless CMS | Official Strapi 5 - TypeScript-first, Draft/Publish, i18n built-in |
| **Fastify** | 5.x | API Backend | 2-3x faster than Express, built-in validation, TypeScript support |
| **PostgreSQL** | 16.x | Database | ACID compliance, JSONB support, full-text search |
| **Node.js** | 22.x LTS | Runtime | Active LTS, required by Strapi 5 (v20/v22/v24 supported) |
| **pnpm** | 9.x | Package manager | 60-80% disk savings, 3-5x faster installs |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **pg** | latest | PostgreSQL driver | Required for Strapi PostgreSQL connection |
| **tsx** | latest | TypeScript execution | Development mode for Fastify |
| **@fastify/cors** | latest | CORS handling | API cross-origin requests |
| **@fastify/helmet** | latest | Security headers | Production security hardening |
| **fastify-healthcheck** | 5.x | Health endpoint | Kubernetes/load balancer probes |
| **Docker Compose** | latest | Local PostgreSQL | Development database container |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| PostgreSQL | SQLite | SQLite is dev-only; data wiped on container rebuild |
| Fastify | Express | Express is slower, less TypeScript-native |
| pnpm workspaces | Turborepo | Turborepo adds complexity; pnpm workspaces sufficient for this project size |

**Installation:**

```bash
# Root monorepo setup
pnpm init
# Create workspace config (pnpm-workspace.yaml)

# Strapi app
pnpm create strapi@latest apps/cms --ts --skip-cloud --dbclient=postgres

# Fastify app
cd apps/api && pnpm init
pnpm add fastify @fastify/cors @fastify/helmet fastify-healthcheck
pnpm add -D typescript @types/node tsx
```

---

## Architecture Patterns

### Recommended Project Structure

```
csz-webshop/                    # Monorepo root
├── apps/
│   ├── cms/                    # Strapi 5 CMS
│   │   ├── config/
│   │   │   ├── admin.ts        # Admin panel config
│   │   │   ├── api.ts          # API config
│   │   │   ├── database.ts     # PostgreSQL connection
│   │   │   ├── middlewares.ts  # Middleware config
│   │   │   ├── plugins.ts      # Plugin config
│   │   │   └── server.ts       # Server config
│   │   ├── src/
│   │   │   ├── admin/          # Admin customization
│   │   │   ├── api/            # Content-type APIs
│   │   │   └── components/     # Shared components
│   │   ├── database/
│   │   │   └── migrations/     # Database migrations
│   │   ├── public/             # Public assets
│   │   ├── types/              # TypeScript types
│   │   └── .env                # Environment variables
│   │
│   ├── api/                    # Fastify 5 API Backend
│   │   ├── src/
│   │   │   ├── routes/         # Route handlers
│   │   │   ├── plugins/        # Fastify plugins
│   │   │   ├── services/       # Business logic
│   │   │   └── index.ts        # Entry point
│   │   ├── tsconfig.json
│   │   └── .env
│   │
│   └── web/                    # Next.js (Phase 3)
│
├── packages/
│   ├── types/                  # Shared TypeScript types
│   └── config/                 # Shared configuration
│
├── docker/
│   └── docker-compose.yml      # PostgreSQL for local dev
│
├── pnpm-workspace.yaml         # Workspace configuration
├── package.json                # Root package.json
└── .env.example                # Environment template
```

### Pattern 1: Strapi 5 PostgreSQL Configuration

**What:** Database configuration for Strapi 5 with PostgreSQL
**When to use:** Always for this project (required for production)
**Example:**

```typescript
// apps/cms/config/database.ts
// Source: https://docs.strapi.io/cms/configurations/database

import path from 'path';

export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'csz_strapi'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', 'strapi'),
      schema: env('DATABASE_SCHEMA', 'public'),
      ssl: env.bool('DATABASE_SSL', false) && {
        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
      },
    },
    pool: {
      min: env.int('DATABASE_POOL_MIN', 2),
      max: env.int('DATABASE_POOL_MAX', 10),
    },
  },
});
```

### Pattern 2: Fastify 5 TypeScript Server

**What:** Basic Fastify server with health check
**When to use:** Initial API backend setup
**Example:**

```typescript
// apps/api/src/index.ts
// Source: https://fastify.dev/docs/latest/Reference/TypeScript/

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import healthcheck from 'fastify-healthcheck';

const fastify: FastifyInstance = Fastify({
  logger: true,
  disableRequestLogging: (request) => {
    return request.url === '/health';
  }
});

// Register plugins
fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
});
fastify.register(helmet);
fastify.register(healthcheck, {
  healthcheckUrl: '/health'
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '4000', 10);
    const host = process.env.HOST || '0.0.0.0';
    await fastify.listen({ port, host });
    console.log(`API running at http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

### Pattern 3: pnpm Workspace Configuration

**What:** Monorepo workspace setup
**When to use:** Project initialization
**Example:**

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

```json
// package.json (root)
{
  "name": "csz-webshop",
  "private": true,
  "scripts": {
    "dev:cms": "pnpm --filter @csz/cms dev",
    "dev:api": "pnpm --filter @csz/api dev",
    "dev": "pnpm run --parallel dev:cms dev:api",
    "build": "pnpm run --parallel build:cms build:api"
  },
  "packageManager": "pnpm@9.15.0"
}
```

### Anti-Patterns to Avoid

- **Using SQLite in production:** SQLite data is wiped on container rebuild. Always use PostgreSQL.
- **Skipping `--skip-cloud` flag:** This prompts for Strapi Cloud login during setup, which is not needed.
- **Hardcoding database credentials:** Use environment variables via `env()` helper.
- **Single .env file:** Use separate .env files per app (apps/cms/.env, apps/api/.env).
- **Using pnpm with Kubernetes (Strapi):** pnpm can break native modules in K8s; use npm for Strapi in production.

---

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Health check endpoint | Custom `/health` route | `fastify-healthcheck` plugin | Handles under-pressure detection, uptime exposure |
| CORS handling | Manual headers | `@fastify/cors` | Handles preflight, credentials, origin validation |
| Security headers | Manual helmet headers | `@fastify/helmet` | Comprehensive CSP, XSS, clickjacking protection |
| Admin RBAC | Custom permission system | Strapi built-in RBAC | Settings > Administration Panel > Roles |
| Environment config | `process.env` directly | Strapi's `env()` utility | Type casting (int, bool, json, array) |
| TypeScript execution | `ts-node` | `tsx` | Faster, no config needed, ESM support |

**Key insight:** Strapi 5 provides a complete admin role system out of the box. The requirements for Admin, Store Manager, and Content Manager roles are achieved through Strapi's built-in RBAC configuration, not custom code.

---

## Common Pitfalls

### Pitfall 1: Schema Changes Causing Data Loss

**What goes wrong:** Modifying content type schemas in production (adding/removing fields) can cause Strapi to delete all records in affected tables.

**Why it happens:** Strapi syncs database tables with schemas on restart. Mismatched schemas trigger automatic deletion. No down migration support exists.

**How to avoid:**
1. NEVER modify content types in production
2. Always backup database before ANY deployment
3. Test schema changes in staging with production data copy
4. Use Development -> Staging -> Production workflow

**Warning signs:** Schema files modified directly in production, no staging environment, missing database backups.

### Pitfall 2: Using SQLite Instead of PostgreSQL

**What goes wrong:** Data is wiped on container rebuild/restart. Unsuitable for production.

**Why it happens:** Strapi defaults to SQLite for quick start. Developers forget to change before going further.

**How to avoid:**
1. Always use `--dbclient=postgres` during project creation
2. Set up Docker Compose PostgreSQL from day one
3. Never use `--quickstart` flag (it uses SQLite)

**Warning signs:** `.tmp/data.db` file exists, no PostgreSQL connection string in .env.

### Pitfall 3: Strapi Operational Burden

**What goes wrong:** Security patches pile up, performance degrades, scaling becomes manual firefighting.

**Why it happens:** Self-hosted Strapi requires ongoing maintenance. Missing monitoring/alerting.

**How to avoid:**
1. Use PostgreSQL from day one (not SQLite)
2. Set up health check monitoring
3. Configure separate media storage (Cloudinary for production)
4. Use pm2 for process management
5. Automate database backups

**Warning signs:** No monitoring set up, manual deployments, media stored locally.

### Pitfall 4: Missing pg Module

**What goes wrong:** `Cannot find module 'pg'` error when starting Strapi with PostgreSQL.

**Why it happens:** PostgreSQL driver not installed; Strapi doesn't auto-install database drivers.

**How to avoid:** Run `pnpm add pg` in the cms app directory.

**Warning signs:** Error appears on first `npm run develop` with PostgreSQL config.

---

## Code Examples

Verified patterns from official sources:

### Strapi 5 Installation with PostgreSQL

```bash
# Source: https://docs.strapi.io/cms/installation/cli

# Create Strapi project with PostgreSQL
npx create-strapi@latest apps/cms \
  --typescript \
  --skip-cloud \
  --dbclient=postgres \
  --dbhost=localhost \
  --dbport=5432 \
  --dbname=csz_strapi \
  --dbusername=strapi \
  --dbpassword=strapi \
  --no-run

# Install PostgreSQL driver (required)
cd apps/cms && pnpm add pg
```

### Strapi Environment Variables (.env)

```bash
# apps/cms/.env
# Source: https://docs.strapi.io/cms/configurations/environment

# Server
HOST=0.0.0.0
PORT=1337

# Security Keys (auto-generated, keep secret)
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=random-salt
ADMIN_JWT_SECRET=admin-jwt-secret
TRANSFER_TOKEN_SALT=transfer-salt
JWT_SECRET=jwt-secret

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=csz_strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi
DATABASE_SSL=false
DATABASE_SCHEMA=public
```

### Docker Compose for Local PostgreSQL

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: csz-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: strapi
      POSTGRES_PASSWORD: strapi
      POSTGRES_DB: csz_strapi
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U strapi -d csz_strapi"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Fastify 5 TypeScript Configuration

```json
// apps/api/tsconfig.json
// Source: https://fastify.dev/docs/latest/Reference/TypeScript/
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

```json
// apps/api/package.json
{
  "name": "@csz/api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "fastify": "^5.0.0",
    "@fastify/cors": "^10.0.0",
    "@fastify/helmet": "^12.0.0",
    "fastify-healthcheck": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0",
    "tsx": "^4.0.0"
  }
}
```

### Creating Custom Admin Roles in Strapi 5

```
Steps to create Store Manager and Content Manager roles:
Source: https://docs.strapi.io/cms/features/rbac

1. Start Strapi and create Super Admin account
2. Navigate to: Settings > Administration Panel > Roles
3. Click "Add new role" button

For Store Manager role:
- Name: "Store Manager"
- Description: "Manages products, orders, and coupons"
- Permissions:
  - Collection types: Enable CRUD for Product, Order, Coupon, Category
  - Plugins > Media Library: Enable (for product images)
  - Settings: Disable all (no access to roles/users)

For Content Manager role:
- Name: "Content Manager"
- Description: "Manages pages, media, and SEO"
- Permissions:
  - Collection types: Enable CRUD for Page, FAQ, etc.
  - Plugins > Media Library: Enable
  - Plugins > SEO: Enable (if using SEO plugin)
  - Settings: Disable all (no access to roles/users)

4. Click "Save" after configuring each role
5. Create admin users and assign roles via:
   Settings > Administration Panel > Users > Add new user
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Strapi 4.x | Strapi 5.x | March 2024 (GA) | 100% TypeScript, Vite bundler, simplified API |
| `create-strapi-app` | `create-strapi` | 2024 | Both work; new command preferred |
| SQLite default | PostgreSQL recommended | Always | SQLite for dev only; PostgreSQL for any real use |
| `framer-motion` | `motion` (v12+) | 2024 | Package renamed; use `motion/react` |
| Express.js | Fastify 5.x | 2024 | Fastify 5.x is current stable |
| ts-node | tsx | 2024 | tsx is faster, ESM-native |

**Deprecated/outdated:**
- Strapi 4.x: Migration required for new features
- `require()` syntax in Fastify TypeScript: Use ES6 imports for proper type inference
- `@types/pg`: Not needed with modern pg versions

---

## Open Questions

Things that couldn't be fully resolved:

1. **Strapi 5 Enterprise RBAC vs Community Edition**
   - What we know: Community Edition has basic RBAC; Enterprise has field-level permissions
   - What's unclear: Whether Community Edition is sufficient for Store Manager/Content Manager requirements
   - Recommendation: Start with Community Edition; the basic RBAC (content-type level permissions) should be sufficient for the requirements. Upgrade to Enterprise only if field-level restrictions are needed.

2. **Shared Database Schema**
   - What we know: ARCHITECTURE.md mentions Strapi and API backend can share PostgreSQL on separate schemas
   - What's unclear: Best practice for Drizzle ORM tables coexisting with Strapi tables
   - Recommendation: Use single PostgreSQL instance with separate schemas (`strapi` and `api`) to avoid conflicts.

---

## Sources

### Primary (HIGH confidence)

- [Strapi 5 Installation CLI](https://docs.strapi.io/cms/installation/cli) - Project creation commands and flags
- [Strapi 5 Database Configuration](https://docs.strapi.io/cms/configurations/database) - PostgreSQL setup
- [Strapi 5 Environment Variables](https://docs.strapi.io/cms/configurations/environment) - env() utility
- [Strapi 5 RBAC](https://docs.strapi.io/cms/features/rbac) - Admin role configuration
- [Strapi 5 Project Structure](https://docs.strapi.io/cms/project-structure) - Folder organization
- [Fastify TypeScript Documentation](https://fastify.dev/docs/latest/Reference/TypeScript/) - TypeScript setup
- [fastify-healthcheck npm](https://www.npmjs.com/package/fastify-healthcheck) - Health check plugin
- [pnpm Workspaces](https://pnpm.io/next/workspaces) - Monorepo configuration

### Secondary (MEDIUM confidence)

- [Strapi Blog: Permissions Guide 2025](https://strapi.io/blog/permissions-in-strapi) - Role management guide
- [Strapi Blog: Admin Roles](https://strapi.io/blog/strapi-s-user-roles-and-permissions-for-admin-panel-1) - Custom role creation
- [Medium: Strapi Docker PostgreSQL](https://medium.com/@now.thongtangsai/setting-up-and-dockerizing-a-strapi-project-with-postgresql-a-step-by-step-guide-910a89e8d1f5) - Docker setup guide

### Tertiary (LOW confidence)

- WebSearch results for monorepo structure patterns - Community practices, may vary

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Official documentation verified
- Strapi 5 setup: HIGH - Official CLI and config docs
- Fastify 5 setup: HIGH - Official TypeScript docs
- RBAC configuration: HIGH - Official Strapi RBAC docs
- Monorepo structure: MEDIUM - Community patterns, no official standard
- Local development workflow: MEDIUM - Docker Compose is standard but project-specific

**Research date:** 2026-01-19
**Valid until:** 2026-02-19 (30 days - stable technologies)
