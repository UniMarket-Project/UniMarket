#!/bin/sh
set -e

echo "=================================================="
echo " Starting UniMarket Backend API..."
echo " Node version: $(node -v)"
echo " Environment: ${NODE_ENV:-production}"
echo "=================================================="

# Sanitize database URLs for Prisma compatibility (strips unsupported params & URL-encodes special chars)
if [ -n "$DATABASE_URL" ]; then
  CLEANED_DB_URL=$(node -e "
    const raw = process.env.DATABASE_URL || '';
    if (!raw) { console.log(''); process.exit(0); }
    try {
      const t = raw.trim().replace(/^['\"]|['\"]$/g, '');
      const m = t.match(/^(postgres(?:ql)?:\/\/)(.*)$/);
      if (!m) { console.log(t); process.exit(0); }
      const lastAt = m[2].lastIndexOf('@');
      if (lastAt === -1) { console.log(t); process.exit(0); }
      const auth = m[2].slice(0, lastAt);
      const rest = m[2].slice(lastAt + 1);
      const colon = auth.indexOf(':');
      const u = colon !== -1 ? auth.slice(0, colon) : auth;
      const p = colon !== -1 ? auth.slice(colon + 1) : '';
      let eu = u, ep = p;
      try { eu = encodeURIComponent(decodeURIComponent(u)); } catch { eu = encodeURIComponent(u); }
      try { ep = encodeURIComponent(decodeURIComponent(p)); } catch { ep = encodeURIComponent(p); }
      const qIdx = rest.indexOf('?');
      const hp = qIdx !== -1 ? rest.slice(0, qIdx) : rest;
      const qs = qIdx !== -1 ? rest.slice(qIdx + 1) : '';
      let cqs = '';
      if (qs) {
        const allowed = new Set(['schema', 'sslmode', 'sslcert', 'sslidentity', 'sslpassword', 'sslaccept', 'connect_timeout', 'pool_timeout', 'connection_limit', 'pgbouncer', 'statement_cache_size']);
        const params = new URLSearchParams(qs);
        const filtered = new URLSearchParams();
        for (const [k, v] of params.entries()) {
          if (allowed.has(k.toLowerCase())) filtered.append(k, v);
        }
        const s = filtered.toString();
        if (s) cqs = '?' + s;
      }
      const a = eu ? (ep ? eu + ':' + ep : eu) + '@' : '';
      console.log(m[1] + a + hp + cqs);
    } catch { console.log(raw); }
  ")
  if [ -n "$CLEANED_DB_URL" ]; then
    export DATABASE_URL="$CLEANED_DB_URL"
  fi
fi

if [ -n "$DIRECT_URL" ]; then
  CLEANED_DIRECT_URL=$(node -e "
    const raw = process.env.DIRECT_URL || '';
    if (!raw) { console.log(''); process.exit(0); }
    try {
      const t = raw.trim().replace(/^['\"]|['\"]$/g, '');
      const m = t.match(/^(postgres(?:ql)?:\/\/)(.*)$/);
      if (!m) { console.log(t); process.exit(0); }
      const lastAt = m[2].lastIndexOf('@');
      if (lastAt === -1) { console.log(t); process.exit(0); }
      const auth = m[2].slice(0, lastAt);
      const rest = m[2].slice(lastAt + 1);
      const colon = auth.indexOf(':');
      const u = colon !== -1 ? auth.slice(0, colon) : auth;
      const p = colon !== -1 ? auth.slice(colon + 1) : '';
      let eu = u, ep = p;
      try { eu = encodeURIComponent(decodeURIComponent(u)); } catch { eu = encodeURIComponent(u); }
      try { ep = encodeURIComponent(decodeURIComponent(p)); } catch { ep = encodeURIComponent(p); }
      const qIdx = rest.indexOf('?');
      const hp = qIdx !== -1 ? rest.slice(0, qIdx) : rest;
      const qs = qIdx !== -1 ? rest.slice(qIdx + 1) : '';
      let cqs = '';
      if (qs) {
        const allowed = new Set(['schema', 'sslmode', 'sslcert', 'sslidentity', 'sslpassword', 'sslaccept', 'connect_timeout', 'pool_timeout', 'connection_limit', 'pgbouncer', 'statement_cache_size']);
        const params = new URLSearchParams(qs);
        const filtered = new URLSearchParams();
        for (const [k, v] of params.entries()) {
          if (allowed.has(k.toLowerCase())) filtered.append(k, v);
        }
        const s = filtered.toString();
        if (s) cqs = '?' + s;
      }
      const a = eu ? (ep ? eu + ':' + ep : eu) + '@' : '';
      console.log(m[1] + a + hp + cqs);
    } catch { console.log(raw); }
  ")
  if [ -n "$CLEANED_DIRECT_URL" ]; then
    export DIRECT_URL="$CLEANED_DIRECT_URL"
  fi
fi

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
