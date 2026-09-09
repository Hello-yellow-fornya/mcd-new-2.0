import { siteId, type SiteId } from './site-id';
import { siteUrl } from './site-url';

/**
 * The pages search engines may index.
 *
 * Claims 24/7 was built PPC-only and noindex everywhere. It now serves
 * claims247.co.uk as the brand's public face, so its homepage — and only its
 * homepage — is indexable there. Every other page stays `noindex, nofollow`
 * because the 1.0 site carries the same copy and this must not compete with it.
 *
 * Indexing is keyed off the build's own canonical origin, not VERCEL_ENV: a
 * staging domain or a preview sets NEXT_PUBLIC_SITE_URL to itself, so nothing
 * on it is ever indexable and there is no per-environment switch to forget.
 * (VERCEL_ENV still gates the build-level things in ./staging.ts — sample
 * reviews, the styleguide, unsubstantiated claims.)
 *
 * Claims Report Line indexes nothing, anywhere.
 */
const LIVE_HOSTS: Partial<Record<SiteId, readonly string[]>> = {
  mcd2: ['claims247.co.uk', 'www.claims247.co.uk'],
};

/**
 * The rule itself, as a function of the two inputs, so a test can ask it about
 * the build under test rather than about the process it is running in.
 */
export function indexablePathsFor(id: SiteId, url: string): readonly string[] {
  const hosts = LIVE_HOSTS[id];
  if (!hosts) return [];
  try {
    return hosts.includes(new URL(url).host) ? ['/'] : [];
  } catch {
    return [];
  }
}

export const INDEXABLE_PATHS: readonly string[] = indexablePathsFor(siteId, siteUrl);

export function isIndexable(pathname: string): boolean {
  return INDEXABLE_PATHS.includes(pathname);
}

/**
 * The next.config.ts header source covering everything the indexable paths do
 * not: ":path+" needs at least one segment, so it skips the homepage exactly
 * as the middleware does. Only the homepage can be carved out this way — if
 * another path ever becomes indexable this must become a rule per path, so it
 * throws rather than quietly serving a noindex header on an indexable page.
 */
export function noindexHeaderSource(): string {
  if (INDEXABLE_PATHS.length === 0) return '/:path*';
  if (INDEXABLE_PATHS.length === 1 && INDEXABLE_PATHS[0] === '/') return '/:path+';
  throw new Error(
    `next.config.ts can only carve the homepage out of the blanket noindex header; INDEXABLE_PATHS is ${JSON.stringify(INDEXABLE_PATHS)}. Emit one header rule per non-indexable path instead.`,
  );
}
