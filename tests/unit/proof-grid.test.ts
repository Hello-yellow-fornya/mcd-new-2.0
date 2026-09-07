import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectProofCards } from '../../src/lib/proof-grid.ts';

const cards = [
  { title: 'Protect your no claims' },
  { title: 'No excess to pay' },
  { title: 'Like-for-like replacement' },
  { title: 'Back on the road within 90 mins', claim: 'back-on-road-90-mins', fallback: { title: 'A named UK handler' } },
];

test('the proof grid is 2×2 whether or not the gated claim may show', () => {
  assert.equal(selectProofCards(cards, () => true).length, 4);
  assert.equal(selectProofCards(cards, () => false).length, 4);
});

test('an unsubstantiated card gives way to its fallback and drops its claim attributes; a visible one keeps them', () => {
  const hidden = selectProofCards(cards, () => false)[3];
  assert.equal(hidden.card.title, 'A named UK handler');
  assert.equal(hidden.claimId, null);
  const shown = selectProofCards(cards, () => true)[3];
  assert.match(shown.card.title, /90 mins/);
  assert.equal(shown.claimId, 'back-on-road-90-mins');
});

test('a gated card without a fallback drops out, as before', () => {
  const noFallback = [{ title: 'x' }, { title: 'y', claim: 'c' }];
  assert.deepEqual(selectProofCards(noFallback, () => false).map((c) => c.card.title), ['x']);
  assert.deepEqual(selectProofCards(noFallback, () => true).map((c) => c.card.title), ['x', 'y']);
});
