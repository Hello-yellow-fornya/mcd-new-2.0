import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

/** The homepage for now; content pages are added with their steps. Never /claim/* or drafts (appendix §5). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: absoluteUrl('/'), lastModified: new Date(), changeFrequency: 'weekly', priority: 1 }];
}
