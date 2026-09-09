import { independence } from '@site/copy';
import styles from './IndependenceLine.module.css';

/** The independence line (§0). Landing pages name the insurer in it. */
export function IndependenceLine({ insurer }: { insurer?: string }) {
  return (
    <div className={styles.line} data-independence>
      <div className="wrap">{insurer ? independence.forInsurer(insurer) : independence.generic}</div>
    </div>
  );
}
