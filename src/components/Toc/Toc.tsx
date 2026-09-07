'use client';

import { useId, useState } from 'react';
import styles from './Toc.module.css';

export type TocItem = { id: string; text: string };

/**
 * "On this page", built from the page's H2s. Sticky list on desktop; on
 * mobile it collapses into a tap-to-open row (the list is hidden until the
 * button is pressed, and closes again when a link is chosen).
 */
export function Toc({ items, title = 'On this page' }: { items: TocItem[]; title?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <aside className={styles.toc} aria-label={title} data-toc data-open={open || undefined}>
      <p className={styles.title}>{title}</p>
      <button type="button" className={styles.toggle} aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        {title}
        <span className={styles.chev} aria-hidden="true" />
      </button>
      <ol id={id} className={styles.list}>
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} onClick={() => setOpen(false)}>
              {i.text}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
