import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/** Web app manifest (appendix §5): the site's icons and colours (scripts/site-assets.mjs writes public/favicons). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    start_url: '/',
    display: 'browser',
    background_color: site.theme.background,
    theme_color: site.theme.color,
    icons: [
      { src: '/favicons/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/favicons/favicon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/favicons/favicon-1024.png', sizes: '1024x1024', type: 'image/png' },
    ],
  };
}
