# ============================================
# CSZ Webshop - Strapi CMS Dockerfile
# ============================================
# Multi-stage build for production deployment

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/cms/package.json ./apps/cms/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build Strapi
FROM base AS builder
WORKDIR /app
RUN corepack enable pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY apps/cms ./apps/cms
COPY tsconfig.json ./

WORKDIR /app/apps/cms

ENV NODE_ENV=production

RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 strapi
RUN adduser --system --uid 1001 strapi

# Copy necessary files
COPY --from=builder --chown=strapi:strapi /app/apps/cms/dist ./dist
COPY --from=builder --chown=strapi:strapi /app/apps/cms/public ./public
COPY --from=builder --chown=strapi:strapi /app/apps/cms/config ./config
COPY --from=builder --chown=strapi:strapi /app/apps/cms/src ./src
COPY --from=builder --chown=strapi:strapi /app/apps/cms/package.json ./
COPY --from=builder --chown=strapi:strapi /app/apps/cms/tsconfig.json ./
COPY --from=builder --chown=strapi:strapi /app/apps/cms/node_modules ./node_modules

# Create uploads directory
RUN mkdir -p /app/public/uploads && chown -R strapi:strapi /app/public/uploads

USER strapi

EXPOSE 1337

ENV PORT=1337
ENV HOST="0.0.0.0"

CMD ["npm", "run", "start"]
