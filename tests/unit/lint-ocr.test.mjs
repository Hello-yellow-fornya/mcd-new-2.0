import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lintText, loadRules, mergeRules, rulesFor, codeProse } from '../../scripts/lint-content.mjs';

// Claims Report Line's copy rules (sites/ocr/content.rules.json): every
// non-fault benefit conditioned on the same line, the claims-department band
// banned, copy files linted by their string literals.
const rules = rulesFor('sites/ocr/copy.ts');
const hits = (text, file = 'sites/ocr/copy.ts') => lintText(text, file, rules).map((f) => f.rule);

test('the site rules merge over the shared ones', () => {
  assert.ok(rules.conditioned);
  assert.ok(rules.bannedPhrases.includes('Your insurer has a claims department'));
  assert.ok(rules.bannedPhrases.includes('no win no fee'), 'shared phrases kept');
  assert.deepEqual(rulesFor('sites/mcd2/copy.ts').conditioned, undefined);
  assert.equal(mergeRules(loadRules(), { rules: { 'no-week-phrasing': false } }).rules['no-week-phrasing'], false);
});

test('an unconditioned benefit line fails; a conditioned one passes', () => {
  assert.deepEqual(hits("  { title: 'No excess to pay', sub: 'Nothing to chase back' },"), ['conditioned-copy']);
  assert.deepEqual(hits("  { title: 'No excess to pay', sub: 'Our service is free for non-fault drivers' },"), []);
  assert.deepEqual(hits("  'A like-for-like car on your drive while yours is fixed',"), ['conditioned-copy']);
  assert.deepEqual(hits("  'If it was not your fault, a like-for-like car on your drive while yours is fixed',"), []);
  assert.deepEqual(hits("  'Keep your no claims bonus',"), ['conditioned-copy']);
  assert.deepEqual(hits("  'Not your fault? Keep your no claims bonus',"), []);
  assert.deepEqual(hits("  'Nothing on your policy. Your no-claims untouched',"), ['conditioned-copy']);
});

test('the old way’s "your no-claims takes the hit" is not a benefit', () => {
  assert.deepEqual(hits("  'A claim on your record, and your no-claims takes the hit',"), []);
});

test('the claims-department band is banned on this site, and only here', () => {
  assert.deepEqual(hits("  l0: 'Your insurer has a claims department.',"), ['banned-phrases']);
  assert.deepEqual(lintText("  l0: 'Your insurer has a claims department.',", 'sites/mcd2/copy.ts', rulesFor('sites/mcd2/copy.ts')), []);
});

test('MDX under the site folder is conditioned too, and code lines are read by their strings and JSX text', () => {
  assert.deepEqual(hits('No excess to pay, ever.', 'sites/ocr/content/utility/about-us.mdx'), ['conditioned-copy']);
  assert.deepEqual(codeProse("const a = { icon: 'pound', title: 'No excess to pay' };", '.ts'), ['No excess to pay']);
  assert.deepEqual(codeProse('<p>No excess to pay, ever</p>', '.tsx'), ['No excess to pay, ever']);
  assert.deepEqual(hits('<p className={styles.p}>No excess to pay!</p>', 'sites/ocr/components/X.tsx'), ['conditioned-copy', 'no-exclamation']);
});

test('the site’s own copy passes', async () => {
  const { lintPaths } = await import('../../scripts/lint-content.mjs');
  const { findings } = lintPaths(['sites/ocr']);
  assert.deepEqual(findings, []);
});
