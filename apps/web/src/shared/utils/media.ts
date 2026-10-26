/**
 * Normalizes media URLs for display across the application.
 * Automatically resolves:
 * 1. Cloudflare dashboard URLs (dash.cloudflare.com) -> API streaming proxy
 * 2. Cloudflare private S3 URLs (*.r2.cloudflarestorage.com) -> API streaming proxy
 * 3. Fallback support for all image renders
 */
export function formatImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';

  const trimmed = url.trim();
  if (!trimmed) return '';

  // Cloudflare Dashboard or private S3 endpoint correction
  if (trimmed.includes('dash.cloudflare.com') || trimmed.includes('.r2.cloudflarestorage.com')) {
    const match = trimmed.match(/((?:avatar|listing_image|verification_document)\/[^?#]+)/);
    if (match) {
      return `/api/v1/uploads/file/${match[1]}`;
    }
  }

  return trimmed;
}
