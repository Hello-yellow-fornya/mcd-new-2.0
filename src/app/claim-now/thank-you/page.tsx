import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Band, Button, SiteFooter, SiteHeader } from '@/components';
import { site } from '@/lib/site';
import { cta } from '@site/copy';
import { ThankYouEvent } from './ThankYouEvent';
import styles from '../claim-now.module.css';

export const metadata: Metadata = {
  title: 'Claim started',
  robots: { index: false, follow: false },
  alternates: { canonical: '/claim-now/thank-you/' },
};

/** The thank-you route the claim flow redirects to. Fires the conversion; not indexed. */
export default function ThankYouPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className={styles.hero}>
          <div className={`wrap ${styles.heroIn}`}>
            <h1 className={styles.h1}>That’s your bit done.</h1>
            <h2 className={styles.h2}>Your handler calls you back to confirm the other driver is covered and to arrange your car.</h2>
            <p style={{ margin: '18px 0 24px', color: 'var(--muted)' }}>If anything changes before then, ring us.</p>
            <Button href={site.phone.href} variant="yellow" icon="phone" data-cta="call">
              {cta.call}
            </Button>
          </div>
        </section>
        <Band />
      </main>
      <SiteFooter />
      <Suspense fallback={null}>
        <ThankYouEvent />
      </Suspense>
    </>
  );
}
