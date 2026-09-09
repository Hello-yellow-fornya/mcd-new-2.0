import { Button } from '@/components/Button/Button';
import { WaitRow } from '@/components/Hero/WaitRow';
import { site } from '@/lib/site';
import { cta, eligibility, nav } from '@site/copy';
import styles from './HeroText.module.css';

type Props = {
  kicker?: string;
  title: string;
  /** One or two words of the title to carry the yellow bar (§0). */
  highlight?: string;
  /** The page's H2 (§0: the H2 rule on every page). */
  lead?: string;
  /** pair: Start (ink) + Call (yellow) with the wait row. call: the Call button alone. */
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

/**
 * Text hero from the SEO templates: eyebrow, H1 with the bar, the lead as the
 * H2 in Archivo (only H1–H3, card titles and the band use the display face),
 * the CTA pair with the wait row. No reviewed/author line (the site is not
 * indexed). One column: the photo slot
 * is gone until real images exist, so the text runs full width. Desktop fits
 * the headline, lead, both CTAs and the wait row inside 1280×720; mobile puts
 * Call first and full width, the wait row under it, Start in ink beneath.
 */
export function HeroText({ kicker, title, highlight, lead, cta: ctaMode = 'pair' }: Props) {
  return (
    <section className={styles.hero} data-hero>
      <div className={`wrap ${styles.heroIn}`}>
        {kicker && <p className={styles.kicker}>{kicker}</p>}
        <h1 className={styles.h1}>
          <Title title={title} highlight={highlight} />
        </h1>
        {lead && <h2 className={styles.lead}>{lead}</h2>}
        {eligibility && (
          <p className={styles.elig} data-eligibility>
            {eligibility}
          </p>
        )}
        {ctaMode !== 'none' && (
          <div className={styles.ctaRow}>
            {ctaMode === 'pair' && (
              <Button href={nav.claimHref} variant="ink" className={styles.start} data-cta="start">
                {cta.start}
              </Button>
            )}
            <Button href={site.phone.href} variant="yellow" icon="phone" className={styles.call} data-cta="call">
              {cta.call}
            </Button>
            <WaitRow className={styles.wait} />
          </div>
        )}
      </div>
    </section>
  );
}
