import { NextResponse } from 'next/server';

/**
 * Claims 24/7 is a PPC-only site: every page, on every host, is
 * `noindex, nofollow` (the header here, the meta tag in the root layout, a
 * disallow-all robots.txt, no sitemap). It must not compete with the 1.0
 * site, which carries the same copy.
 */
export function middleware() {
  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|images/|fonts/|icons/|favicons/|logo/).*)'],
};
