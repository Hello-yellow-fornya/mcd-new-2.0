import type { Metadata } from 'next';
import { Button, Closing, SiteFooter, SiteHeader } from '@/components';
import { cta, nav } from '@site/copy';
import { site } from '@/lib/site';
import styles from './not-found.module.css';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false, follow: false } };

/** Branded 404 (appendix §5). */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className={styles.section}>
          <div className="wrap">
            <h1>That page isn’t here.</h1>
            <p className={styles.p}>The link may be old, or the page hasn’t been written yet. If you’ve been hit by someone else, the number still works.</p>
            <div className={styles.ctas}>
              <Button href={nav.claimHref} variant="ink">
                {cta.start}
              </Button>
              <Button href={site.phone.href} variant="yellow" icon="phone">
                {cta.call}
              </Button>
              <Button href="/" variant="outline-ink">
                Back to the homepage
              </Button>
            </div>
          </div>
        </section>
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
