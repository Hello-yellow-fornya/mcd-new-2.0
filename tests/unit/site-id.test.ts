import { test } from 'node:test';
import assert from 'node:assert/strict';
import { siteForBuild } from '../../src/lib/site-id.ts';

test('NEXT_PUBLIC_SITE selects the site; unset, an ocr/ branch on Vercel is OCR and everything else is Claims 24/7', () => {
  assert.equal(siteForBuild({}), 'mcd2');
  assert.equal(siteForBuild({ NEXT_PUBLIC_SITE: 'ocr' }), 'ocr');
  assert.equal(siteForBuild({ NEXT_PUBLIC_SITE: ' mcd2 ' }), 'mcd2');
  assert.equal(siteForBuild({ VERCEL_GIT_COMMIT_REF: 'ocr/preview' }), 'ocr');
  assert.equal(siteForBuild({ VERCEL_GIT_COMMIT_REF: 'ocr' }), 'ocr');
  assert.equal(siteForBuild({ VERCEL_GIT_COMMIT_REF: 'feat/ocr-thing' }), 'mcd2');
  assert.equal(siteForBuild({ VERCEL_GIT_COMMIT_REF: 'main' }), 'mcd2');
  // The variable wins over the branch.
  assert.equal(siteForBuild({ NEXT_PUBLIC_SITE: 'mcd2', VERCEL_GIT_COMMIT_REF: 'ocr/preview' }), 'mcd2');
  assert.throws(() => siteForBuild({ NEXT_PUBLIC_SITE: 'mcd3' }), /NEXT_PUBLIC_SITE/);
});
