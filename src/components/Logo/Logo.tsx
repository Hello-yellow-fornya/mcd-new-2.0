import Link from 'next/link';
import { lockupFrame, wordmark } from './lockup.generated';
import { site } from '@/lib/site';
import styles from './Logo.module.css';

/**
 * Which surface the wordmark sits on (CLAUDE.md §4a). "Claims" takes the
 * wordmark colour; "247" takes the accent: ochre on light and cream, yellow
 * on light-yellow and on ink, ink on yellow, the wordmark colour in the monos.
 */
export type LogoSurface = 'light' | 'light-yellow' | 'cream' | 'yellow' | 'ink' | 'mono-ink' | 'mono-white';

const surfaceClass: Record<LogoSurface, string> = {
  light: styles.light,
  'light-yellow': styles.lightYellow,
  cream: styles.cream,
  yellow: styles.yellow,
  ink: styles.ink,
  'mono-ink': styles.monoInk,
  'mono-white': styles.monoWhite,
};

type LockupProps = {
  surface?: LogoSurface;
  className?: string;
  /** Decorative when the parent link carries the name. */
  decorative?: boolean;
};

/**
 * The wordmark as inline SVG: "Claims" with "247" set small and high beside
 * it, both as outlines cut from the self-hosted Archivo Black at build time
 * (scripts/logo-build.mjs), so it never falls back to another face. The
 * viewBox is the content box, so the height maps to the drawn letters.
 */
export function Lockup({ surface = 'light', className, decorative }: LockupProps) {
  const { box } = lockupFrame;
  return (
    <svg
      className={[styles.lockup, surfaceClass[surface], className].filter(Boolean).join(' ')}
      viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : site.name}
      aria-hidden={decorative || undefined}
      focusable="false"
      data-logo={surface}
    >
      {wordmark.map((w) => (
        <path key={w.text} d={w.d} className={w.role === 'accent' ? styles.accent : styles.name} data-text={w.text} />
      ))}
    </svg>
  );
}

/** The header and footer logo: the wordmark as a home link at --logo-h (34px desktop, 30px mobile). */
export function Logo({ href = '/', surface = 'cream', className }: { href?: string; surface?: LogoSurface; className?: string }) {
  return (
    <Link href={href} className={[styles.brand, className].filter(Boolean).join(' ')} title={`${site.name}, home`} aria-label={`${site.name}, home`}>
      <Lockup surface={surface} decorative />
    </Link>
  );
}
