# ==============================================================================
# UniMarket API - Production Multi-Stage Dockerfile
# Monorepo Build Context: Root directory (.)
# ==============================================================================

# 1. Base image with minimal libc6-compat & openssl for Prisma
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV PATH="/app/node_modules/.bin:/app/apps/api/node_modules/.bin:${PATH}"

# 2. Dependencies stage (installs all workspace dependencies for compilation)
FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN npm ci

# 3. Builder stage (compiles shared contracts and API application)
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Build shared package contracts
RUN npm run build --workspace=packages/shared

# Generate Prisma Client (must run before compiling API so TypeScript has generated types)
RUN npm run db:generate --workspace=apps/api

# Compile TypeScript into JavaScript in apps/api/dist
RUN npm run build --workspace=apps/api

# 4. Production Runner stage
FROM node:22-alpine AS runner
LABEL org.opencontainers.image.title="UniMarket API"
LABEL org.opencontainers.image.description="UniMarket Modular Monolith Backend API"

RUN apk add --no-cache libc6-compat openssl dumb-init

ENV NODE_ENV=production
ENV PORT=5000
ENV PATH="/app/node_modules/.bin:/app/apps/api/node_modules/.bin:${PATH}"

WORKDIR /app

# Copy production node_modules and compiled output with correct user permissions directly
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --chown=node:node --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --chown=node:node --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --chown=node:node --from=builder /app/apps/api/dist ./apps/api/dist
COPY --chown=node:node --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --chown=node:node --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --chown=node:node apps/api/docker-entrypoint.sh ./apps/api/docker-entrypoint.sh

USER node
WORKDIR /app/apps/api

EXPOSE 5000

# Health check verifies Express liveness endpoint
HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--", "./docker-entrypoint.sh"]
