import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteId } from '@/lib/site-id';
import { Band, SiteFooter, SiteHeader } from '@/components';
import { absoluteUrl, site } from '@/lib/site';
import { ClaimStart } from './ClaimStart';
import styles from './claim-now.module.css';

export const metadata: Metadata = {
  title: { absolute: `Start your non-fault claim | ${site.name}` },
  description: 'Start a non-fault claim online, or call 0800 048 0048 and a person in the UK picks up.',
  alternates: { canonical: '/claim-now/' },
};

/**
 * /claim-now/ (§0, appendix §7): a stub. The reg box posts to /api/claim-start/,
 * which forwards to the shared 1.0 claims API with source "mcd2", and
 * Ollie's question flow mounts at #claim-flow exactly as in 1.0.
 */
export default function ClaimNowPage() {
  if (siteId !== 'mcd2') notFound();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': absoluteUrl('/#org'), name: site.name, url: absoluteUrl('/'), telephone: site.phone.e164 },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Start your claim', item: absoluteUrl('/claim-now/') },
        ],
      },
    ],
  };
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className={styles.hero} data-hero>
          <div className={`wrap ${styles.heroIn}`}>
            <p className={styles.kicker}>Nothing goes through your policy.</p>
            <h1 className={styles.h1}>
              Start your <span className="hl">non-fault</span> claim
            </h1>
            <h2 className={styles.h2}>Enter your reg and your handler takes it from there. Or call, and we do it together on the phone.</h2>
          </div>
        </section>
        <section className={styles.section} data-placement="claim-now">
          <div className={`wrap ${styles.grid}`}>
            <ClaimStart />
            <div className={styles.aside}>
              <h2>What we ask you</h2>
              <ul>
                <li>The other driver’s name, reg and insurer, if you have them</li>
                <li>Where and when it happened</li>
                <li>Whether anyone was hurt</li>
              </ul>
              <h2>What happens next</h2>
              <p>Your handler calls you back, confirms the other driver is covered and the fault is clear, and arranges your car. That is your bit done.</p>
              <p className={styles.call}>
                Rather talk? <a href={site.phone.href}>{site.phone.display}</a>. A person in the UK picks up.
              </p>
            </div>
          </div>
        </section>
        <Band />
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
