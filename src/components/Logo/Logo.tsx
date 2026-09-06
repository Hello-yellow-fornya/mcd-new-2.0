import Link from 'next/link';
import styles from './Logo.module.css';

/**
 * The horizontal lockup from the mockups: "MOT" + the mark as the second O +
 * "R" in Archivo Black, "CLAIMS DEPARTMENT" beneath in Archivo 700 tracked
 * .14em and sized to MOTOR's width. In 2.0 the disc is yellow with ink
 * spokes (§0). The second line is the logo's lettering, set as text so it
 * stays selectable; it is the one place caps appear.
 */
export function Mark({ className }: { className?: string }) {
  const spokes = [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
    const r = (deg * Math.PI) / 180;
    return { x: (50 + 34 * Math.cos(r)).toFixed(2), y: (50 + 34 * Math.sin(r)).toFixed(2) };
  });
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="50" className={styles.disc} />
      {spokes.map((s) => (
        <line key={`${s.x},${s.y}`} x1="50" y1="50" x2={s.x} y2={s.y} className={styles.spoke} strokeWidth="9" strokeLinecap="round" />
      ))}
      <circle cx="50" cy="50" r="11" className={styles.hub} />
    </svg>
  );
}

export function Logo({ href = '/', className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={[styles.brand, className].filter(Boolean).join(' ')} aria-label="Motor Claims Department, home">
      <span className={styles.lockup} aria-hidden="true">
        <span className={styles.line1}>
          MOT
          <Mark className={styles.om} />R
        </span>
        <span className={styles.line2}>CLAIMS DEPARTMENT</span>
      </span>
    </Link>
  );
}
