import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isProduction } from '../../src/lib/staging.ts';
import { resolveSiteUrl, canonicalPath } from '../../src/lib/site-url.ts';

test('only VERCEL_ENV=production is production', () => {
  assert.equal(isProduction('production'), true);
  assert.equal(isProduction('preview'), false);
  assert.equal(isProduction(undefined), false);
});

test('the site URL comes from NEXT_PUBLIC_SITE_URL, then Vercel, then localhost', () => {
  assert.equal(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://mcd-new-2-0.vercel.app/' }), 'https://mcd-new-2-0.vercel.app');
  assert.equal(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'mcd-new-2-0.vercel.app' }), 'https://mcd-new-2-0.vercel.app');
  assert.equal(resolveSiteUrl({}), 'http://localhost:3000');
});

test('paths get leading and trailing slashes', () => {
  assert.equal(canonicalPath('claim-now'), '/claim-now/');
  assert.equal(canonicalPath('/claim/goskippy'), '/claim/goskippy/');
  assert.equal(canonicalPath('/'), '/');
});
