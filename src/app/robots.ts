import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { isLiveHost } from '@/lib/host';
import { absoluteUrl } from '@/lib/site';

// Served per request so it can follow the host rule (appendix §2a).
export const dynamic = 'force-dynamic';

/** Disallow everything off a real domain; on it, disallow /claim/ (appendix §5). */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  return {
    rules: isLiveHost(host) ? { userAgent: '*', allow: '/', disallow: ['/claim/'] } : { userAgent: '*', disallow: '/' },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
