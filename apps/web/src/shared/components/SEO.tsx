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
  useEffect(() => {
    // 1. Page Title
    document.title = title;

    // 2. Helper to set or update meta tags
    const setMetaTag = (nameAttr: string, nameValue: string, content: string) => {
      let meta = document.querySelector(`meta[${nameAttr}="${nameValue}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(nameAttr, nameValue);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'UniMarket');
  }, [title, description, ogType]);

  return null;
}