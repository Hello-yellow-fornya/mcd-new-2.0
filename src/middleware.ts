import { NextResponse } from 'next/server';
import { isIndexable } from '@/lib/indexing';

/**
 * Everything except the indexable pages (src/lib/indexing.ts) is
 * `noindex, nofollow` on every host — the header here, the meta tag in the
 * root layout, and a robots.txt that allows only the same paths. Claims 24/7
 * carries the same copy as the 1.0 site, so only its homepage may be indexed;
 * Claims Report Line stays fully unindexed.
 */
export function middleware(req: import('next/server').NextRequest) {
  const res = NextResponse.next();
  if (!isIndexable(req.nextUrl.pathname)) res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|images/|fonts/|icons/|favicons/|logo/).*)'],
};
