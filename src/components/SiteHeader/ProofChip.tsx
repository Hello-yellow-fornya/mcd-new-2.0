import { claimAttrs, claimVisible, getClaim } from '@/lib/claims';
import styles from './SiteHeader.module.css';

/**
 * "Lines open 24/7 · Avg wait 1 min" — substantiation-gated (§0). Each part
 * renders only when its claim may (appendix §6); the chip disappears when
 * neither can.
 */
export function ProofChip({ className, drawer }: { className?: string; drawer?: boolean }) {
  const parts = ['lines-open-24-7', 'avg-wait-1-min'].map(getClaim).filter((c) => claimVisible(c));
  if (parts.length === 0) return null;
  return (
    <span className={[drawer ? styles.drawerProof : styles.proof, className].filter(Boolean).join(' ')} data-proof-chip>
      {parts.map((c, i) => (
        <span key={c.id} {...claimAttrs(c)}>
          {i === 0 && c.id === 'lines-open-24-7' ? <i className={styles.dot} aria-hidden="true" /> : null}
          {c.text}
        </span>
      ))}
    </span>
  );
}
