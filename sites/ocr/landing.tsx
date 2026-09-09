import { Button } from '@/components/Button/Button';
import { Faq } from '@/components/Faq/Faq';
import { Icon } from '@/components/Icon/Icon';
import { ReviewBand } from '@/components/ReviewBand/ReviewBand';
import type { LandingConfig } from '@/lib/landing-config';
import { site } from '@/lib/site';
import { SiteHeader } from './header';
import { SiteFooter } from './footer';
import { ReportForm } from './components/ReportForm';
import { WaitRow } from './components/Hero';
import { band, cta, independence, landing, nav, themUs } from './copy';
import styles from './components/landing.module.css';

type Parts = { before: string; highlight: string; after: string };

function Highlighted({ parts }: { parts: Parts }) {
  return (
    <>
      {parts.before}
      {parts.highlight ? <span className="hl">{parts.highlight}</span> : null}
      {parts.after}
    </>
  );
}

/**
 * The insurer landing page (design/ocr/ocr-goskippy-mobile.html; desktop
 * derived from the homepage). The insurer name appears only in the H1 and the
 * independence line; everything else is site-wide copy, so a second insurer
 * is one more JSON file. Mobile: paper hero fold-locked above the ticker,
 * the four proof cards, the green online report, the mint call and the wait
 * row. Then the ticker, the independence line, reviews, the band, the table,
 * the FAQ and the footer. No FAQ schema: the page is noindex.
 */
export function LandingPage({ config }: { config: LandingConfig }) {
  return (
    <>
      <SiteHeader />
      <main id="main" data-landing={config.slug}>
        <section className={styles.hero} data-hero>
          <div className={`wrap ${styles.grid}`}>
            <div className={styles.text}>
              <div>
                <h1 className={styles.h1}>
                  <Highlighted parts={config.h1} />
                </h1>
                <h2 className={styles.h2}>
                  <Highlighted parts={config.h2} />
                </h2>
              </div>
              <div className={styles.bottom} data-hero-cta>
                <ul className={styles.pgrid} data-proof-grid>
                  {landing.proof.map((p) => (
                    <li key={p.title}>
                      <span className={styles.gic} aria-hidden="true">
                        <Icon name={p.icon} />
                      </span>
                      <b>
                        {p.title.split('\n').map((line, i) => (
                          <span key={line}>
                            {i > 0 ? <br /> : null}
                            {line}
                          </span>
                        ))}
                      </b>
                      <span className={styles.gsub}>{p.sub}</span>
                    </li>
                  ))}
                </ul>
                <div className={styles.stack}>
                  <Button href={nav.claimHref} variant="yellow" iconAfter="arrow" block className={styles.mobileOnly} data-cta="start">
                    {cta.start}
                  </Button>
                  <Button href={site.phone.href} variant="yellow" icon="phone" block className={styles.mint} data-cta="call">
                    {cta.call}
                  </Button>
                  <WaitRow tone="light" claims={['avg-wait-1-min', 'lines-open-24-7']} icons={['clock', 'dot']} />
                </div>
              </div>
            </div>
            <div className={styles.formCol}>
              <ReportForm placement={`landing-${config.slug}`} />
            </div>
          </div>
        </section>
        <Ticker />
        <div className={styles.indep} data-independence>
          <div className="wrap">{independence.forInsurer(config.insurer)}</div>
        </div>
        <ReviewBand />
        <section className={`${styles.band} on-dark`} data-band>
          <div className="wrap">
            <span className={styles.l}>{band.l0}</span>
            <span className={styles.l}>{band.l1}</span>
            <mark className={styles.mark}>{band.chip}</mark>
            <div className={styles.bandCtas}>
              <Button href={nav.claimHref} variant="outline-yellow" size="band" data-cta="start">
                {cta.start}
              </Button>
              <Button href={site.phone.href} variant="outline-yellow" size="band" icon="phone" data-cta="call">
                {cta.callNow}
              </Button>
            </div>
          </div>
        </section>
        <Table />
        <Faq h2={landing.faq.h2} sub={landing.faq.sub} items={landing.faq.items} schema={false} />
      </main>
      <SiteFooter />
    </>
  );
}

/** The navy ticker on the fold: the six proof lines, doubled for a seamless loop, still with reduced motion. */
function Ticker() {
  const items = (dup: boolean) =>
    landing.ticker.map((t) => (
      <span key={`${t.text}-${dup ? 'b' : 'a'}`} aria-hidden={dup || undefined}>
        <i className={styles.tickIcon} aria-hidden="true">
          <Icon name={t.icon} />
        </i>
        {t.text}
      </span>
    ));
  return (
    <div className={styles.ticker} data-ticker aria-label="What you get">
      <div className={styles.track}>
        {items(false)}
        {items(true)}
      </div>
    </div>
  );
}

function Table() {
  return (
    <section className={styles.tu} data-them-us>
      <div className="wrap">
        <div className={styles.table} role="table" aria-label="Their claims department compared with your handler">
          <div className={styles.thead} role="row">
            <div role="columnheader">{themUs.heads[0]}</div>
            <div role="columnheader">{themUs.heads[1]}</div>
          </div>
          {themUs.rows.map(([them, us]) => (
            <div key={them} className={styles.trow} role="row">
              <div role="cell" className={styles.them}>
                <span className={`${styles.mk} ${styles.no}`}>
                  <Icon name="cross" label="No" />
                </span>
                <span>{them}</span>
              </div>
              <div role="cell" className={styles.us}>
                <span className={`${styles.mk} ${styles.ok}`}>
                  <Icon name="check" label="Yes" />
                </span>
                <span>{us}</span>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.secCta}>
          <Button href={nav.claimHref} variant="ink" block data-cta="start">
            {cta.start}
          </Button>
          <Button href={site.phone.href} variant="yellow" icon="phone" block className={styles.mint} data-cta="call">
            {cta.call}
          </Button>
        </div>
      </div>
    </section>
  );
}
