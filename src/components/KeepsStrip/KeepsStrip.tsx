import { IconCircle } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/Icon';
import { keeps } from '@site/copy';
import styles from './KeepsStrip.module.css';

export type KeepItem = { icon: IconName; label: string };

/** Three things you keep: no excess, no claims bonus, like-for-like car. Ink circles, yellow icons. A page may supply its own three (frontmatter `keepsItems`). */
export function KeepsStrip({ items = keeps, label = 'What you keep' }: { items?: ReadonlyArray<KeepItem>; label?: string }) {
  return (
    <section className={styles.keeps} aria-label={label}>
      <div className={`wrap ${styles.keepsIn}`}>
        {items.map((k) => (
          <div key={k.label} className={styles.keep}>
            <IconCircle name={k.icon} variant="ink" size={44} iconSize={24} />
            {k.label}
          </div>
        ))}
      </div>
    </section>
  );
}
