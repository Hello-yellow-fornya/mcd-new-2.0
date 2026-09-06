export type Highlighted = { before: string; highlight: string; after: string };

export type LandingFact = {
  label: string;
  theirs: string;
  ours: string;
  source: string;
  sourceUrl: string;
  checkedOn: string;
};

export type LandingConfig = {
  slug: string;
  insurer: string;
  title: string;
  description: string;
  h1: Highlighted;
  h2: Highlighted;
  /** A short line under the H2, mobile only (mcd-2-0-goskippy-landing-mobile.html). */
  mobileSub?: string;
  facts: LandingFact[];
};

/**
 * Where the insurer name may appear (appendix §6): the H1 and the
 * independence line, which the template renders from `insurer`. Every other
 * copy field is checked here so a leak fails the build, not a review.
 */
export function insurerLeaks(c: LandingConfig): string[] {
  const name = c.insurer.toLowerCase();
  const fields: [string, string | undefined][] = [
    ['description', c.description],
    ['h2', `${c.h2.before}${c.h2.highlight}${c.h2.after}`],
    ['mobileSub', c.mobileSub],
    ...c.facts.flatMap((f, i): [string, string][] => [
      [`facts[${i}].label`, f.label],
      [`facts[${i}].ours`, f.ours],
    ]),
  ];
  return fields.filter(([, v]) => (v ?? '').toLowerCase().includes(name)).map(([k]) => k);
}

function isHighlighted(v: unknown): v is Highlighted {
  return !!v && typeof v === 'object' && ['before', 'highlight', 'after'].every((k) => typeof (v as Record<string, unknown>)[k] === 'string');
}

export function validateLanding(raw: unknown, file = 'landing config'): LandingConfig {
  const c = raw as Partial<LandingConfig>;
  const fail = (m: string) => {
    throw new Error(`${file}: ${m}`);
  };
  if (!c.slug || !/^[a-z0-9-]+$/.test(c.slug)) fail('slug must be lowercase letters, digits and hyphens');
  if (!c.insurer) fail('insurer is required');
  if (!c.title || !c.description) fail('title and description are required');
  if (!isHighlighted(c.h1) || !isHighlighted(c.h2)) fail('h1 and h2 must be { before, highlight, after }');
  const facts = Array.isArray(c.facts) ? c.facts : [];
  for (const [i, f] of facts.entries()) {
    for (const k of ['label', 'theirs', 'ours', 'source', 'sourceUrl', 'checkedOn'] as const) {
      if (typeof f[k] !== 'string' || !f[k]) fail(`facts[${i}].${k} is required: sourced facts render verbatim with source and date`);
    }
  }
  const cfg: LandingConfig = { ...(c as LandingConfig), facts };
  const leaks = insurerLeaks(cfg);
  if (leaks.length) fail(`the insurer name may only appear in the H1 and the independence line; found in ${leaks.join(', ')}`);
  return cfg;
}
