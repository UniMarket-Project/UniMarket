
# 1. Builder Stage (Debian glibc for 100% Rollup / Vite native compatibility)
FROM node:22-slim AS builder
WORKDIR /app

# Build-time environment configuration
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_FRONTEND_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL

# Copy dependency manifests
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/

# Install build dependencies
RUN npm ci

# Copy shared packages and build contracts
COPY packages/ ./packages/
RUN npm run build --workspace=packages/shared

# Copy frontend source and compile production bundle
COPY apps/web/ ./apps/web/
RUN npm run build --workspace=apps/web

# 2. Production Runner Stage (Nginx Alpine)
FROM nginx:1.27-alpine AS runner
LABEL org.opencontainers.image.title="UniMarket Web"
LABEL org.opencontainers.image.description="UniMarket Production SPA Frontend"

# Copy custom Nginx configuration
COPY apps/web/nginx/nginx.conf /etc/nginx/nginx.conf
COPY apps/web/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

# Health check verifies Nginx responds on /healthz
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
