import { siteUrl } from './site.ts';

/**
 * Staging rule (CLAUDE.md §0, appendix §2a). Two conditions, both keyed off
 * NEXT_PUBLIC_SITE_URL and never off VERCEL_ENV:
 *
 *  1. While the site URL is a *.vercel.app address there is no real domain
 *     yet, so every deployment is staging — the .vercel.app production build
 *     included.
 *  2. Once a real domain is set, only requests served from that host (with
 *     or without www) are live; previews and the .vercel.app build stay
 *     noindexed.
 *
 * Changing NEXT_PUBLIC_SITE_URL and attaching the domain is the whole switch.
 */
export function siteHost(url: string = siteUrl): string {
  return new URL(url).host.toLowerCase();
}

/** True for Vercel's auto-assigned addresses. */
export function isVercelHost(host: string): boolean {
  return /\.vercel\.app$/i.test(host.split(':')[0]);
}

/** True when the request host is the real site. */
export function isLiveHost(host: string | null | undefined, site: string = siteHost()): boolean {
  if (!host) return false;
  const s = site.toLowerCase().split(':')[0];
  if (isVercelHost(s)) return false;
  const h = host.toLowerCase().split(':')[0];
  return h === s || h === `www.${s}` || `www.${h}` === s;
}

/** True when the configured site URL itself is staging, i.e. no real domain yet. */
export function isStagingSite(site: string = siteHost()): boolean {
  return isVercelHost(site) || site.startsWith('localhost');
}
