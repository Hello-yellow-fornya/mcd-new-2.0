import type { Metadata } from 'next';
import { site } from '@/lib/site';
import styles from './page.module.css';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

/**
 * Step 1 placeholder. The hero copy is the signed-off H1/H2 pair from
 * CLAUDE.md §0 so the type, the highlight bar and the CTA pair can be checked;
 * the real homepage lands in step 3 from design/mcd-2-0-homepage-*.html.
 */
export default function HomePage() {
  return (
    <main id="main">
      <section className={styles.hero}>
        <div className="wrap">
          <p className={styles.eyebrow}>Independent accident management</p>
          <h1>
            <span className="hl">Non-fault</span> accident?
          </h1>
          <h2 className={styles.sub}>
            Choose the <span className="hl">smarter way</span> to claim.
          </h2>
          <div className={styles.ctas}>
            <a className={`${styles.btn} ${styles.btnInk}`} href="/claim-now/">
              Start your non-fault claim
            </a>
            <a className={`${styles.btn} ${styles.btnYellow}`} href={site.phone.href}>
              Call {site.phone.display}
            </a>
          </div>
          <p className={styles.wait}>Lines open 24/7. A person in the UK picks up.</p>
        </div>
      </section>
    </main>
  );
}
