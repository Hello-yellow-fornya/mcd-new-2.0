import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lintText, loadRules } from '../../scripts/lint-content.mjs';

const rules = loadRules();
const rulesHit = (text) => lintText(text, 'x.mdx', rules).map((f) => f.rule);

test('clean copy passes', () => {
  const text = `---
title: Non-fault accident: what to do, and who pays
kicker: Not your fault? There’s a smarter way to claim.
---
## What counts as a non-fault accident?

Someone hit you. Their insurer has to put it right, not yours. MCD is regulated by the FCA.
`;
  assert.deepEqual(rulesHit(text), []);
});

test('exclamation marks fail, images and JSX comparisons do not', () => {
  assert.deepEqual(rulesHit('Call us now!'), ['no-exclamation']);
  assert.deepEqual(rulesHit('![A car on a drive](/img/car.webp)'), []);
  assert.deepEqual(rulesHit('{fault !== "clear" && <Callout />}'), []);
});

test('all-caps headings fail; acronyms on the allow list pass', () => {
  assert.deepEqual(rulesHit('## HOW IT WORKS'), ['no-all-caps-headings']);
  assert.deepEqual(rulesHit('## How the FCA sees it'), []);
  assert.deepEqual(rulesHit('---\nh1: WHAT TO DO NEXT\n---\n'), ['no-all-caps-headings']);
  assert.deepEqual(rulesHit('Body copy in CAPS is not a heading rule'), []);
});

test('week phrasing fails', () => {
  assert.deepEqual(rulesHit('Repairs take about two weeks.'), ['no-week-phrasing']);
  assert.deepEqual(rulesHit('Within the week.'), ['no-week-phrasing']);
  assert.deepEqual(rulesHit('Weekend delivery is available.'), []);
});

test('banned phrases fail, with curly apostrophes normalised', () => {
  assert.deepEqual(rulesHit('Your premium won’t go up.'), ['banned-phrases']);
  assert.deepEqual(rulesHit("Your premium won't go up."), ['banned-phrases']);
  assert.deepEqual(rulesHit('Repaired within 3 days.'), ['banned-phrases']);
});

test('code fences and MDX imports are skipped', () => {
  const text = '```js\nconsole.log("hello!")\n```\nimport Faq from "@/components/Faq!"\n';
  assert.deepEqual(rulesHit(text), []);
});
