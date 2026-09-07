import { Button } from '@/components/Button/Button';
import { ProofGrid } from '@/components/ProofGrid/ProofGrid';
import { WaitRow } from './WaitRow';
import { cta, nav } from '@/data/copy';
import { site } from '@/lib/site';
import styles from './HomeHero.module.css';

type Highlighted = { before: string; highlight: string; after: string };

function Hl({ t }: { t: Highlighted }) {
  return (
    <>
      {t.before}
      {t.highlight ? <span className="hl">{t.highlight}</span> : null}
      {t.after}
    </>
  );
}

type Props = {
  h1: Highlighted;
  h2: Highlighted;
  /** Landing pages put a short line under the H2, mobile only. */
  sub?: string;
};

/**
 * The homepage hero (§0). Desktop: two columns, H1 with the bar under one or
 * two words, H2 with its bar, the ink + yellow CTA pair, the wait row; the
 * proof grid on the right. Mobile (mcd-2-0-homepage-mobile-v2.html):
 * fold-locked — the section fills the viewport minus the nav and the
 * ClaimsStrip, the grid takes the one flexible gap (margin-top: auto), then
 * the 56px call pill, the wait row and the outlined online CTA, so the strip's
 * bottom edge lands on the fold at every viewport height.
 */
export function HomeHero({ h1, h2, sub }: Props) {
  return (
    <section className={styles.hero} data-hero>
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.copy}>
          <h1 className={styles.h1}>
            <Hl t={h1} />
          </h1>
          <h2 className={styles.h2}>
            <Hl t={h2} />
          </h2>
          {sub ? <p className={styles.sub}>{sub}</p> : null}
          <div className={styles.desktopCtas}>
            <Button href={nav.claimHref} variant="ink" data-cta="start">
              {cta.start}
            </Button>
            <Button href={site.phone.href} variant="yellow" icon="phone" data-cta="call">
              {cta.call}
            </Button>
          </div>
          <WaitRow className={styles.desktopWait} />
        </div>
        <ProofGrid className={styles.grid} />
        <div className={styles.mobileCtas}>
          <Button href={site.phone.href} variant="ink" size="hero" icon="phone" data-cta="call">
            {cta.callNowHero}
          </Button>
          <WaitRow className={styles.mobileWait} />
          <Button href={nav.claimHref} variant="outline-ink" iconAfter="arrow" block className={styles.online} data-cta="start-online">
            {cta.startOnline}
          </Button>
        </div>
      </div>
    </section>
  );
}
