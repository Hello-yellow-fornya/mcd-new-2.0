import styles from './StepCards.module.css';

export type StepCard = { title: string; body: string; id?: string };

/** The 2×2 step cards inside prose (the SEO templates' .steps): white, hairline, Archivo Black title. */
export function StepCards({ items, className }: { items: ReadonlyArray<StepCard>; className?: string }) {
  return (
    <ol className={[styles.steps, className].filter(Boolean).join(' ')} data-step-cards>
      {items.map((s, i) => (
        <li key={s.id ?? i} id={s.id} className={styles.step}>
          <b>{s.title}</b>
          <p>{s.body}</p>
        </li>
      ))}
    </ol>
  );
}
