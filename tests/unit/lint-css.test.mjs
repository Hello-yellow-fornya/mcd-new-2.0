import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lintCss } from '../../scripts/lint-css.mjs';

const rulesHit = (css) => lintCss(css, 'x.css').map((f) => f.rule);

test('token pairings and sane components pass', () => {
  assert.deepEqual(rulesHit('.btn-yellow{background:var(--yellow);color:var(--on-yellow)}'), []);
  assert.deepEqual(rulesHit('.btn-ink{background:var(--ink);color:var(--on-ink-button)}'), []);
  assert.deepEqual(rulesHit('.band{background:var(--ink);color:var(--on-ink)}'), []);
});

test('uppercase and italics fail unless explicitly allowed', () => {
  assert.deepEqual(rulesHit('.eyebrow{text-transform:uppercase}'), ['no-uppercase']);
  assert.deepEqual(rulesHit('.reg input{text-transform:uppercase; /* allow: uppercase */}'), []);
  assert.deepEqual(rulesHit('em{font-style:italic}'), ['no-italic']);
});

test('white or cream text on yellow, pale or green fails', () => {
  assert.deepEqual(rulesHit('.x{background:var(--yellow);color:#fff}'), ['ink-on-bright']);
  assert.deepEqual(rulesHit('.x{background-color:#7DC24A;color:var(--white)}'), ['ink-on-bright']);
  assert.deepEqual(rulesHit('.x{background:var(--pale);color:var(--cream)}'), ['ink-on-bright']);
  assert.deepEqual(rulesHit('.x{background:var(--yellow);color:var(--on-ink-button)}'), ['ink-on-bright']);
  assert.deepEqual(rulesHit('@media (max-width:820px){.x{background:var(--yellow);color:white}}'), ['ink-on-bright']);
});

test('the 1.0 palette is rejected', () => {
  assert.deepEqual(rulesHit('.x{color:var(--coral)}'), ['no-1-0-palette']);
  assert.deepEqual(rulesHit('.x{background:#16324F}'), ['no-1-0-palette']);
  assert.deepEqual(rulesHit('.x{background:var(--ink)}'), []);
});

test('a box behind text fails; the chip is allowed when marked', () => {
  assert.deepEqual(rulesHit('.hl{box-shadow:inset 0 -0.22em 0 var(--yellow)}'), ['no-underlay']);
  assert.deepEqual(rulesHit('.chip{box-shadow:inset 0 0 0 100vmax var(--yellow); /* allow: chip */}'), []);
  assert.deepEqual(rulesHit('.hl{text-decoration:underline;text-decoration-color:var(--yellow)}'), []);
});

test('comments do not trigger the rules', () => {
  assert.deepEqual(rulesHit('/* never color:#fff on background:var(--yellow), and no var(--coral) */ .x{background:var(--yellow);color:var(--ink)}'), []);
});
