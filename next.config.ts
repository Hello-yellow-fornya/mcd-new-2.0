import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Slug rules (appendix §5): trailing slashes on, lowercase.
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Every page is noindex, nofollow (Claims 24/7 brief); src/middleware.ts sets the same header.
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
};

export default nextConfig;
