import Link from 'next/link';
import { lockupFrame, mark, markTransform, wordmark } from './lockup.generated';
import { site } from '@/lib/site';
import styles from './Logo.module.css';

/**
 * Which surface the lockup sits on (CLAUDE.md §4a). The variant follows:
 * light and cream take ink words with the yellow ring; yellow takes all ink;
 * ink takes white words with the yellow ring; the two monos are one colour.
 * The speed lines always match the wordmark colour.
 */
export type LogoSurface = 'light' | 'cream' | 'yellow' | 'ink' | 'mono-ink' | 'mono-white';

const surfaceClass: Record<LogoSurface, string> = {
  light: styles.light,
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
 * The horizontal lockup as inline SVG: "Claims" over "24/7" beside the
 * stopwatch, the wordmark as outlines cut from the self-hosted Archivo Black
 * at build time (scripts/logo-build.mjs), so it never falls back to another
 * face. The viewBox is the content box, so the height maps to the artwork.
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
      <g transform={markTransform}>{mark}</g>
      {wordmark.map((w) => (
        <path key={w.text} d={w.d} fill="currentColor" data-text={w.text} />
      ))}
    </svg>
  );
}

/** The header and footer logo: a home link at --logo-h (34px desktop, 30px mobile). */
export function Logo({ href = '/', surface = 'cream', className }: { href?: string; surface?: LogoSurface; className?: string }) {
  return (
    <Link href={href} className={[styles.brand, className].filter(Boolean).join(' ')} title={`${site.name}, home`} aria-label={`${site.name}, home`}>
      <Lockup surface={surface} decorative />
    </Link>
  );
}
