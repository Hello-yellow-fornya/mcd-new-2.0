import type { NextConfig } from 'next';
import { join } from 'node:path';
import { siteForBuild } from './src/lib/site-id';

/**
 * One repo, more than one site (sites/<id>/). NEXT_PUBLIC_SITE picks the site;
 * the resolved id is inlined so client and server code agree, and "@site"
 * resolves to the site's folder for both bundlers.
 */
const siteId = siteForBuild();
const siteDir = join(__dirname, 'sites', siteId);

const nextConfig: NextConfig = {
  // Slug rules (appendix §5): trailing slashes on, lowercase.
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  env: { NEXT_PUBLIC_SITE: siteId },
  // The site's tsconfig carries the "@site/*" path, and Next reads the paths from here for the bundler as well as for the type check.
  typescript: { tsconfigPath: siteId === 'mcd2' ? 'tsconfig.json' : `tsconfig.${siteId}.json` },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  webpack(config) {
    config.resolve.alias['@site'] = siteDir;
    return config;
  },
  turbopack: {
    resolveAlias: { '@site': `./sites/${siteId}` },
  },
  // Every page is noindex, nofollow (Claims 24/7 brief); src/middleware.ts sets the same header.
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
};

export default nextConfig;
