import { IconCircle } from '@/components/Icon/Icon';
import { strip } from '@site/copy';
import { claimAttrs, claimVisible, getClaim } from '@/lib/claims';
import styles from './ClaimsStrip.module.css';

/**
 * The ClaimsStrip (§0): ink band, yellow text, yellow icon circles with ink
 * icons, scrolling. The track is doubled so the loop is seamless; the copy
 * is announced once and the duplicate is hidden from assistive tech.
 * Pauses on hover and touch; with reduced motion it is a scrollable row.
 */
export function ClaimsStrip() {
  // From the canonical proof points; a gated item renders only while its claim may (appendix §6).
  const items = strip.filter((it) => !it.claim || claimVisible(getClaim(it.claim)));
  return (
    <div className={styles.strip} data-claims-strip>
      <ul className={styles.track} aria-label="What we handle">
        {items.map((it) => (
          <li key={it.text} className={styles.item} {...(it.claim ? claimAttrs(getClaim(it.claim)) : {})}>
            <IconCircle name={it.icon} variant="yellow" size={30} iconSize={17} className={styles.circle} />
            {it.text}
          </li>
        ))}
        {items.map((it) => (
          <li key={`${it.text}-2`} className={styles.item} aria-hidden="true">
            <IconCircle name={it.icon} variant="yellow" size={30} iconSize={17} className={styles.circle} />
            {it.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
