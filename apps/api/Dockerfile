# ============================================
# CSZ Webshop - Fastify API Dockerfile
# ============================================
# Multi-stage build for production deployment

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the shared types package
FROM base AS types-builder
WORKDIR /app
RUN corepack enable pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY packages/types ./packages/types
COPY tsconfig.json ./

WORKDIR /app/packages/types
RUN pnpm build

# Build the API
FROM base AS builder
WORKDIR /app
RUN corepack enable pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY --from=types-builder /app/packages/types ./packages/types
COPY apps/api ./apps/api
COPY tsconfig.json ./

WORKDIR /app/apps/api
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api

# Copy built application
COPY --from=builder --chown=api:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=api:nodejs /app/apps/api/package.json ./

# Install production dependencies only
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules

USER api

EXPOSE 3001

ENV PORT=3001
ENV HOST="0.0.0.0"

CMD ["node", "dist/index.js"]
