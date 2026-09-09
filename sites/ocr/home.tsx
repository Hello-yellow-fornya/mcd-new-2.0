import type { Metadata } from 'next';
import { absoluteUrl, site } from '@/lib/site';
import { SiteHeader } from './header';
import { SiteFooter } from './footer';
import { Hero } from './components/Hero';
import { CatchFaq, HowItWorks, Ways, Who } from './components/Sections';
import { FinalCta } from './components/FinalCta';
import { CallBar } from './components/CallBar';

export const metadata: Metadata = {
  title: { absolute: `Had an accident? Report it here | ${site.name}` },
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: { title: 'Had an accident? Report it here.', description: site.description, url: '/' },
};

/**
 * The homepage, to design/ocr/ocr-homepage-concept.html (desktop) and
 * ocr-homepage-mobile.html: hero with the report form → how it works →
 * report it here, not to a queue → who we help → what's the catch (FAQ) →
 * the navy final CTA → footer. No handler section and no claims-department band.
 */
export default function HomePage() {
  const jsonLd = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: site.name, legalName: site.legalName, url: absoluteUrl('/'), telephone: site.phone.e164, areaServed: 'GB' },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: absoluteUrl('/') },
  ];
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <HowItWorks />
        <Ways />
        <Who />
        <CatchFaq />
        <FinalCta />
      </main>
      <SiteFooter />
      <CallBar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
