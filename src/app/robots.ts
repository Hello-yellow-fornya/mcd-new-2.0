import type { MetadataRoute } from 'next';

/** Disallow everything, everywhere, and name no sitemap: the site is never indexed (Claims 24/7 brief). */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', disallow: '/' } };
}
