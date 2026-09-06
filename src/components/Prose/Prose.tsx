import type { ReactNode } from 'react';
import styles from './Prose.module.css';

/** Article body styles. H2s carry ids and scroll-margin-top so anchors land under the sticky nav. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={[styles.prose, className].filter(Boolean).join(' ')}>{children}</div>;
}
