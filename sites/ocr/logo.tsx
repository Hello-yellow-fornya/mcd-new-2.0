import Link from 'next/link';
import { site } from '@/lib/site';
import styles from './logo.module.css';

/**
 * The wordmark (OCR-brand-guidelines-one-page.html §1): "Online Claims
 * Report" as live text in Inter Black, tracking −4.5%, one line, never
 * stacked. "Online" is green on paper, white and navy; the whole mark is one
 * colour on green and in mono. Type, not an SVG.
 */
export type LogoSurface = 'light' | 'navy' | 'green' | 'mono-ink' | 'mono-white';

const surfaceClass: Record<LogoSurface, string> = {
  light: styles.light,
  navy: styles.navy,
  green: styles.green,
  'mono-ink': styles.monoInk,
  'mono-white': styles.monoWhite,
};

export function Lockup({ surface = 'light', className }: { surface?: LogoSurface; className?: string; decorative?: boolean }) {
  return (
    <span className={[styles.mark, surfaceClass[surface], className].filter(Boolean).join(' ')} data-logo={surface}>
      <span className={styles.online}>Online</span> Claims Report
    </span>
  );
}

/** The header and footer wordmark as a home link; its text is its name. */
export function Logo({ href = '/', surface = 'light', className }: { href?: string; surface?: LogoSurface; className?: string }) {
  return (
    <Link href={href} className={[styles.brand, className].filter(Boolean).join(' ')} title={`${site.name}, home`}>
      <Lockup surface={surface} />
    </Link>
  );
}
