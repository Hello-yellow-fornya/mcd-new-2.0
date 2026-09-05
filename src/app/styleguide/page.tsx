import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  Band,
  Benefits,
  Button,
  ClaimsStrip,
  Faq,
  HomeHero,
  IconCircle,
  IndependenceLine,
  Logo,
  ProofGrid,
  ReviewBand,
  SectionCta,
  SiteFooter,
  SiteHeader,
  Steps,
  ThemUs,
} from '@/components';
import { hero } from '@/data/copy';
import { isProduction } from '@/lib/staging';
import { site } from '@/lib/site';
import styles from './styleguide.module.css';

export const metadata: Metadata = { title: 'Styleguide', robots: { index: false, follow: false } };

/** Every component with its variants, for review on staging. 404 on production. */
export default function StyleguidePage() {
  if (isProduction()) notFound();
  return (
    <>
      <SiteHeader />
      <main id="main">
        <div className={styles.label}>Hero (fold-locked on mobile; the ClaimsStrip ends on the fold)</div>
        <HomeHero h1={hero.h1} h2={hero.h2} />
        <ClaimsStrip />
        <div className={styles.label}>Review band (sample data; does not render on production)</div>
        <ReviewBand />
        <div className={styles.label}>Band</div>
        <Band />
        <div className={styles.label}>Their / your table with its CTA pair</div>
        <ThemUs />
        <IndependenceLine />
        <div className={styles.label}>Independence line, landing-page form</div>
        <IndependenceLine insurer="GoSkippy" />
        <div className={styles.label}>Benefits</div>
        <Benefits />
        <div className={styles.label}>How it works</div>
        <Steps />
        <div className={styles.label}>FAQ</div>
        <Faq schema={false} />
        <section className={styles.section}>
          <div className="wrap">
            <div className={styles.label}>Buttons</div>
            <div className={styles.row}>
              <Button href="/claim-now/">Start your non-fault claim</Button>
              <Button href={site.phone.href} variant="yellow" icon="phone">
                Call {site.phone.display}
              </Button>
              <Button href="/claim-now/" variant="outline-ink" iconAfter="arrow">
                Or start your no-fault claim online
              </Button>
              <Button href="/claim-now/" size="sm">
                Start your claim
              </Button>
              <Button href={site.phone.href} variant="yellow" size="sm" icon="phone">
                {site.phone.display}
              </Button>
            </div>
            <div className={`${styles.row} ${styles.onInk} on-dark`}>
              <Button href="/claim-now/" variant="outline-yellow" size="band">
                Start your claim
              </Button>
              <Button href={site.phone.href} variant="outline-yellow" size="band" icon="phone">
                Call now
              </Button>
            </div>
            <div className={styles.label}>Section CTA pair, and the compact mobile form</div>
            <SectionCta />
            <SectionCta compact />
            <div className={styles.label}>Icon circles</div>
            <div className={styles.row}>
              {(['shield', 'pound', 'car', 'bolt', 'check', 'doc', 'person'] as const).map((n) => (
                <IconCircle key={n} name={n} variant="ink" />
              ))}
              {(['shield', 'pound', 'car', 'bolt', 'check', 'doc', 'person'] as const).map((n) => (
                <IconCircle key={n} name={n} variant="yellow" size={30} />
              ))}
              {(['dot', 'bolt'] as const).map((n) => (
                <IconCircle key={n} name={n} variant="pale" size={16} iconSize={9} />
              ))}
            </div>
            <div className={styles.label}>Logo at 34px, and the proof grid alone</div>
            <Logo />
            <div className={styles.gridWrap}>
              <ProofGrid />
            </div>
            <div className={styles.label}>Highlight: the bar under one or two words</div>
            <h2>
              Choose the <span className="hl">smarter way</span> to claim.
            </h2>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
