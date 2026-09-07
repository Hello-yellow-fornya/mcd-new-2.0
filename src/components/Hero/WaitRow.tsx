import { IconCircle } from '@/components/Icon/Icon';
import { claimAttrs, claimVisible, getClaim } from '@/lib/claims';
import styles from './WaitRow.module.css';

/**
 * The wait row: "Avg wait 1 min · Fastest way to claim", pale circles with
 * ochre icons, substantiation-gated (nothing renders on production until the
 * claims carry evidence). Shared by the homepage hero and the template heroes.
 */
export function WaitRow({ className }: { className?: string }) {
  const items = [
    { claim: getClaim('avg-wait-1-min'), icon: 'dot' as const },
    { claim: getClaim('fastest-way-to-claim'), icon: 'bolt' as const },
  ].filter((i) => claimVisible(i.claim));
  if (items.length === 0) return null;
  return (
    <ul className={[styles.wait, className].filter(Boolean).join(' ')} aria-label="Why call" data-wait-row>
      {items.map((i) => (
        <li key={i.claim.id} {...claimAttrs(i.claim)}>
          <IconCircle name={i.icon} variant="pale" size={16} iconSize={9} className={styles.pic} />
          {i.claim.text}
        </li>
      ))}
    </ul>
  );
}
