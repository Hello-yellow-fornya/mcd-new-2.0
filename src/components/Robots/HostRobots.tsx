'use client';

import { useEffect } from 'react';
import { isLiveHost } from '@/lib/host';

/**
 * Adds <meta name="robots" content="noindex, nofollow"> when the page is not
 * served from the real domain (appendix §2a). Pages are static, so the host
 * is only known in the browser; the X-Robots-Tag header from the middleware
 * carries the same rule server-side, and while the site URL is still a
 * .vercel.app address the root layout renders the meta tag statically too.
 */
export function HostRobots() {
  useEffect(() => {
    if (isLiveHost(location.host)) return;
    if (document.querySelector('meta[name="robots"]')) return;
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    meta.dataset.host = location.host;
    document.head.appendChild(meta);
  }, []);
  return null;
}
