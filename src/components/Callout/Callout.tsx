import type { ReactNode } from 'react';
import { theCatch } from '@site/copy';
import styles from './Callout.module.css';

type Props = { variant?: 'default'; lead: string; children: ReactNode } | { variant: 'catch'; lead?: string; children?: ReactNode };

/** Cream box with a bold lead line. The catch variant carries the one wording for "the catch". */
export function Callout(props: Props) {
  const isCatch = props.variant === 'catch';
  return (
    <div className={styles.callout} data-callout data-variant={isCatch ? 'catch' : undefined}>
      <b className={styles.lead}>{props.lead ?? (isCatch ? theCatch.lead : '')}</b>
      <div>{props.children ?? (isCatch ? theCatch.text : null)}</div>
    </div>
  );
}
