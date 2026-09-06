import type { MetadataRoute } from 'next';
import { getLivePages } from '@/lib/content';
import { absoluteUrl } from '@/lib/site';

const priority: Record<string, number> = { pillar: 0.8, process: 0.7, comparison: 0.7, guide: 0.6, location: 0.6, article: 0.6, utility: 0.5 };

/** The homepage, claim-now and every live content page; never /claim/*, thank-you, drafts or the styleguide (appendix §5). */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = getLivePages().filter((p) => !p.frontmatter.slug.startsWith('/claim/'));
  return [
    { url: absoluteUrl('/'), lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/claim-now/'), lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    ...pages.map((p) => ({
      url: absoluteUrl(p.frontmatter.slug),
      lastModified: new Date(p.frontmatter.lastReviewed),
      changeFrequency: 'monthly' as const,
      priority: priority[p.frontmatter.template] ?? 0.5,
    })),
  ];
}
