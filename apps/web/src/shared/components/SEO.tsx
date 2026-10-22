import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  ogType?: 'website' | 'article';
}

export function SEO({
  title = 'UniMarket – Trusted Campus Marketplace for Ethiopian Universities',
  description = 'A verified, trusted, campus-only marketplace for Addis Ababa University (AAU) students and staff. Buy, sell, rent, lend and request anything on campus safely.',
  ogType = 'website',
}: SEOProps) {