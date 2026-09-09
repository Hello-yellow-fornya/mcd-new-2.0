import { Button } from '@/components/Button/Button';
import { band, cta, nav } from '@site/copy';
import { site } from '@/lib/site';
import styles from './Band.module.css';

/**
 * The band (§0): ink, three white Archivo Black lines with "We work for you."
 * in a yellow chip with ink text, then two small outlined yellow pills. A
 * page may pass its own three lines (the third-party page's "Their insurer…").
 */
type Lines = { l0: string; l1: string; chip: string };

export function Band({ lines = band }: { lines?: Lines }) {
  return (
    <section className={`${styles.band} on-dark`} data-band>
      <div className="wrap">
        <p className={styles.l0}>{lines.l0}</p>
        <h2 className={styles.h2}>
          <span className={styles.l1}>{lines.l1}</span>
          <span className={styles.l2}>
            <mark className={styles.chip}>{lines.chip}</mark>
          </span>
        </h2>
        <div className={styles.ctas}>
          <Button href={nav.claimHref} variant="outline-yellow" size="band" data-cta="start">
            {cta.startShort}
          </Button>
          <Button href={site.phone.href} variant="outline-yellow" size="band" icon="phone" data-cta="call">
            {cta.callNow}
          </Button>
        </div>
      </div>
    </section>
  );
}
