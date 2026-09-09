import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { claimVisible, isSubstantiated } from '../../src/lib/claims-pure.ts';

// The canonical proof points (sites/mcd2/proof-points.json) and the six gated claims.
const dir = join(process.cwd(), 'sites', 'mcd2');
const pp = JSON.parse(readFileSync(join(dir, 'proof-points.json'), 'utf8')) as {
  eligibility: string;
  grid: string[];
  strip: string[];
  points: { id: string; icon: string; short: string; title?: string; sub?: string; long: string; claim?: string }[];
};
const claims = JSON.parse(readFileSync(join(dir, 'claims.json'), 'utf8')).claims as { id: string; substantiated: boolean; evidence: string }[];
const point = (id: string) => pp.points.find((p) => p.id === id)!;

test('the grid is the four canonical cards with the pound, car, handset and tow truck; the strip is those plus three', () => {
  assert.deepEqual(pp.grid.map((id) => point(id).short), ['No excess to pay', 'Like-for-like car, van or motorbike', 'We deal with the at-fault insurer', 'Recovery, replacement and repairs sorted']);
  assert.deepEqual(pp.grid.map((id) => point(id).icon), ['pound', 'car', 'phone', 'truck']);
  assert.deepEqual(pp.grid.map((id) => point(id).sub), ['We pursue the at-fault insurer, not your policy', 'Suited to your everyday needs', 'You don’t have to chase them', 'We coordinate the moving parts']);
  assert.deepEqual(pp.strip.slice(4).map((id) => point(id).short), ['Onward travel for you and your passengers', 'Updates your way: WhatsApp, email or phone', 'Nothing to pay upfront']);
  // The eligibility line is off for Claims 24/7 (client, 9 September 2026): the key stays so the
  // heroes keep their type and OCR keeps its own line; empty means the heroes render no <p>.
  assert.equal(pp.eligibility, '');
});

test('no short form says "eligible"; the three lines that break the lint are not used', () => {
  for (const p of pp.points) for (const s of [p.short, p.title ?? '', p.sub ?? '']) assert.doesNotMatch(s, /eligib/i, `${p.id}: ${s}`);
  const all = JSON.stringify(pp) + readFileSync(join(dir, 'copy.ts'), 'utf8');
  for (const banned of ['It’s all yours', "It's all yours", 'We have nothing to hide', 'No problem.']) assert.ok(!all.includes(banned), banned);
});

test('the six proof points from the document are gated and absent on production', () => {
  const gated = ['recovery-within-90-minutes', 'answered-within-1-minute', 'lifetime-guarantee-on-repairs', 'bs-10125-and-new-parts', 'updates-your-way', 'no-cut-of-settlement'];
  for (const id of gated) {
    const c = claims.find((x) => x.id === id);
    assert.ok(c, `${id} in claims.json`);
    assert.equal(isSubstantiated(c!), false, id);
    assert.equal(claimVisible(c!, true), false, `${id} hidden on production`);
    assert.equal(claimVisible(c!, false), true, `${id} shown on previews`);
    assert.ok(pp.points.some((p) => p.claim === id), `${id} wired to a proof point`);
  }
  assert.ok(!claims.some((c) => c.id === 'back-on-road-90-mins'));
});
