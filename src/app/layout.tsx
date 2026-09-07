import type { Metadata } from 'next';
import { body, display } from '@/fonts';
import { site, siteUrl } from '@/lib/site';
import { Sprite } from '@/components/Icon/Sprite';
import { Analytics } from '@/components/Analytics/Analytics';
import { ConsentBanner } from '@/components/Consent/ConsentBanner';
import '@/styles/tokens.css';
import './globals.css';

export const metadata: Metadata = {
  // Canonical and OG URLs resolve against NEXT_PUBLIC_SITE_URL (§0).
  metadataBase: new URL(siteUrl),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  // Claims 24/7 is a PPC-only site: every page is noindex, nofollow on every
  // host (meta here, X-Robots-Tag in the middleware, disallow-all robots.txt,
  // no sitemap). Canonicals point to this site's own URL, never to 1.0.
  robots: { index: false, follow: false },
  openGraph: {
    siteName: site.name,
    locale: site.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 2.0's own GTM container (§0). Nothing loads without it, and nothing before consent.
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Sprite />
        {children}
        <Analytics gtmId={gtmId} />
        <ConsentBanner gtmId={gtmId} />
      </body>
    </html>
  );
}
