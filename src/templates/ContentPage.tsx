import { MDXRemote } from 'next-mdx-remote/rsc';
import { ArticleLayout, Band, Breadcrumb, Faq, HeroText, JsonLd, KeepsStrip, PhotoPlaceholder, RelatedPages, SectionCta, SiteFooter, SiteHeader } from '@/components';
import { getPage, isLive, type Page } from '@/lib/content';
import { pageSchema } from '@/lib/content/schema';
import remarkHeadingIds from '@/lib/content/remark-heading-ids';
import { mdxComponents } from './mdx-components';
import styles from './ContentPage.module.css';

/** Which templates carry the keeps strip (appendix §5: guide and article do not). */
const keepsStripOn = new Set(['pillar', 'process', 'comparison', 'location']);

export function formatReviewed(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

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

function related(page: Page) {
  return (page.frontmatter.related ?? [])
    .map((slug) => getPage(slug))
    .filter((p): p is Page => !!p && !p.frontmatter.draft)
    .map((p) => ({ href: p.frontmatter.slug, title: p.frontmatter.h1 ?? p.frontmatter.title, description: p.frontmatter.description }));
}

/**
 * The SEO page templates (appendix §5) in 2.0 styling: pillar, process,
 * comparison, guide, location, article. One shell, varied by template:
 * breadcrumb, text hero, keeps strip, TOC + prose, FAQ from frontmatter,
 * CTA pair, related pages, band. Schema is generated from the same data.
 */
export function ContentPage({ page }: { page: Page }) {
  const fm = page.frontmatter;
  const crumbs = crumbsFor(page);
  const toc = page.headings.filter((h) => h.depth === 2).map((h) => ({ id: h.id, text: h.text }));
  if (fm.faq?.length) toc.push({ id: 'faq', text: 'Frequently asked questions' });
  const rel = related(page);
  const visibleCrumbs = crumbs.slice(0, -1).map((c) => (isLive(c.href) || c.href === '/' ? c : { ...c, href: '' }));

  return (
    <>
      <SiteHeader />
      <main id="main" data-template={fm.template}>
        <Breadcrumb items={[...visibleCrumbs.map((c) => ({ href: c.href, label: c.label })), { href: fm.slug, label: fm.h1 ?? fm.title }]} schema={false} />
        <HeroText
          kicker={fm.kicker}
          title={fm.h1 ?? fm.title}
          highlight={fm.highlight}
          lead={fm.lead}
          meta={{ lastReviewed: formatReviewed(fm.lastReviewed), author: fm.author }}
          photo={fm.photo ? <PhotoPlaceholder label={fm.photo.alt} note={fm.photo.note} /> : undefined}
        />
        {keepsStripOn.has(fm.template) && <KeepsStrip />}
        <ArticleLayout toc={toc}>
          <Body page={page} />
          <FaqBlock page={page} />
          <SectionCta />
        </ArticleLayout>
        {rel.length > 0 && <RelatedPages items={rel} />}
        <Band />
      </main>
      <SiteFooter />
      <JsonLd data={pageSchema(page, crumbs)} />
    </>
  );
}
