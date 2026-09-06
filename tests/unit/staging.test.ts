import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isProduction } from '../../src/lib/staging.ts';
import { isLiveHost, isStagingSite, isVercelHost } from '../../src/lib/host.ts';
import { resolveSiteUrl, canonicalPath } from '../../src/lib/site.ts';

test('only VERCEL_ENV=production is production', () => {
  assert.equal(isProduction('production'), true);
  assert.equal(isProduction('preview'), false);
  assert.equal(isProduction(undefined), false);
});

test('while the site URL is a .vercel.app address, no host is live (§0)', () => {
  const site = 'mcd-new-2-0.vercel.app';
  assert.equal(isStagingSite(site), true);
  assert.equal(isLiveHost('mcd-new-2-0.vercel.app', site), false);
  assert.equal(isLiveHost('www.mcd-new-2-0.vercel.app', site), false);
  assert.equal(isLiveHost('mcd-new-2-0-git-main-fornya.vercel.app', site), false);
  assert.equal(isLiveHost('localhost:3100', site), false);
  assert.equal(isLiveHost(null, site), false);
});

test('once a real domain is set, only that host (with or without www) is live', () => {
  const site = 'example.co.uk';
  assert.equal(isStagingSite(site), false);
  assert.equal(isLiveHost('example.co.uk', site), true);
  assert.equal(isLiveHost('www.example.co.uk', site), true);
  assert.equal(isLiveHost('Example.co.uk:443', site), true);
  assert.equal(isLiveHost('mcd-new-2-0.vercel.app', site), false);
  assert.equal(isLiveHost('staging.example.co.uk', site), false);
  assert.equal(isLiveHost('localhost:3100', site), false);
});

test('vercel hosts are recognised', () => {
  assert.equal(isVercelHost('mcd-new-2-0.vercel.app'), true);
  assert.equal(isVercelHost('mcd-new-2-0.vercel.app:443'), true);
  assert.equal(isVercelHost('example.co.uk'), false);
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
