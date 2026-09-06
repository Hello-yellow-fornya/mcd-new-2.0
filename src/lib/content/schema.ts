import { absoluteUrl, site } from '@/lib/site';
import type { Page } from './types.ts';

type Node = Record<string, unknown>;

const org = () => ({
  '@type': 'Organization',
  '@id': absoluteUrl('/#org'),
  name: site.name,
  legalName: site.legalName,
  url: absoluteUrl('/'),
  telephone: site.phone.e164,
  areaServed: 'GB',
});

/**
 * JSON-LD graph for a content page (appendix §5). Generated from frontmatter and
 * page data, never hand-typed: FAQ schema is the visible FAQ, HowTo steps are
 * the step headings, breadcrumbs are the visible crumbs.
 */
export function pageSchema(page: Page, crumbs: { href: string; label: string }[]): { '@context': string; '@graph': Node[] } {
  const fm = page.frontmatter;
  const url = absoluteUrl(fm.slug);
  const graph: Node[] = [org()];

  graph.push({
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: absoluteUrl(c.href) })),
  });

  const defaults: Record<string, string> = {
    pillar: 'Article',
    process: 'HowTo',
    comparison: 'Article',
    guide: 'HowTo',
    location: 'LocalBusiness',
    article: 'Article',
    utility: 'none',
  };
  const type = fm.schemaType ?? defaults[fm.template];

  if (type === 'Service') {
    graph.push({
      '@type': 'Service',
      name: fm.h1 ?? fm.title,
      provider: { '@id': absoluteUrl('/#org') },
      areaServed: 'GB',
      serviceType: 'Non-fault accident management',
      url,
    });
  }
  if (type === 'Article') {
    graph.push({
      '@type': 'Article',
      headline: fm.h1 ?? fm.title,
      description: fm.description,
      author: { '@type': 'Person', name: fm.author },
      publisher: { '@id': absoluteUrl('/#org') },
      dateModified: fm.lastReviewed,
      mainEntityOfPage: url,
    });
  }
  if (type === 'HowTo') {
    // Steps are the H2s that start "Step N." (brief §5: HowTo with step anchors), unless frontmatter pins them.
    const steps = fm.steps ?? page.headings.filter((h) => h.depth === 2 && /^Step \d+\./.test(h.text)).map((h) => ({ id: h.id, name: h.text.replace(/^Step \d+\.\s*/, '') }));
    graph.push({
      '@type': 'HowTo',
      name: fm.h1 ?? fm.title,
      description: fm.description,
      step: steps.map((s) => ({ '@type': 'HowToStep', name: s.name, url: `${url}#${s.id}` })),
    });
  }
  if (type === 'LocalBusiness') {
    // Address only if real (appendix §5): none yet, so the entry is the organisation serving the area.
    graph.push({
      '@type': 'LocalBusiness',
      '@id': `${url}#business`,
      name: site.name,
      parentOrganization: { '@id': absoluteUrl('/#org') },
      telephone: site.phone.e164,
      url,
      areaServed: fm.h1 ?? fm.title,
    });
  }
  if (fm.faq?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: fm.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
