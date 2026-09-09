import { Band, Breadcrumb, Button, ClaimsStrip, Faq, IndependenceLine, JsonLd, ProofGrid, SiteFooter, SiteHeader } from '@/components';
import { WaitRow } from '@/components/Hero/WaitRow';
import { claimAttrs, claimVisible, getClaim } from '@/lib/claims';
import { isLive, type Page } from '@/lib/content';
import { pageSchema } from '@/lib/content/schema';
import type { LandingStep } from '@/lib/content/types';
import { cta, eligibility, nav } from '@site/copy';
import { site } from '@/lib/site';
import styles from './PillarLanding.module.css';

const bands = {
  ours: undefined,
  their: { l0: 'Their insurer has a claims department.', l1: 'It works for them.', chip: 'We work for you.' },
} as const;

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

/** A step's copy: the gated text while its claim may render, else the base; extras added while theirs may. */
function StepText({ step }: { step: LandingStep }) {
  const gated = step.gated && claimVisible(getClaim(step.gated.claim));
  return (
    <span>
      <strong>{step.title}</strong>{' '}
      {gated && step.gated ? <span {...claimAttrs(getClaim(step.gated.claim))}>{step.gated.text}</span> : step.text}
      {step.extras
        ?.filter((e) => claimVisible(getClaim(e.claim)))
        .map((e) => (
          <span key={e.claim} {...claimAttrs(getClaim(e.claim))}>
            {' '}
            {e.text}
          </span>
        ))}
    </span>
  );
}

/**
 * A pillar page laid out like the landing pages
 * (design/claims247-third-party-insurance-claim.html and -mobile.html): the
 * hero with the H1 bar, the H2, the lead, the eligibility line and the 2×2
 * proof grid, then the strip on the fold on mobile, the FAQ, the band (the
 * page's own lines), how it works with gated sentences, the independence
 * line and the footer. Everything benefit-shaped comes from the canonical
 * proof points and the frontmatter; nothing is inline here.
 */
export function PillarLanding({ page }: { page: Page }) {
  const fm = page.frontmatter;
  const crumbs = [...(fm.breadcrumb ?? []), { href: fm.slug, label: fm.h1 ?? fm.title }];
  const visibleCrumbs = crumbs.slice(0, -1).map((c) => (isLive(c.href) || c.href === '/' ? c : { ...c, href: '' }));
  return (
    <>
      <SiteHeader />
      <main id="main" data-template={fm.template}>
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
              <p className={styles.elig} data-eligibility>
                {eligibility}
              </p>
            </div>
            <div className={styles.bottom}>
              <ProofGrid className={styles.grid} />
              <div className={styles.ctas}>
                <Button href={nav.claimHref} variant="ink" className={styles.start} data-cta="start">
                  {cta.start}
                </Button>
                <Button href={site.phone.href} variant="yellow" icon="phone" className={styles.call} data-cta="call">
                  {cta.call}
                </Button>
                <WaitRow className={styles.wait} />
                <Button href={nav.claimHref} variant="outline-ink" iconAfter="arrow" block className={styles.online} data-cta="start-online">
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
