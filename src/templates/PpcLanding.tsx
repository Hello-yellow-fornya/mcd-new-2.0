import { Band, Breadcrumb, Button, ClaimsStrip, Faq, IndependenceLine, JsonLd, ProofGrid, SiteFooter, SiteHeader } from '@/components';
import { WaitRow } from '@/components/Hero/WaitRow';
import { isLive, type Page } from '@/lib/content';
import { pageSchema } from '@/lib/content/schema';
import { cta, eligibility, nav } from '@site/copy';
import { site } from '@/lib/site';
import { bands, StepText, Title } from './landing-parts';
import styles from './PpcLanding.module.css';

/**
 * The paid landing page (design/claims247-third-party-insurance-claim.html and
 * -mobile.html, the signed-off mobile page being the spec). It is the same
 * layout as the organic pillar-landing template with two deliberate
 * differences, which is why it is its own template rather than a flag on that
 * one:
 *
 *  - The breakpoint is the mockup's 1000px, not the organic template's 820px,
 *    so between 820 and 999 the mobile layout runs here and the desktop one
 *    runs there.
 *  - A paid page is iterated on its own schedule. Nothing changed for a
 *    campaign should be able to move /third-party-insurance-claim/.
 *
 * Landing-page rules (appendix §5): nothing links in from the nav, the footer
 * or a related block; noindex, nofollow like the rest of the site; the visitor's
 * campaign is captured on arrival (src/lib/campaign.ts) and rides the claim to
 * the intake endpoint; /claim-now/thank-you/ is the conversion trigger.
 *
 * Top to bottom: sticky nav, the fold-locked hero (H1 with the bar, H2, lead,
 * the 2x2 grid from proof-points.json, the call button with the wait row and
 * the outlined online CTA), the moving strip ending on the fold, the seven-item
 * accordion, the band, six steps with the gated sentences, the independence
 * line and the legal footer. No cream bands, no pale callouts, no them/us
 * table, no photo slot.
 */
export function PpcLanding({ page }: { page: Page }) {
  const fm = page.frontmatter;
  const crumbs = [...(fm.breadcrumb ?? []), { href: fm.slug, label: fm.h1 ?? fm.title }];
  const visibleCrumbs = crumbs.slice(0, -1).map((c) => (isLive(c.href) || c.href === '/' ? c : { ...c, href: '' }));
  return (
    <>
      <SiteHeader />
      <main id="main" data-template="ppc-landing" data-ppc>
        <div className={styles.crumbs}>
          <Breadcrumb items={[...visibleCrumbs, { href: fm.slug, label: fm.h1 ?? fm.title }]} schema={false} />
        </div>
        <section className={styles.hero} data-hero>
          <div className={`wrap ${styles.heroIn}`}>
            <div className={styles.top}>
              <h1 className={styles.h1}>
                <Title title={fm.h1 ?? fm.title} highlight={fm.highlight} />
              </h1>
              {fm.lead ? <h2 className={styles.h2}>{fm.lead}</h2> : null}
              {fm.intro ? <p className={styles.lead}>{fm.intro}</p> : null}
              {eligibility && (
                <p className={styles.elig} data-eligibility>
                  {eligibility}
                </p>
              )}
            </div>
            <div className={styles.bottom}>
              <ProofGrid className={styles.grid} />
              <div className={styles.ctas}>
                <Button href={site.phone.href} variant="yellow" icon="phone" className={styles.call} data-cta="call">
                  {cta.call}
                </Button>
                <WaitRow className={styles.wait} />
                <Button href={nav.claimHref} variant="outline-ink" iconAfter="arrow" className={styles.online} data-cta="start-online">
                  {cta.startOnline}
                </Button>
              </div>
            </div>
          </div>
        </section>
        <ClaimsStrip />
        {fm.faq?.length ? (
          <section className={styles.faqSec} id="faq" data-faq>
            <div className={`wrap ${styles.faqWrap}`}>
              <h2>Your questions, answered</h2>
              <Faq items={fm.faq} schema={false} inline />
            </div>
          </section>
        ) : null}
        <Band lines={bands[fm.band ?? 'ours']} />
        {fm.howItWorks?.length ? (
          <section className={styles.how} id="how-it-works" data-steps>
            <div className="wrap">
              <h2>How it works</h2>
              <ol className={styles.steps}>
                {fm.howItWorks.map((s, i) => (
                  <li key={s.title} className={styles.step}>
                    <b className={styles.n} aria-hidden="true">
                      {i + 1}
                    </b>
                    <StepText step={s} />
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ) : null}
        <IndependenceLine />
      </main>
      <SiteFooter />
      <JsonLd data={pageSchema(page, crumbs)} />
    </>
  );
}
