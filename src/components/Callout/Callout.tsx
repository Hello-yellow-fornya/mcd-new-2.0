import type { ReactNode } from 'react';
import { conditions } from '@site/copy';
import styles from './Callout.module.css';

type Props = { variant?: 'default'; lead: string; children: ReactNode } | { variant: 'conditions'; lead?: string; children?: ReactNode };

/**
 * Cream box with a bold lead line. The conditions variant carries the site's one
 * wording for when the non-fault route applies and how it is paid for: Claims 24/7
 * states it as "How it costs you nothing", Claims Report Line as "The catch".
 */
export function Callout(props: Props) {
  const isConditions = props.variant === 'conditions';
  return (
    <div className={styles.callout} data-callout data-variant={isConditions ? 'conditions' : undefined}>
      <b className={styles.lead}>{props.lead ?? (isConditions ? conditions.lead : '')}</b>
      <div>{props.children ?? (isConditions ? conditions.text : null)}</div>
    </div>
  );
}
