import { IconCircle } from '@/components/Icon/Icon';
import type { IconName } from '@/components/Icon/Icon';
import { ProofGrid } from '@/components/ProofGrid/ProofGrid';
import styles from './KeepsStrip.module.css';

export type KeepItem = { icon: IconName; label: string };

/**
 * The template pages' proof section: the 2×2 proof grid from the canonical
 * proof points (four across on desktop). A page may supply its own three
 * items instead (frontmatter `keepsItems`, the service-areas page).
 */
export function KeepsStrip({ items, label }: { items?: ReadonlyArray<KeepItem>; label?: string }) {
  return (
    <section className={styles.keeps} aria-label={label ?? 'What you keep'} data-keeps>
      {items ? (
        <div className={`wrap ${styles.keepsIn}`}>
          {items.map((k) => (
            <div key={k.label} className={styles.keep}>
              <IconCircle name={k.icon} variant="ink" size={44} iconSize={24} />
              {k.label}
            </div>
          ))}
        </div>
      ) : (
        <div className={`wrap ${styles.gridIn}`}>
          <ProofGrid />
        </div>
      )}
    </section>
  );
}
