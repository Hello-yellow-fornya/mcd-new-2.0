import { MDXRemote } from 'next-mdx-remote/rsc';
import { Band, Button, Prose, SiteFooter, SiteHeader } from '@/components';
import remarkHeadingIds from '@/lib/content/remark-heading-ids';
import type { Page } from '@/lib/content';
import { pageSchema } from '@/lib/content/schema';
import { cta, nav } from '@site/copy';
import { site } from '@/lib/site';
import { mdxComponents } from './mdx-components';
import styles from './UtilityPage.module.css';

/**
 * Utility pages (about, contact, the legal set) from content/utility/*.mdx.
 * Text hero: ochre eyebrow, H1, the lead as the page's H2 (the H2 rule holds
 * on every page, §0), the CTA pair. Then the prose, the
 * band and the footer. Organization and breadcrumb schema from frontmatter.
 */
export function UtilityPage({ page }: { page: Page }) {
  const fm = page.frontmatter;
  const crumbs = [
    { href: '/', label: 'Home' },
    { href: fm.slug, label: fm.h1 ?? fm.title },
  ];
  return (
    <>
      <SiteHeader />
      <main id="main" data-utility={fm.slug}>
        <section className={styles.hero} data-hero>
          <div className={`wrap ${styles.heroIn}`}>
            {fm.kicker ? <p className={styles.kicker}>{fm.kicker}</p> : null}
            <h1 className={styles.h1}>{fm.h1 ?? fm.title}</h1>
            {fm.lead ? <h2 className={styles.h2}>{fm.lead}</h2> : null}
            <div className={styles.ctas}>
              <Button href={nav.claimHref} variant="ink" data-cta="start">
                {cta.start}
              </Button>
              <Button href={site.phone.href} variant="yellow" icon="phone" data-cta="call">
                {cta.call}
              </Button>
            </div>
          </div>
        </section>
        <section className={styles.body}>
          <div className="wrap">
            <Prose>
              <MDXRemote source={page.body} components={mdxComponents} options={{ mdxOptions: { remarkPlugins: [remarkHeadingIds] } }} />
            </Prose>
          </div>
        </section>
        <Band />
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema(page, crumbs)) }} />
    </>
  );
}
