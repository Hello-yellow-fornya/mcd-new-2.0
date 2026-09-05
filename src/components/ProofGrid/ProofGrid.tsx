import { IconCircle } from '@/components/Icon/Icon';
import { proofGrid } from '@/data/copy';
import { claimAttrs, claimVisible, getClaim } from '@/lib/claims';
import styles from './ProofGrid.module.css';

/**
 * The 2×2 proof grid (§0): white cards, ink circle with a yellow icon,
 * Archivo Black title, muted sub. A card that carries a claim renders under
 * the substantiation rule (appendix §6).
 */
export function ProofGrid({ className }: { className?: string }) {
  return (
    <ul className={[styles.grid, className].filter(Boolean).join(' ')} aria-label="Why claim through MCD" data-proof-grid>
      {proofGrid.map((card) => {
        const claim = 'claim' in card && card.claim ? getClaim(card.claim) : null;
        if (claim && !claimVisible(claim)) return null;
        const attrs = claim ? claimAttrs(claim) : {};
        const [t1, t2] = card.title.split('\n');
        return (
          <li key={card.title} className={styles.card} {...attrs}>
            <IconCircle name={card.icon} variant="ink" size={48} iconSize={26} className={styles.circle} />
            <b className={styles.title}>
              {t1}
              <br />
              {t2}
            </b>
            <span className={styles.sub}>{card.sub}</span>
          </li>
        );
      })}
    </ul>
  );
}
