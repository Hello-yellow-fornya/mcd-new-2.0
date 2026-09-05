import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/lib/site';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false, follow: false } };

/** Branded 404 (appendix §5). Restyled with the header and footer in step 2. */
export default function NotFound() {
  return (
    <main id="main">
      <section className={styles.hero}>
        <div className="wrap">
          <h1>That page isn’t here.</h1>
          <p>The link may be old, or the page hasn’t been written yet. If you’ve been hit by someone else, the number still works.</p>
          <div className={styles.ctas}>
            <a className={`${styles.btn} ${styles.btnInk}`} href="/claim-now/">
              Start your non-fault claim
            </a>
            <a className={`${styles.btn} ${styles.btnYellow}`} href={site.phone.href}>
              Call {site.phone.display}
            </a>
            <Link className={styles.btn} href="/">
              Back to the homepage
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
