import { Button } from '@/components/Button/Button';
import { site } from '@/lib/site';
import { cta, finalCta, nav } from '../copy';
import styles from './FinalCta.module.css';

/** The navy final CTA (ocr-homepage-concept.html .final): the H2 with the green chip, one line, the green pill and the white outlined call. */
export function FinalCta() {
  return (
    <section className={`${styles.final} on-dark`} data-final-cta data-placement="final-cta">
      <div className={`wrap ${styles.inner}`}>
        <div>
          <h2 className={styles.h2}>
            {finalCta.h2.before}
            <span className={styles.chip}>{finalCta.h2.chip}</span>
          </h2>
          <p className={styles.p}>{finalCta.text}</p>
        </div>
        <div className={styles.ctas}>
          <Button href={nav.claimHref} variant="yellow" data-cta="start">
            {cta.start}
          </Button>
          <Button href={site.phone.href} variant="outline-ink" icon="phone" className={styles.outWhite} data-cta="call">
            {site.phone.display}
          </Button>
        </div>
      </div>
    </section>
  );
}
