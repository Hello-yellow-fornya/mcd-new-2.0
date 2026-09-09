import { Button } from '@/components/Button/Button';
import { Icon, type IconName } from '@/components/Icon/Icon';
import { claimAttrs, claimVisible, getClaim } from '@/lib/claims';
import { site } from '@/lib/site';
import { cta, hero, nav } from '../copy';
import { ReportForm } from './ReportForm';
import styles from './Hero.module.css';

/** The three worries: mint circles with line icons (44px desktop, 36px mobile). */
export function Worries({ className }: { className?: string }) {
  return (
    <ul className={[styles.worries, className].filter(Boolean).join(' ')} data-worries>
      {hero.worries.map((w) => (
        <li key={w.title} className={styles.worry}>
          <span className={styles.circle} aria-hidden="true">
            <Icon name={w.icon} className={styles.circleIcon} />
          </span>
          <div>
            <b>{w.title}</b>
            <span>{w.text}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

type WaitProps = { claims?: readonly [string, string]; icons?: readonly [IconName, IconName]; tone?: 'navy' | 'light'; className?: string };

/** The wait row under the call button: substantiation-gated, so nothing renders on production until the claims carry evidence. */
export function WaitRow({ claims = ['avg-wait-1-min', 'fastest-way-to-claim'], icons = ['clock', 'bolt'], tone = 'navy', className }: WaitProps) {
  const items = claims.map((id, i) => ({ claim: getClaim(id), icon: icons[i] })).filter((i) => claimVisible(i.claim));
  if (items.length === 0) return null;
  return (
    <ul className={[styles.wait, tone === 'light' ? styles.waitLight : '', className].filter(Boolean).join(' ')} aria-label="Why call" data-wait-row>
      {items.map((i) => (
        <li key={i.claim.id} {...claimAttrs(i.claim)}>
          <i className={styles.waitDot} aria-hidden="true">
            <Icon name={i.icon} />
          </i>
          {i.claim.text}
        </li>
      ))}
    </ul>
  );
}

/**
 * The homepage hero. Desktop (ocr-homepage-concept.html): paper, two
 * columns, the copy and CTAs left and the report form right, the three
 * worries beneath, everything inside 1280×720; the payoff carries the mint
 * highlighter. Mobile
 * (ocr-homepage-mobile.html): navy, fold-locked with one flexible gap
 * between the worries and the call block; the green call button, the wait
 * row and "Or report it online" sit on the fold.
 */
export function Hero() {
  return (
    <section className={styles.hero} data-hero>
      <div className={`wrap ${styles.grid}`}>
        <div>
          <p className={styles.eyebrow}>{hero.eyebrow}</p>
          <h1 className={styles.h1}>
            {hero.h1.before}
            <br />
            <span className={styles.h1Chip} data-chip>
              {hero.h1.chip}
            </span>
          </h1>
          <p className={`${styles.lead} ${styles.leadDesktop}`} data-lead>
            {hero.lead}
          </p>
          <p className={`${styles.lead} ${styles.leadMobile}`} data-lead>
            {hero.leadMobile}
          </p>
          <div className={styles.ctas}>
            <Button href="#report" variant="ink" className={styles.primary} data-cta="start">
              {cta.start}
            </Button>
            <Button href={site.phone.href} variant="outline-ink" icon="phone" data-cta="call">
              {cta.call}
            </Button>
          </div>
        </div>
        <div className={styles.formCol}>
          <ReportForm placement="home-hero" />
        </div>
      </div>
      <div className={`wrap ${styles.worriesWrap}`}>
        <Worries />
      </div>
      <div className={`wrap ${styles.mobileCta} on-dark`} data-hero-cta>
        <Button href={site.phone.href} variant="yellow" icon="phone" block className={styles.callBig} data-cta="call">
          {cta.callNowHero}
        </Button>
        <WaitRow />
        <Button href={nav.claimHref} variant="outline-ink" iconAfter="arrow" block className={styles.online} data-cta="start">
          {cta.startOnline}
        </Button>
      </div>
    </section>
  );
}
