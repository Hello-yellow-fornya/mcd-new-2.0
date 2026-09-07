import type { ReactNode } from 'react';
import { Toc, type TocItem } from '@/components/Toc/Toc';
import { Prose } from '@/components/Prose/Prose';
import styles from './ArticleLayout.module.css';

/** The jump list beside the article body (sticky on desktop, tap-to-open on mobile). Without one the prose takes the full width. */
export function ArticleLayout({ toc, children }: { toc: TocItem[]; children: ReactNode }) {
  return (
    <article className={styles.article}>
      <div className={`wrap ${toc.length ? styles.articleIn : styles.articleFull}`}>
        {toc.length > 0 && <Toc items={toc} />}
        <Prose>{children}</Prose>
      </div>
    </article>
  );
}
