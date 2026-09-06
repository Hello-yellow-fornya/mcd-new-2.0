/** Frontmatter for content/<section>/<slug>.mdx (appendix §10). */
export type TemplateName = 'pillar' | 'process' | 'comparison' | 'guide' | 'location' | 'article' | 'utility';

export const templateNames: TemplateName[] = ['pillar', 'process', 'comparison', 'guide', 'location', 'article', 'utility'];

export type Crumb = { href: string; label: string };

export type FaqEntry = { q: string; a: string };

export type HowToStep = { id: string; name: string };

export type Frontmatter = {
  /** The route, with leading and trailing slash. */
  slug: string;
  template: TemplateName;
  /** <title>, at most 60 characters. */
  title: string;
  /** Meta description, at most 155 characters. */
  description: string;
  kicker?: string;
  /** The visible headline. Defaults to title. */
  h1?: string;
  /** One or two words of the H1 that carry the yellow bar (§0). */
  highlight?: string;
  lead?: string;
  /** ISO date of the last editorial review. */
  lastReviewed: string;
  author: string;
  /** Parent pages for the breadcrumb, in order. Home is added automatically. */
  breadcrumb?: Crumb[];
  photo?: { alt: string; note?: string };
  faq?: FaqEntry[];
  /** Slugs of related pages; drafts are dropped at build time. */
  related?: string[];
  /** Service, Article, HowTo, LocalBusiness; the template picks a default. */
  schemaType?: 'Service' | 'Article' | 'HowTo' | 'LocalBusiness' | 'none';
  /** HowTo steps override: id must match a heading id in the body. By default the H2s starting "Step N." are used. */
  steps?: HowToStep[];
  draft?: boolean;
  /** Sitemap phase from motorclaimsdepartment_sitemap.html. */
  phase?: 1 | 2 | 3;
};

export type Heading = { id: string; text: string; depth: number };

export type Page = {
  file: string;
  section: string;
  frontmatter: Frontmatter;
  body: string;
  headings: Heading[];
};
