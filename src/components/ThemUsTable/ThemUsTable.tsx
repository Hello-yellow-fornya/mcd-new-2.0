import { Icon } from '@/components/Icon/Icon';
import styles from './ThemUsTable.module.css';

export type ThemUsRow = { them: string; us: string };

type Props = {
  head: readonly [string, string];
  rows: ReadonlyArray<ThemUsRow>;
  /** them-us: cross on the left, yellow tick on the right. you-we: ticks both sides (who does what). */
  variant?: 'them-us' | 'you-we';
  label?: string;
  className?: string;
};

function Mark({ ok }: { ok: boolean }) {
  return (
    <span className={[styles.mk, ok ? styles.ok : styles.no].join(' ')}>
      <Icon name={ok ? 'check' : 'cross'} size={14} label={ok ? 'Yes' : 'No'} />
    </span>
  );
}

/** The two-column comparison inside prose (the SEO templates' .tu): outlined cross, yellow tick. */
export function ThemUsTable({ head, rows, variant = 'them-us', label = 'Their claims department compared with your MCD claims handler', className }: Props) {
  const leftOk = variant === 'you-we';
  return (
    <div className={[styles.tu, className].filter(Boolean).join(' ')} role="table" aria-label={label}>
      <div className={styles.head} role="row">
        <div role="columnheader">{head[0]}</div>
        <div role="columnheader">{head[1]}</div>
      </div>
      {rows.map((r, i) => (
        <div key={i} className={styles.row} role="row">
          <div role="cell" className={leftOk ? styles.us : styles.them}>
            <Mark ok={leftOk} />
            <span>{r.them}</span>
          </div>
          <div role="cell" className={styles.us}>
            <Mark ok />
            <span>{r.us}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
