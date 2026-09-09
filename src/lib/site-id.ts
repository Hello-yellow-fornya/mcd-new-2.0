/**
 * Which site this build is: the repo builds more than one site from the same
 * components (sites/<id>/ holds each site's tokens, copy, pages, navigation,
 * claims and favicon). NEXT_PUBLIC_SITE selects it; next.config.ts inlines the
 * resolved id so client and server code agree, and points "@site/*" at the
 * site's folder. Unset, a Vercel build of an "ocr/…" branch is the OCR site
 * and everything else is Claims 24/7.
 */
export type SiteId = 'mcd2' | 'ocr';

export const siteIds: readonly SiteId[] = ['mcd2', 'ocr'];

export function siteForBuild(env: Record<string, string | undefined> = process.env): SiteId {
  const configured = env.NEXT_PUBLIC_SITE?.trim();
  if (configured) {
    if (!siteIds.includes(configured as SiteId)) throw new Error(`NEXT_PUBLIC_SITE must be one of ${siteIds.join(', ')}, not "${configured}"`);
    return configured as SiteId;
  }
  const ref = env.VERCEL_GIT_COMMIT_REF?.trim() ?? '';
  if (ref === 'ocr' || ref.startsWith('ocr/')) return 'ocr';
  return 'mcd2';
}

export const siteId: SiteId = siteForBuild();
