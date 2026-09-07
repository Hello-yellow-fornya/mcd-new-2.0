#!/usr/bin/env node
/**
 * Lighthouse mobile audit against a running production build (appendix §9):
 * Performance ≥ 90, Accessibility 100, SEO 100, Best practices ≥ 90 on every
 * template. On staging the noindex is by design, so the two crawlability
 * audits are set aside when judging SEO.
 *
 *   pnpm build && pnpm start -p 3100 &  then  pnpm audit:lh
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const base = process.env.LH_BASE || 'http://localhost:3100';
const pages = ['/', '/claim-now/', '/non-fault-accident/', '/how-accident-management-works/', '/claim/goskippy/', '/about-us/'];
const STAGING_SEO = new Set(['is-crawlable', 'robots-txt']);
const dir = mkdtempSync(join(tmpdir(), 'lh-'));
let failed = false;

for (const p of pages) {
  const out = join(dir, `${p.replace(/\W/g, '_') || 'home'}.json`);
  const r = spawnSync(process.env.LH_BIN ? 'node' : 'npx', [...(process.env.LH_BIN ? [process.env.LH_BIN] : ['-y', 'lighthouse@13']), `${base}${p}`, '--quiet', `--chrome-flags=--headless=new --no-sandbox`, '--only-categories=performance,accessibility,seo,best-practices', '--output=json', `--output-path=${out}`], {
    stdio: 'ignore',
    env: { ...process.env, CHROME_PATH: process.env.CHROME_PATH || process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || '' },
  });
  if (r.status !== 0) {
    console.error(`${p}: lighthouse did not run`);
    failed = true;
    continue;
  }
  const j = JSON.parse(readFileSync(out, 'utf8'));
  const score = (c) => Math.round(j.categories[c].score * 100);
  const seoFails = j.categories.seo.auditRefs.map((x) => j.audits[x.id]).filter((a) => a.score !== null && a.score < 1 && !STAGING_SEO.has(a.id));
  const a11yFails = j.categories.accessibility.auditRefs.map((x) => j.audits[x.id]).filter((a) => a.score !== null && a.score < 1);
  const ok = score('performance') >= 90 && a11yFails.length === 0 && seoFails.length === 0 && score('best-practices') >= 90;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${p.padEnd(36)} perf ${score('performance')}  a11y ${score('accessibility')}  seo ${score('seo')}${seoFails.length ? '' : ' (100 off staging)'}  bp ${score('best-practices')}`);
  for (const a of [...a11yFails, ...seoFails]) console.log(`       ${a.id}: ${a.title}`);
  if (!ok) failed = true;
}
process.exit(failed ? 1 : 0);
