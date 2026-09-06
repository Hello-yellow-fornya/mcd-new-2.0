import type { Metadata } from 'next';
import { body, display } from '@/fonts';
import { site, siteUrl } from '@/lib/site';
import { isStagingSite } from '@/lib/host';
import { HostRobots } from '@/components/Robots/HostRobots';
import '@/styles/tokens.css';
import './globals.css';

export const metadata: Metadata = {
  // Canonical, OG and sitemap URLs resolve against NEXT_PUBLIC_SITE_URL (§0).
  metadataBase: new URL(siteUrl),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  // No real domain yet: every deployment is noindex, rendered statically.
  // With a real domain the pages are indexable by default and HostRobots plus
  // the middleware add noindex wherever the host is not that domain.
  robots: isStagingSite()
    ? { index: false, follow: false }
    : { index: true, follow: true, 'max-image-preview': 'large' },
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
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
        <HostRobots />
      </body>
    </html>
  );
}
