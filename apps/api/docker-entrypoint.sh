#!/bin/sh
set -e

echo "=================================================="
echo " Starting UniMarket Backend API..."
echo " Node version: $(node -v)"
echo " Environment: ${NODE_ENV:-production}"
echo "=================================================="

# Run database migrations if enabled (default: true)
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "==> Running Prisma database migrations..."
  npm run db:deploy || {
    echo "⚠️ Initial migration attempt failed, retrying in 3 seconds..."
    sleep 3
    npm run db:deploy
  }
  echo "==> Migrations applied successfully."
fi

# If an explicit command was passed, execute it; otherwise run default main.js
if [ "$#" -gt 0 ]; then
  exec "$@"
else
  exec node dist/main.js
fi
