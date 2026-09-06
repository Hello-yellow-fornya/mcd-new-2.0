import type { MetadataRoute } from 'next';
import { getLivePages } from '@/lib/content';
import { absoluteUrl } from '@/lib/site';

/** The homepage and live content pages; never /claim/*, /claim-now/thank-you/, drafts or the styleguide (appendix §5). */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = getLivePages().filter((p) => p.frontmatter.template === 'utility' && !p.frontmatter.slug.startsWith('/claim/'));
  return [
    { url: absoluteUrl('/'), lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/claim-now/'), lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    ...pages.map((p) => ({
      url: absoluteUrl(p.frontmatter.slug),
      lastModified: new Date(p.frontmatter.lastReviewed),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
