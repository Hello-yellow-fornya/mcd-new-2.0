import { MDXRemote } from 'next-mdx-remote/rsc';
import { ArticleLayout, Band, Breadcrumb, Faq, HeroText, JsonLd, KeepsStrip, SectionCta, SiteFooter, SiteHeader } from '@/components';
import { isLive, type Page } from '@/lib/content';
import { pageSchema } from '@/lib/content/schema';
import remarkHeadingIds from '@/lib/content/remark-heading-ids';
import { mdxComponents } from './mdx-components';
import styles from './ContentPage.module.css';

/** Which templates carry the keeps strip by default (appendix §5: guide and article do not); frontmatter `keeps` overrides. */
const keepsStripOn = new Set(['pillar', 'process', 'comparison', 'location']);

/** The jump list stays where a page is long: this many entries, the FAQ included. */
const TOC_MIN = 4;

function crumbsFor(page: Page) {
  const fm = page.frontmatter;
  return [...(fm.breadcrumb ?? []), { href: fm.slug, label: fm.h1 ?? fm.title }];
}

function Body({ page }: { page: Page }) {
  // blockJS is off: content is trusted files in this repo, and the block would strip
  // every JSX attribute expression (Steps items, ThemUs rows). Dangerous-call blocking stays on.
  return <MDXRemote source={page.body} components={mdxComponents} options={{ mdxOptions: { remarkPlugins: [remarkHeadingIds] }, blockJS: false, blockDangerousJS: true }} />;
}

function FaqBlock({ page }: { page: Page }) {
  const faq = page.frontmatter.faq;
  if (!faq?.length) return null;
  return (
    <>
      <h2 id="faq" className={styles.faqHeading}>
        Frequently asked questions
      </h2>
      <Faq items={faq} schema={false} inline />
    </>
  );
}

/**
 * The content page templates (appendix §5) in the 24/7 skin: pillar,
 * process, comparison, guide, location, article. One shell, varied by
 * template: breadcrumb, text hero (no photo slot until real images exist:
 * the text column runs full width), keeps strip, jump list + prose, FAQ
 * from frontmatter, the CTA pair, the band. The site is not indexed, so the
 * ranking furniture (reviewed/author line, related pages) is gone; the
 * schema stays because crawlers that ignore noindex still read it.
 */
export function ContentPage({ page }: { page: Page }) {
  const fm = page.frontmatter;
  const crumbs = crumbsFor(page);
  const toc = page.headings.filter((h) => h.depth === 2).map((h) => ({ id: h.id, text: h.text }));
  if (fm.faq?.length) toc.push({ id: 'faq', text: 'Frequently asked questions' });
  const visibleCrumbs = crumbs.slice(0, -1).map((c) => (isLive(c.href) || c.href === '/' ? c : { ...c, href: '' }));

  return (
    <>
      <SiteHeader />
      <main id="main" data-template={fm.template}>
        <Breadcrumb items={[...visibleCrumbs.map((c) => ({ href: c.href, label: c.label })), { href: fm.slug, label: fm.h1 ?? fm.title }]} schema={false} />
        <HeroText kicker={fm.kicker} title={fm.h1 ?? fm.title} highlight={fm.highlight} lead={fm.lead} />
        {(fm.keeps ?? keepsStripOn.has(fm.template)) && <KeepsStrip items={fm.keepsItems} label={fm.keepsItems ? 'What we cover' : undefined} />}
        <ArticleLayout toc={toc.length >= TOC_MIN ? toc : []}>
          <Body page={page} />
          <FaqBlock page={page} />
          <SectionCta compact />
        </ArticleLayout>
        <Band />
      </main>
      <SiteFooter />
      <JsonLd data={pageSchema(page, crumbs)} />
    </>
  );
}
