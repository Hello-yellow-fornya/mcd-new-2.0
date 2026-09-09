/** Frontmatter for content/<section>/<slug>.mdx (appendix §10). */
export type TemplateName = 'pillar' | 'pillar-landing' | 'ppc-landing' | 'process' | 'comparison' | 'guide' | 'location' | 'article' | 'utility';

export const templateNames: TemplateName[] = ['pillar', 'pillar-landing', 'ppc-landing', 'process', 'comparison', 'guide', 'location', 'article', 'utility'];

export type Crumb = { href: string; label: string };

/** An answer is one paragraph; a longer one adds paragraphs (a leading **bold** run renders strong), a ticked list and a closing line. */
export type FaqEntry = { q: string; a: string; more?: string[]; bullets?: string[]; after?: string };

/** A how-it-works step on a pillar-landing page. `gated` replaces `text` while its claim may render; `extras` are sentences added while theirs may. */
export type LandingStep = { title: string; text: string; gated?: { claim: string; text: string }; extras?: { claim: string; text: string }[] };

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
  /** utility: `none` drops the hero's claim and call CTAs (the legal pages). */
  cta?: 'pair' | 'none';
  /** pillar-landing and ppc-landing: the paragraph under the H2 (the lead is the H2). */
  intro?: string;
  /** pillar-landing and ppc-landing: whose claims department the band names. */
  band?: 'ours' | 'their';
  /** pillar-landing and ppc-landing: the how-it-works steps. */
  howItWorks?: LandingStep[];
  /** ISO date of the last editorial review. Optional: the site is not indexed, so no reviewed line renders. */
  lastReviewed?: string;
  author?: string;
  /** Show the keeps strip (default: pillar, process, comparison and location do; guide and article do not). */
  keeps?: boolean;
  /** The strip's three items for this page, in place of the site-wide "what you keep" set. */
  keepsItems?: { icon: 'phone' | 'check' | 'cross' | 'pound' | 'shield' | 'car' | 'bolt' | 'doc' | 'person' | 'star' | 'dot' | 'arrow' | 'pin'; label: string }[];
  /** Named areas for Service schema (a service-areas page); otherwise the service is nationwide. */
  areaServed?: string[];
  /** Parent pages for the breadcrumb, in order. Home is added automatically. */
  breadcrumb?: Crumb[];
  faq?: FaqEntry[];
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
