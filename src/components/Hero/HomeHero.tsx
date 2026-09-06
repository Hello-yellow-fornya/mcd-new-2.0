import { Button } from '@/components/Button/Button';
import { IconCircle } from '@/components/Icon/Icon';
import { ProofGrid } from '@/components/ProofGrid/ProofGrid';
import { cta, nav } from '@/data/copy';
import { claimAttrs, claimVisible, getClaim } from '@/lib/claims';
import { site } from '@/lib/site';
import styles from './HomeHero.module.css';

type Highlighted = { before: string; highlight: string; after: string };

function Hl({ t }: { t: Highlighted }) {
  return (
    <>
      {t.before}
      <span className="hl">{t.highlight}</span>
      {t.after}
    </>
  );
}

/** The wait row: "Avg wait 1 min · Fastest way to claim", pale circles with ochre icons, substantiation-gated. */
function WaitRow({ className }: { className?: string }) {
  const items = [
    { claim: getClaim('avg-wait-1-min'), icon: 'dot' as const },
    { claim: getClaim('fastest-way-to-claim'), icon: 'bolt' as const },
  ].filter((i) => claimVisible(i.claim));
  if (items.length === 0) return null;
  return (
    <ul className={[styles.wait, className].filter(Boolean).join(' ')} aria-label="Why call">
      {items.map((i) => (
        <li key={i.claim.id} {...claimAttrs(i.claim)}>
          <IconCircle name={i.icon} variant="pale" size={16} iconSize={9} className={styles.pic} />
          {i.claim.text}
        </li>
      ))}
    </ul>
  );
}

type Props = {
  h1: Highlighted;
  h2: Highlighted;
  /** Landing pages put a short sub under the H2 on mobile. */
  sub?: string;
};

/**
 * The homepage hero (§0). Desktop: two columns, H1 with the bar under one or
 * two words, H2 with its bar, the ink + yellow CTA pair, the wait row; the
 * proof grid on the right. Mobile (mcd-2-0-homepage-mobile-v2.html):
 * fold-locked — the section fills the viewport minus the nav and the
 * ClaimsStrip, the grid takes the one flexible gap (margin-top: auto), then
 * the 56px call pill, the wait row and the outlined online CTA, so the strip's
 * bottom edge lands on the fold at every viewport height.
 */
export function HomeHero({ h1, h2, sub }: Props) {
  return (
    <section className={styles.hero} data-hero>
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.copy}>
          <h1 className={styles.h1}>
            <Hl t={h1} />
          </h1>
          <h2 className={styles.h2}>
            <Hl t={h2} />
          </h2>
          {sub ? <p className={styles.sub}>{sub}</p> : null}
          <div className={styles.desktopCtas}>
            <Button href={nav.claimHref} variant="ink" data-cta="start">
              {cta.start}
            </Button>
            <Button href={site.phone.href} variant="yellow" icon="phone" data-cta="call">
              {cta.call}
            </Button>
          </div>
          <WaitRow className={styles.desktopWait} />
        </div>
        <ProofGrid className={styles.grid} />
        <div className={styles.mobileCtas}>
          <Button href={site.phone.href} variant="ink" size="hero" icon="phone" data-cta="call">
            {cta.callNowHero}
          </Button>
          <WaitRow className={styles.mobileWait} />
          <Button href={nav.claimHref} variant="outline-ink" iconAfter="arrow" block className={styles.online} data-cta="start-online">
            {cta.startOnline}
          </Button>
        </div>
      </div>
    </section>
  );
}
