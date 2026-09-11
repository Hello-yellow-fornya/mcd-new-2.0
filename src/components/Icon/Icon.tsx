import type { CSSProperties } from 'react';
import styles from './Icon.module.css';

export type IconName = 'phone' | 'check' | 'cross' | 'pound' | 'shield' | 'car' | 'bolt' | 'doc' | 'person' | 'star' | 'dot' | 'arrow' | 'pin' | 'question' | 'clock' | 'truck' | 'chat' | 'camera' | 'image';

type Props = {
  name: IconName;
  /** Pixel size; defaults to 1em so it follows the text. */
  size?: number | string;
  className?: string;
  /** Screen-reader label. Omit for decorative icons (the default, aria-hidden). */
  label?: string;
  style?: CSSProperties;
};

/** One symbol from the sprite. Fills with currentColor. */
export function Icon({ name, size, className, label, style }: Props) {
  const s = size === undefined ? undefined : { width: size, height: size, ...style };
  return (
    <svg
      className={[styles.icon, className].filter(Boolean).join(' ')}
      style={s ?? style}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      focusable="false"
    >
      {label ? <title>{label}</title> : null}
      <use href={`#i-${name}`} />
    </svg>
  );
}

export type CircleVariant = 'ink' | 'yellow' | 'pale';

/**
 * Icon circles (§0): ink circle with a yellow icon (proof grid, benefits),
 * yellow circle with an ink icon (the ClaimsStrip, table ticks), pale circle
 * with an ochre icon (the wait row).
 */
export function IconCircle({ name, variant = 'ink', size = 48, iconSize, className, label }: Props & { variant?: CircleVariant; iconSize?: number }) {
  const cls = [styles.circle, styles[variant], className].filter(Boolean).join(' ');
  const n = typeof size === 'number' ? size : parseInt(String(size), 10);
  return (
    <span className={cls} style={{ width: size, height: size }}>
      <Icon name={name} size={iconSize ?? Math.round(n * 0.54)} label={label} />
    </span>
  );
}
