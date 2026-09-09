import type { MetadataRoute } from 'next';
import { INDEXABLE_PATHS } from '@/lib/indexing';

/**
 * Disallow everything, then allow back the indexable paths
 * (src/lib/indexing.ts) with an end-anchored rule so `/$` matches the homepage
 * and nothing beneath it. No sitemap is named: one page does not need one.
 */
export default function robots(): MetadataRoute.Robots {
  const allow = INDEXABLE_PATHS.map((p) => `${p}$`);
  return { rules: { userAgent: '*', ...(allow.length ? { allow } : {}), disallow: '/' } };
}
