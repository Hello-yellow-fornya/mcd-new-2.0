import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { insurerLeaks, validateLanding, type LandingConfig } from '../../src/lib/landing-config.ts';
import { siteDir } from '../../src/lib/site-dir.ts';

const dir = join(siteDir, 'landing');

test('every landing config is valid and keeps the insurer name to the H1', () => {
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  assert.ok(files.includes('goskippy.json'));
  for (const f of files) {
    const c = validateLanding(JSON.parse(readFileSync(join(dir, f), 'utf8')), f);
    assert.equal(insurerLeaks(c).length, 0, f);
    assert.match(c.slug, /^[a-z0-9-]+$/);
  }
});

const base: LandingConfig = {
  slug: 'acme',
  insurer: 'Acme',
  title: 'Insured with Acme? Call us first',
  description: 'The other driver’s insurer pays.',
  h1: { before: 'Insured with ', highlight: 'Acme?', after: '' },
  h2: { before: 'Call us before you call your insurer.', highlight: '', after: '' },
  facts: [],
};

test('an insurer name outside the H1 fails validation', () => {
  assert.doesNotThrow(() => validateLanding(base));
  assert.throws(() => validateLanding({ ...base, description: 'Better than Acme.' }), /insurer name may only appear/);
  assert.throws(() => validateLanding({ ...base, mobileSub: 'acme drivers welcome' }), /mobileSub/);
  assert.throws(() => validateLanding({ ...base, h2: { before: 'Acme? Call us.', highlight: '', after: '' } }), /h2/);
});

test('sourced facts need source, sourceUrl and checkedOn', () => {
  const fact = { label: 'Excess', theirs: '£250', ours: '£0', source: 'Policy wording', sourceUrl: 'https://example.com/policy.pdf', checkedOn: '2026-09-01' };
  assert.doesNotThrow(() => validateLanding({ ...base, facts: [fact] }));
  assert.throws(() => validateLanding({ ...base, facts: [{ ...fact, checkedOn: '' }] }), /checkedOn/);
});

test('slugs are lowercase with hyphens only', () => {
  assert.throws(() => validateLanding({ ...base, slug: 'Go Skippy' }), /slug/);
});
