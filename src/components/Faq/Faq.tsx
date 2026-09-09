import { faq as defaults } from '@site/copy';
import styles from './Faq.module.css';

export type FaqItem = { q: string; a: string };

type Props = {
  h2?: string;
  sub?: string;
  items?: readonly FaqItem[];
  /** Emit FAQPage JSON-LD from the same data (appendix §4). Off on noindex landing pages. */
  schema?: boolean;
  /** Inside prose: the accordion alone, no section, heading or intro. */
  inline?: boolean;
};

/** FAQ (§0): <details> accordion, first open, ochre plus/minus; schema from the same data. */
export function Faq({ h2 = defaults.h2, sub = defaults.sub, items = defaults.items, schema = true, inline = false }: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
  const list = items.map((i, idx) => (
    <details key={i.q} className={styles.details} open={idx === 0}>
      <summary className={styles.summary}>{i.q}</summary>
      <div className={styles.a}>{i.a}</div>
    </details>
  ));
  if (inline) {
    return (
      <div className={styles.inline} data-faq>
        {list}
        {schema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
      </div>
    );
  }
  return (
    <section className={styles.section} id="faq" data-faq>
      <div className={`wrap ${styles.inner}`}>
        <div>
          <h2>{h2}</h2>
          <p className={styles.sub}>{sub}</p>
        </div>
        <div>{list}</div>
      </div>
      {schema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
    </section>
  );
}
