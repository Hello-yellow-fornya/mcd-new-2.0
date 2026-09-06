import { SectionCta } from '@/components/SectionCta/SectionCta';
import { howItWorks } from '@/data/copy';
import styles from './Steps.module.css';

/** How it works (§0): four step cards on cream, yellow number circles. */
export function Steps() {
  return (
    <section className={styles.section} id="how-it-works" data-steps>
      <div className="wrap">
        <h2>{howItWorks.h2}</h2>
        <p className={styles.sub}>
          <b>{howItWorks.lead}</b> {howItWorks.sub}
        </p>
        <ol className={styles.steps}>
          {howItWorks.steps.map((s, i) => (
            <li key={s.title} className={styles.step}>
              <b className={styles.n} aria-hidden="true">
                {i + 1}
              </b>
              <span>
                <strong>{s.title}</strong> {s.text}
              </span>
            </li>
          ))}
        </ol>
        <SectionCta />
      </div>
    </section>
  );
}
