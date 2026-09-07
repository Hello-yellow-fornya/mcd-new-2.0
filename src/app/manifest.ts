import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';

/** Web app manifest (appendix §5): the icons are the mark on yellow, cut from design/logo/favicons (pnpm logo:png). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    start_url: '/',
    display: 'browser',
    background_color: '#F7F5EF',
    theme_color: '#F3CD3E',
    icons: [
      { src: '/favicons/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/favicons/favicon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/favicons/favicon-1024.png', sizes: '1024x1024', type: 'image/png' },
    ],
  };
}
