import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compactReg, formatReg, isPlausibleReg } from '../../src/lib/reg.ts';

test('formats current-style plates as AB12 CDE from any case or spacing', () => {
  assert.equal(formatReg('ab12cde'), 'AB12 CDE');
  assert.equal(formatReg(' AB 12 CDE '), 'AB12 CDE');
  assert.equal(formatReg('ab12'), 'AB12');
  assert.equal(formatReg('A123BCD'), 'A123BCD');
  assert.equal(compactReg('ab12 cde!'), 'AB12CDE');
});

test('plausibility needs letters and a digit, two to seven characters', () => {
  assert.equal(isPlausibleReg('AB12CDE'), true);
  assert.equal(isPlausibleReg('A1'), true);
  assert.equal(isPlausibleReg('ABCDEFG'), false);
  assert.equal(isPlausibleReg('1234'), false);
  assert.equal(isPlausibleReg(''), false);
});
