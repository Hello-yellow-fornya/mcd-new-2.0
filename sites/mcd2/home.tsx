import type { Metadata } from 'next';
import { Band, Benefits, ClaimsStrip, Faq, HomeHero, IndependenceLine, ReviewBand, SiteFooter, SiteHeader, Steps, ThemUs } from '@/components';
import { hero } from '@site/copy';
import { absoluteUrl, site } from '@/lib/site';

export const metadata: Metadata = {
  title: `${site.name}: non-fault accident? Choose the smarter way to claim`,
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: { title: 'Non-fault accident? Choose the smarter way to claim.', description: site.description, url: '/' },
};

/**
 * The homepage (§0 order): hero → ClaimsStrip → review band → the band →
 * their/your table with its CTA pair → independence line → benefits → how it
 * works → FAQ → footer. Desktop from design/mcd-2-0-homepage-concept.html,
 * mobile from design/mcd-2-0-homepage-mobile-v2.html, where the hero is
 * fold-locked so the strip ends on the fold.
 */
export default function HomePage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: site.name,
      legalName: site.legalName,
      url: absoluteUrl('/'),
      telephone: site.phone.e164,
      areaServed: 'GB',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.name,
      url: absoluteUrl('/'),
    },
  ];
  return (
    <>
      <SiteHeader />
      <main id="main">
        <HomeHero h1={hero.h1} h2={hero.h2} />
        <ClaimsStrip />
        <ReviewBand />
        <Band />
        <ThemUs />
        <IndependenceLine />
        <Benefits />
        <Steps />
        <Faq />
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
