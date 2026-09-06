import styles from './Toc.module.css';

export type TocItem = { id: string; text: string };

/** Sticky "On this page" list built from the page's H2s. */
export function Toc({ items, title = 'On this page' }: { items: TocItem[]; title?: string }) {
  return (
    <aside className={styles.toc} aria-label={title}>
      <p>{title}</p>
      <ol>
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`}>{i.text}</a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
