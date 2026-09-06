import { Band, Benefits, ClaimsStrip, Faq, HomeHero, IndependenceLine, ReviewBand, SiteFooter, SiteHeader, Steps, ThemUs } from '@/components';
import type { LandingConfig } from '@/lib/landing-config';
import styles from './LandingPage.module.css';

/**
 * Insurer landing page (§0, appendix §6), from design/mcd-2-0-goskippy-landing*.html.
 * The insurer name appears only in the H1 and the independence line, which
 * sits directly under the hero and strip. Sourced facts, if the config has
 * any, render verbatim with their source and date. No FAQ schema: the page
 * is noindex.
 */
export function LandingPage({ config }: { config: LandingConfig }) {
  return (
    <>
      <SiteHeader />
      <main id="main" data-landing={config.slug}>
        <HomeHero h1={config.h1} h2={config.h2} sub={config.mobileSub} />
        <ClaimsStrip />
        <IndependenceLine insurer={config.insurer} />
        <ReviewBand />
        <Band />
        <ThemUs />
        {config.facts.length ? <Facts facts={config.facts} /> : null}
        <Benefits />
        <Steps />
        <Faq schema={false} />
      </main>
      <SiteFooter />
    </>
  );
}

function Facts({ facts }: { facts: LandingConfig['facts'] }) {
  return (
    <section className={styles.facts} data-facts>
      <div className="wrap">
        <h2>The terms, side by side</h2>
        <div className={styles.table} role="table">
          <div className={`${styles.row} ${styles.head}`} role="row">
            <div role="columnheader">What</div>
            <div role="columnheader">Claiming on your policy</div>
            <div role="columnheader">Claiming through MCD</div>
          </div>
          {facts.map((f) => (
            <div key={f.label} className={styles.row} role="row">
              <div role="cell">{f.label}</div>
              <div role="cell">
                {f.theirs}
                <a className={styles.src} href={f.sourceUrl} rel="nofollow noopener">
                  {f.source}, checked {f.checkedOn}
                </a>
              </div>
              <div role="cell">{f.ours}</div>
            </div>
          ))}
        </div>
        <p className={styles.note}>Competitor terms quoted from publicly available documents on the dates shown; policies vary and you should check your own schedule.</p>
      </div>
    </section>
  );
}
