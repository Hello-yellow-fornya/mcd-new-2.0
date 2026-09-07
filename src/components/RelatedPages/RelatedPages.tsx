import Link from 'next/link';
import styles from './RelatedPages.module.css';

export type RelatedPage = { href: string; title: string; description: string };

/** Three related-page cards on cream. */
export function RelatedPages({ items, heading = 'Related pages' }: { items: ReadonlyArray<RelatedPage>; heading?: string }) {
  return (
    <section className={styles.related} aria-labelledby="rel-h" data-related>
      <div className="wrap">
        <h2 id="rel-h">{heading}</h2>
        <div className={styles.grid}>
          {items.map((p) => (
            <Link key={p.href} className={styles.rel} href={p.href}>
              <b>{p.title}</b>
              <span>{p.description}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
