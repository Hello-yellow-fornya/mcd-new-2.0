import type { ReactNode } from 'react';
import { Toc, type TocItem } from '@/components/Toc/Toc';
import { Prose } from '@/components/Prose/Prose';
import styles from './ArticleLayout.module.css';

/** Sticky TOC beside the article body, from the SEO templates. */
export function ArticleLayout({ toc, children }: { toc: TocItem[]; children: ReactNode }) {
  return (
    <article className={styles.article}>
      <div className={`wrap ${styles.articleIn}`}>
        <Toc items={toc} />
        <Prose>{children}</Prose>
      </div>
    </article>
  );
}
