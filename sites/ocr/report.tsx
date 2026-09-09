import { Suspense } from 'react';
import { Button } from '@/components/Button/Button';
import { absoluteUrl, site } from '@/lib/site';
import { ThankYouEvent } from '@/app/claim-now/thank-you/ThankYouEvent';
import { SiteHeader } from './header';
import { SiteFooter } from './footer';
import { FinalCta } from './components/FinalCta';
import { ReportForm } from './components/ReportForm';
import { cta, report } from './copy';
import styles from './components/report.module.css';

/** /report/: the same form as the hero, full page, with what we ask and what happens next beside it. */
export function ReportPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': absoluteUrl('/#org'), name: site.name, url: absoluteUrl('/'), telephone: site.phone.e164 },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
          { '@type': 'ListItem', position: 2, name: report.h1, item: absoluteUrl('/report/') },
        ],
      },
    ],
  };
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className={styles.hero} data-hero>
          <div className={`wrap ${styles.heroIn}`}>
            <p className={styles.kicker}>{report.eyebrow}</p>
            <h1 className={styles.h1}>{report.h1}</h1>
            <h2 className={styles.h2}>{report.h2}</h2>
          </div>
        </section>
        <section className={styles.body} data-placement="report">
          <div className={`wrap ${styles.grid}`}>
            <ReportForm placement="report" className={styles.form} />
            <aside className={styles.aside}>
              <h2>{report.asideAsk.h2}</h2>
              <ul>
                {report.asideAsk.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              <h2>{report.asideNext.h2}</h2>
              <p>{report.asideNext.text}</p>
              <p className={styles.call}>
                {report.rather} <a href={site.phone.href}>{site.phone.display}</a>. {report.picksUp}
              </p>
            </aside>
          </div>
        </section>
        <FinalCta />
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

/** /report/thank-you/: the conversion trigger the form sends the visitor to. */
export function ReportThanks() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className={styles.hero} data-hero>
          <div className={`wrap ${styles.heroIn}`}>
            <h1 className={styles.h1}>{report.thanks.h1}</h1>
            <h2 className={styles.h2}>{report.thanks.h2}</h2>
            <p className={styles.note}>{report.thanks.text}</p>
            <Button href={site.phone.href} variant="yellow" icon="phone" data-cta="call">
              {cta.call}
            </Button>
          </div>
        </section>
        <FinalCta />
      </main>
      <SiteFooter />
      <Suspense fallback={null}>
        <ThankYouEvent />
      </Suspense>
    </>
  );
}
