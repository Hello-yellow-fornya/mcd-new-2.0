import { NextResponse, type NextRequest } from 'next/server';
import { isLiveHost } from '@/lib/host';

/**
 * Site-wide noindex on every deployment not served from a real domain
 * (CLAUDE.md §0, appendix §2a). The header is the authoritative signal; the
 * meta tag and robots.txt follow the same host rule elsewhere.
 */
export function middleware(req: NextRequest) {
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  const res = NextResponse.next();
  if (!isLiveHost(host)) res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|images/|fonts/|icons/).*)'],
};
