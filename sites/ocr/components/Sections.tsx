import { Faq } from '@/components/Faq/Faq';
import { Icon } from '@/components/Icon/Icon';
import { faq, howItWorks, ways, who } from '../copy';
import styles from './Sections.module.css';

type Parts = { before: string; highlight: string; after: string };

/** The mint underlay highlight in a body heading (one of the three highlights, guidelines §3). */
export function Hl({ parts }: { parts: Parts }) {
  return (
    <>
      {parts.before}
      <span className={styles.hlMint}>{parts.highlight}</span>
      {parts.after}
    </>
  );
}

/** How it works: four numbered paper cards (mint number circles). */
export function HowItWorks() {
  return (
    <section id="how" className={styles.sec} data-section="how">
      <div className="wrap">
        <p className={styles.eyebrow}>{howItWorks.eyebrow}</p>
        <h2 className={styles.h2}>
          <Hl parts={howItWorks.h2Parts} />
        </h2>
        <p className={styles.sub}>
          {howItWorks.lead} {howItWorks.sub}
        </p>
        <ol className={styles.steps}>
          {howItWorks.steps.map((s, i) => (
            <li key={s.title} className={styles.step}>
              <span className={styles.n} aria-hidden="true">
                {i + 1}
              </span>
              <h3 className={styles.h3}>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Mark({ ok }: { ok: boolean }) {
  return (
    <span className={[styles.mk, ok ? styles.ok : styles.no].join(' ')}>
      <Icon name={ok ? 'check' : 'cross'} label={ok ? 'Yes' : 'No'} />
    </span>
  );
}

/** "Report it here, not to a queue": the new way beside the old way. */
export function Ways() {
  return (
    <section className={`${styles.sec} ${styles.paper}`} data-section="ways">
      <div className="wrap">
        <p className={styles.eyebrow}>{ways.eyebrow}</p>
        <h2 className={styles.h2}>
          <Hl parts={ways.h2} />
        </h2>
        <p className={styles.sub}>{ways.sub}</p>
        <div className={styles.ways}>
          {[ways.newWay, ways.oldWay].map((way, w) => (
            <div key={way.h3} className={[styles.way, w === 1 ? styles.old : ''].join(' ')}>
              <p className={styles.eyebrow}>{way.eyebrow}</p>
              <h3 className={styles.h3}>{way.h3}</h3>
              <ul className={styles.wayList}>
                {way.items.map((item) => (
                  <li key={item}>
                    <Mark ok={w === 0} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Who we help: the tags. */
export function Who() {
  return (
    <section id="who" className={`${styles.sec} ${styles.paper}`} data-section="who">
      <div className="wrap">
        <p className={styles.eyebrow}>{who.eyebrow}</p>
        <h2 className={styles.h2}>
          <Hl parts={who.h2} />
        </h2>
        <ul className={styles.tags}>
          {who.tags.map((t) => (
            <li key={t.label} className={[styles.tag, 'on' in t && t.on ? styles.tagOn : ''].join(' ')}>
              {t.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** "What's the catch?": the FAQ with "What if it was my fault?" open first. */
export function CatchFaq() {
  return (
    <section id="catch" className={styles.sec} data-section="catch">
      <div className={`wrap ${styles.faq}`}>
        <div>
          <p className={styles.eyebrow}>{faq.eyebrow}</p>
          <h2 className={styles.h2}>
            <Hl parts={faq.h2Parts} />
          </h2>
          <p className={styles.faqSub}>{faq.sub}</p>
        </div>
        <Faq inline items={faq.items} />
      </div>
    </section>
  );
}
