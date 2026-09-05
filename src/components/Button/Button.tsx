import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/Icon/Icon';
import styles from './Button.module.css';

export type ButtonVariant = 'ink' | 'yellow' | 'outline-yellow' | 'outline-ink';
export type ButtonSize = 'md' | 'sm' | 'band' | 'hero';

type Props = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon (the phone) or trailing arrow. */
  icon?: IconName;
  iconAfter?: IconName;
  block?: boolean;
  className?: string;
  onClick?: () => void;
  id?: string;
  'data-cta'?: string;
};

const variantClass: Record<ButtonVariant, string> = {
  ink: styles.ink,
  yellow: styles.yellow,
  'outline-yellow': styles.outlineYellow,
  'outline-ink': styles.outlineInk,
};

const sizeClass: Record<ButtonSize, string> = { md: styles.md, sm: styles.sm, band: styles.band, hero: styles.hero };

/**
 * Pills (§0): ink with yellow text, yellow with ink text, and the two outlined
 * forms (yellow on ink for the band, ink on cream for the online CTA).
 * tel: and hash links are plain anchors; site paths go through next/link.
 */
export function Button({ href, children, variant = 'ink', size = 'md', icon, iconAfter, block, className, onClick, id, ...rest }: Props) {
  const cls = [styles.btn, variantClass[variant], sizeClass[size], block ? styles.block : '', className].filter(Boolean).join(' ');
  const inner = (
    <>
      {icon ? <Icon name={icon} className={styles.icon} /> : null}
      <span>{children}</span>
      {iconAfter ? <Icon name={iconAfter} className={styles.iconAfter} /> : null}
    </>
  );
  const isRoute = href.startsWith('/') && !href.startsWith('//');
  if (isRoute) {
    return (
      <Link href={href} className={cls} onClick={onClick} id={id} data-cta={rest['data-cta']}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} onClick={onClick} id={id} data-cta={rest['data-cta']}>
      {inner}
    </a>
  );
}
