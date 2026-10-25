
FROM postgres:16-alpine

LABEL org.opencontainers.image.title="UniMarket Database"
LABEL org.opencontainers.image.description="PostgreSQL 16 relational database for UniMarket"

# Copy initialization script into entrypoint directory
COPY docker/database/init.sql /docker-entrypoint-initdb.d/01-init.sql

# Expose standard PostgreSQL port
EXPOSE 5432

# Built-in container healthcheck
HEALTHCHECK --interval=5s --timeout=5s --start-period=10s --retries=5 \
  CMD pg_isready -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-unimarket}" || exit 1
