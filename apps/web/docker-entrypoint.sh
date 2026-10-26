#!/bin/sh
set -e

# Default to http://api:5000 if BACKEND_URL is not provided (for Docker Compose)
TARGET_BACKEND="${BACKEND_URL:-http://api:5000}"

# Strip trailing slashes
TARGET_BACKEND=$(echo "$TARGET_BACKEND" | sed 's:/*$::')

# Replace placeholder in Nginx config with runtime target
sed -i "s|__BACKEND_URL__|${TARGET_BACKEND}|g" /etc/nginx/conf.d/default.conf

exec "$@"
