import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/** Web app manifest (appendix §5): the square icon set cut from the logo. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: 'MCD',
    description: site.description,
    start_url: '/',
    display: 'browser',
    background_color: '#F7F5EF',
    theme_color: '#19180F',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
