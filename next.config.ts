import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Slug rules (appendix §5): trailing slashes on, lowercase.
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // The staging noindex is host-based and lives in src/middleware.ts (appendix §2a).
  async headers() {
    return [
      // Paid landing pages are never indexed (appendix §6), whatever the host.
      { source: '/claim/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
};

export default nextConfig;
