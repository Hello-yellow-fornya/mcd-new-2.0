import { siteConfig } from '@site/site';
import type { SiteConfig } from './site-config.ts';
import { siteUrl } from './site-url.ts';

export { absoluteUrl, canonicalPath, resolveSiteUrl, siteUrl } from './site-url.ts';

/** This build's site (sites/<id>/site.ts, chosen by NEXT_PUBLIC_SITE) plus its public URL. */
export const site: SiteConfig & { url: string } = { ...siteConfig, url: siteUrl };
