import Link from 'next/link';
import { lockupFrame, mark, markTransform, wide, wordmark } from './lockup.generated';
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
  /** wide (default): the wordmark at the mark's full height beside the stopwatch, for the header and footer. compact: the signed-off lockup with the words tucked into the opening. */
  layout?: 'wide' | 'compact';
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
export function Lockup({ surface = 'light', layout = 'wide', className, decorative }: LockupProps) {
  const box = layout === 'wide' ? wide.box : lockupFrame.box;
  const markT = layout === 'wide' ? wide.markTransform : markTransform;
  return (
    <svg
      className={[styles.lockup, surfaceClass[surface], className].filter(Boolean).join(' ')}
      viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : site.name}
      aria-hidden={decorative || undefined}
      focusable="false"
      data-logo={surface}
      data-layout={layout}
    >
      <g transform={markT}>{mark}</g>
      <g transform={layout === 'wide' ? wide.wordmarkTransform : undefined}>
        {wordmark.map((w) => (
          <path key={w.text} d={w.d} fill="currentColor" data-text={w.text} />
        ))}
      </g>
    </svg>
  );
}

/** The header and footer logo: the wide lockup as a home link at --logo-h (50px desktop, 42px mobile). */
export function Logo({ href = '/', surface = 'cream', className }: { href?: string; surface?: LogoSurface; className?: string }) {
  return (
    <Link href={href} className={[styles.brand, className].filter(Boolean).join(' ')} title={`${site.name}, home`} aria-label={`${site.name}, home`}>
      <Lockup surface={surface} decorative />
    </Link>
  );
}
