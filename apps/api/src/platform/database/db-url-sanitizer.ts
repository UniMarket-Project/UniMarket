/**
 * Sanitizes PostgreSQL connection strings for Prisma compatibility.
 * - URL-encodes special characters in username and password.
 * - Strips unsupported query parameters (e.g., channel_binding, supa) that trigger Prisma P1013 errors.
 * - Preserves allowed parameters like schema, sslmode, connect_timeout, pgbouncer.
 */
export function sanitizeDatabaseUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;

  const trimmed = rawUrl.trim().replace(/^['"]|['"]$/g, '');
  try {
    const protoMatch = trimmed.match(/^(postgres(?:ql)?:\/\/)(.*)$/);
    if (!protoMatch) return trimmed;

    const proto = protoMatch[1];
    const rest = protoMatch[2];

    const lastAtIndex = rest.lastIndexOf('@');
    if (lastAtIndex === -1) return trimmed;

    const authPart = rest.slice(0, lastAtIndex);
    const hostAndBeyond = rest.slice(lastAtIndex + 1);

    const firstColonIndex = authPart.indexOf(':');
    let username = authPart;
    let password = '';
    if (firstColonIndex !== -1) {
      username = authPart.slice(0, firstColonIndex);
      password = authPart.slice(firstColonIndex + 1);
    }

    let encodedUsername = username;
    let encodedPassword = password;

    try {
      encodedUsername = encodeURIComponent(decodeURIComponent(username));
    } catch {
      encodedUsername = encodeURIComponent(username);
    }

    try {
      encodedPassword = encodeURIComponent(decodeURIComponent(password));
    } catch {
      encodedPassword = encodeURIComponent(password);
    }

    const questionIndex = hostAndBeyond.indexOf('?');
    const hostAndPath = questionIndex !== -1 ? hostAndBeyond.slice(0, questionIndex) : hostAndBeyond;
    const queryString = questionIndex !== -1 ? hostAndBeyond.slice(questionIndex + 1) : '';

    let cleanedQuery = '';
    if (queryString) {
      const allowedParams = new Set([
        'schema',
        'sslmode',
        'sslcert',
        'sslidentity',
        'sslpassword',
        'sslaccept',
        'connect_timeout',
        'pool_timeout',
        'connection_limit',
        'pgbouncer',
        'statement_cache_size',
      ]);
      const params = new URLSearchParams(queryString);
      const filtered = new URLSearchParams();
      for (const [key, val] of params.entries()) {
        if (allowedParams.has(key.toLowerCase())) {
          filtered.append(key, val);
        }
      }
      const qs = filtered.toString();
      if (qs) cleanedQuery = '?' + qs;
    }

    const auth = encodedUsername
      ? (encodedPassword ? `${encodedUsername}:${encodedPassword}` : encodedUsername) + '@'
      : '';

    return proto + auth + hostAndPath + cleanedQuery;
  } catch {
    return trimmed;
  }
}
