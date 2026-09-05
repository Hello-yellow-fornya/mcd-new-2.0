import { Button } from '@/components/Button/Button';
import { cta, nav } from '@/data/copy';
import { site } from '@/lib/site';
import styles from './SectionCta.module.css';

type Props = {
  /** Short labels ("Start your claim" / "Call now") for the mobile pair under the table. */
  compact?: boolean;
  className?: string;
};

/** The ink + yellow CTA pair that closes a section (§0 copy). */
export function SectionCta({ compact, className }: Props) {
  return (
    <p className={[styles.pair, compact ? styles.compact : '', className].filter(Boolean).join(' ')}>
      <Button href={nav.claimHref} variant="ink" data-cta="start">
        <span className={styles.full}>{cta.start}</span>
        <span className={styles.short}>{cta.startShort}</span>
      </Button>
      <Button href={site.phone.href} variant="yellow" icon="phone" data-cta="call">
        <span className={styles.full}>{cta.call}</span>
        <span className={styles.short}>{cta.callNow}</span>
      </Button>
    </p>
  );
}
