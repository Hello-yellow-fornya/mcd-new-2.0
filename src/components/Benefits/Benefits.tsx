import { IconCircle } from '@/components/Icon/Icon';
import { SectionCta } from '@/components/SectionCta/SectionCta';
import { benefits } from '@site/copy';
import styles from './Benefits.module.css';

/** Benefits with icons (§0): three cream cards, ink circle with a yellow icon. */
export function Benefits() {
  return (
    <section className={styles.section} id="benefits" data-benefits>
      <div className="wrap">
        <h2>{benefits.h2}</h2>
        <p className={styles.sub}>{benefits.sub}</p>
        <div className={styles.cards}>
          {benefits.cards.map((c) => (
            <div key={c.h3} className={styles.card}>
              <IconCircle name={c.icon} variant="ink" size={48} iconSize={26} className={styles.circle} />
              <h3 className={styles.h3}>{c.h3}</h3>
              <p className={styles.p}>{c.p}</p>
            </div>
          ))}
        </div>
        <SectionCta />
      </div>
    </section>
  );
}
