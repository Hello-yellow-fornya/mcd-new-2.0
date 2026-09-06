import type { ReactNode } from 'react';
import { Button } from '@/components/Button/Button';
import { site } from '@/lib/site';
import { cta, nav } from '@/data/copy';
import styles from './HeroText.module.css';

type Props = {
  kicker?: string;
  title: string;
  /** One or two words of the title to carry the yellow bar (§0). */
  highlight?: string;
  /** The page's H2 (§0: the H2 rule on every page). */
  lead?: string;
  meta?: { lastReviewed?: string; author?: string };
  photo?: ReactNode;
  /** pair: Start (ink) + Call (yellow). call: the Call button alone. */
  cta?: 'pair' | 'call' | 'none';
};

/** Splits the title around the highlighted words, if they are in it. */
function Title({ title, highlight }: { title: string; highlight?: string }) {
  if (!highlight) return <>{title}</>;
  const at = title.indexOf(highlight);
  if (at < 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, at)}
      <span className="hl">{highlight}</span>
      {title.slice(at + highlight.length)}
    </>
  );
}

/** Text hero from the SEO templates: eyebrow, H1 with the bar, the lead as the H2, CTA pair, meta line, photo slot. */
export function HeroText({ kicker, title, highlight, lead, meta, photo, cta: ctaMode = 'pair' }: Props) {
  return (
    <section className={styles.hero} data-hero>
      <div className={`wrap ${styles.heroIn}`}>
        <div>
          {kicker && <p className={styles.kicker}>{kicker}</p>}
          <h1 className={styles.h1}>
            <Title title={title} highlight={highlight} />
          </h1>
          {lead && <h2 className={styles.lead}>{lead}</h2>}
          {ctaMode !== 'none' && (
            <div className={styles.ctaRow}>
              {ctaMode === 'pair' && (
                <Button href={nav.claimHref} variant="ink" data-cta="start">
                  {cta.start}
                </Button>
              )}
              <Button href={site.phone.href} variant="yellow" icon="phone" data-cta="call">
                {cta.call}
              </Button>
            </div>
          )}
          {meta && (meta.lastReviewed || meta.author) && (
            <p className={styles.meta}>
              {meta.lastReviewed && (
                <span>
                  Last reviewed <b>{meta.lastReviewed}</b>
                </span>
              )}
              {meta.author && (
                <span>
                  By <b>{meta.author}</b>
                </span>
              )}
            </p>
          )}
        </div>
        {photo && <div className={styles.photo}>{photo}</div>}
      </div>
    </section>
  );
}
