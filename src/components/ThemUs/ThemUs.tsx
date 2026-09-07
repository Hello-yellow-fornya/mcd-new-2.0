import { Icon } from '@/components/Icon/Icon';
import { SectionCta } from '@/components/SectionCta/SectionCta';
import { themUs } from '@/data/copy';
import styles from './ThemUs.module.css';

/**
 * The their/your table (§0): two columns, an outlined cross on their side, a
 * yellow tick on yours, with the CTA pair beneath.
 */
export function ThemUs({ cta = true }: { cta?: boolean }) {
  return (
    <section className={styles.section} id="ways" data-them-us>
      <div className="wrap">
        <div className={styles.table} role="table" aria-label="Their claims department compared with your Claims 24/7 handler">
          <div className={styles.head} role="row">
            {themUs.heads.map((h) => (
              <div key={h} role="columnheader">
                {h}
              </div>
            ))}
          </div>
          {themUs.rows.map(([them, us]) => (
            <div key={us} className={styles.row} role="row">
              <div className={styles.them} role="cell">
                <span className={`${styles.mk} ${styles.no}`}>
                  <Icon name="cross" label="No" />
                </span>
                <span>{them}</span>
              </div>
              <div className={styles.us} role="cell">
                <span className={`${styles.mk} ${styles.ok}`}>
                  <Icon name="check" label="Yes" />
                </span>
                <span>{us}</span>
              </div>
            </div>
          ))}
        </div>
        {cta ? <SectionCta compact /> : null}
      </div>
    </section>
  );
}
