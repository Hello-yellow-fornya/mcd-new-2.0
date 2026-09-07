import { IconCircle } from '@/components/Icon/Icon';
import { proofGrid } from '@/data/copy';
import { claimAttrs, claimVisible, getClaim } from '@/lib/claims';
import { selectProofCards } from '@/lib/proof-grid';
import styles from './ProofGrid.module.css';

/**
 * The 2×2 proof grid (§0): white cards, ink circle with a yellow icon,
 * Archivo Black title, muted sub. A card that carries a claim renders under
 * the substantiation rule (appendix §6); until the claim is substantiated
 * its fallback card holds the fourth slot, so the grid is always 2×2.
 */
export function ProofGrid({ className }: { className?: string }) {
  return (
    <ul className={[styles.grid, className].filter(Boolean).join(' ')} aria-label="Why claim through Claims 24/7" data-proof-grid>
      {selectProofCards(proofGrid, (id) => claimVisible(getClaim(id))).map(({ card, claimId }) => {
        const attrs = claimId ? claimAttrs(getClaim(claimId)) : {};
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
