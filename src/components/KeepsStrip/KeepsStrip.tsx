import { IconCircle } from '@/components/Icon/Icon';
import { keeps } from '@/data/copy';
import styles from './KeepsStrip.module.css';

/** Three things you keep: no excess, no claims bonus, like-for-like car. Ink circles, yellow icons. */
export function KeepsStrip() {
  return (
    <section className={styles.keeps} aria-label="What you keep">
      <div className={`wrap ${styles.keepsIn}`}>
        {keeps.map((k) => (
          <div key={k.label} className={styles.keep}>
            <IconCircle name={k.icon} variant="ink" size={44} iconSize={24} />
            {k.label}
          </div>
        ))}
      </div>
    </section>
  );
}
