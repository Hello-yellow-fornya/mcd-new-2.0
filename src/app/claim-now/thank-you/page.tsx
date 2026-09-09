import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteId } from '@/lib/site-id';
import { Suspense } from 'react';
import { Button, SiteFooter, SiteHeader } from '@/components';
import { site } from '@/lib/site';
import { cta } from '@site/copy';
import { ThankYouEvent } from './ThankYouEvent';
import styles from '../claim-now.module.css';

export const metadata: Metadata = {
  title: 'Claim started',
  robots: { index: false, follow: false },
  alternates: { canonical: '/claim-now/thank-you/' },
};

/** The thank-you route the claim flow redirects to: a plain acknowledgement and
 * the phone number, nothing else. Fires the conversion; not indexed. */
export default function ThankYouPage() {
  if (siteId !== 'mcd2') notFound();
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className={styles.hero}>
          <div className={`wrap ${styles.heroIn}`}>
            <h1 className={styles.h1}>Thank you.</h1>
            <h2 className={styles.h2}>We have your enquiry and will call you back.</h2>
            <p style={{ margin: '18px 0 24px', color: 'var(--muted)' }}>Need us sooner?</p>
            <Button href={site.phone.href} variant="yellow" icon="phone" data-cta="call">
              {cta.call}
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
      <Suspense fallback={null}>
        <ThankYouEvent />
      </Suspense>
    </>
  );
}
