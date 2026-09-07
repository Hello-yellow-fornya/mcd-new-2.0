/**
 * Public origin for canonical and Open Graph URLs (CLAUDE.md §0).
 *
 * Configured from a single NEXT_PUBLIC_SITE_URL, set in Vercel to the
 * project's own *.vercel.app production URL until a real domain is chosen.
 * Unset, it falls back to the production URL Vercel assigns the project, then
 * to localhost for local development.
 */
export function resolveSiteUrl(env: Record<string, string | undefined> = process.env): string {
  const configured = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return new URL(configured).origin;
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return new URL(`https://${vercel}`).origin;
  return 'http://localhost:3000';
}

export const siteUrl: string = resolveSiteUrl();

export const site = {
  /** The trading name: every title, meta, schema name and the wordmark. */
  name: 'Claims 24/7',
  /** The registered company, for schema legalName. */
  legalName: 'Motor Claims Department Ltd',
  /** The footer's legal line (pending the client's confirmation). */
  legalLine: 'Motor Claims Department Ltd, trading as Claims 24/7',
  description: 'Independent accident management for non-fault drivers. The other driver’s insurer pays. Nothing goes through your policy.',
  phone: {
    display: '0800 048 0048',
    href: 'tel:08000480048',
    e164: '+448000480048',
  },
  locale: 'en_GB',
  url: siteUrl,
} as const;

/** Ensures a site path has a leading and trailing slash (slug rules, appendix §5). */
export function canonicalPath(path: string): string {
  let p = path.trim();
  if (!p.startsWith('/')) p = `/${p}`;
  const [pathname, query = ''] = p.split('?');
  const withSlash = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return query ? `${withSlash}?${query}` : withSlash;
}

export function absoluteUrl(path: string): string {
  return new URL(canonicalPath(path), siteUrl).toString();
}
