import { test } from 'node:test';
import assert from 'node:assert/strict';
import { campaignFromUrl, CLICK_ID_KEYS, UTM_KEYS } from '../../src/lib/campaign.ts';

test('a URL with no campaign parameters carries no campaign', () => {
  assert.equal(campaignFromUrl(''), null);
  assert.equal(campaignFromUrl('?reg=AB12CDE'), null);
});

test('the UTM set and the click id are read, and the landing path is recorded', () => {
  const c = campaignFromUrl('?gclid=abc123&utm_source=google&utm_medium=cpc&utm_campaign=tpc&utm_term=third+party&utm_content=v2&reg=AB12CDE', '/ppc/third-party-claim/')!;
  assert.equal(c.gclid, 'abc123');
  assert.equal(c.utm_source, 'google');
  assert.equal(c.utm_medium, 'cpc');
  assert.equal(c.utm_campaign, 'tpc');
  assert.equal(c.utm_term, 'third party');
  assert.equal(c.utm_content, 'v2');
  assert.equal(c.landing, '/ppc/third-party-claim/');
  assert.ok(Date.parse(c.at!) > 0);
  // Nothing else off the query string comes with it.
  assert.deepEqual(Object.keys(c).sort(), ['at', 'gclid', 'landing', 'utm_campaign', 'utm_content', 'utm_medium', 'utm_source', 'utm_term']);
});

test('the other click ids are read too, so a second channel needs no code change', () => {
  for (const k of CLICK_ID_KEYS) assert.equal(campaignFromUrl(`?${k}=xyz`)![k], 'xyz', k);
  for (const k of UTM_KEYS) assert.equal(campaignFromUrl(`?${k}=xyz`)![k], 'xyz', k);
});

test('values are length-capped and anything that is not a campaign value is dropped', () => {
  assert.equal(campaignFromUrl(`?gclid=${'a'.repeat(500)}`)!.gclid!.length, 200);
  assert.equal(campaignFromUrl('?gclid=<script>alert(1)</script>'), null);
  assert.equal(campaignFromUrl('?utm_source=goo"gle'), null);
  // A legitimate campaign name survives alongside a rejected one.
  assert.deepEqual(campaignFromUrl('?utm_source=<bad>&utm_medium=cpc')!.utm_medium, 'cpc');
});
