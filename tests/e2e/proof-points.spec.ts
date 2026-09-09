import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getLivePages } from '../../src/lib/content/index.ts';
import { onlySite } from './lib/site';

// Claims 24/7's canonical proof points (sites/mcd2/proof-points.json): every
// page renders its grid and strip from the file; the eligibility line appears
// once on desktop and not on mobile; no short form says "eligible"; the six
// gated claims are unsubstantiated; the legal line is the client's on every
// page; nothing on the site says "Motor Claims Department".
onlySite('mcd2');

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) <= 820;
const pp = JSON.parse(readFileSync(join(process.cwd(), 'sites', 'mcd2', 'proof-points.json'), 'utf8')) as {
  eligibility: string;
  grid: string[];
  strip: string[];
  points: { id: string; short: string; title?: string; sub?: string; claim?: string }[];
};
const point = (id: string) => pp.points.find((p) => p.id === id)!;
const LEGAL =
  'J&R MARKETING LIMITED trading as Claims247.co.uk. Company number: 10025657. Registered office address: C/O Perception Accounting Limited, The Cobalt Building, 1600 Eureka Park, Lower Pemberton, Ashford, Kent, England, TN25 4BF. Claims247.co.uk provides marketing and lead-generation services only and does not provide legal advice or claims-management services.';
const GATED = ['recovery-within-90-minutes', 'answered-within-1-minute', 'lifetime-guarantee-on-repairs', 'bs-10125-and-new-parts', 'updates-your-way', 'no-cut-of-settlement'];

for (const path of ['/', '/claim/goskippy/', '/third-party-insurance-claim/', '/credit-hire/']) {
  test(`${path}: the grid and strip render from proof-points.json; the eligibility line once on desktop, not on mobile`, async ({ page }) => {
    await page.goto(path);
    const titles = await page.locator('[data-proof-grid] li b').evaluateAll((els) => els.map((e) => (e as HTMLElement).innerText.replace(/\s+/g, ' ').trim()));
    expect(titles).toEqual(pp.grid.map((id) => point(id).title!.replace('\n', ' ')));
    const subs = await page.locator('[data-proof-grid] li > span:last-child').allInnerTexts();
    expect(subs).toEqual(pp.grid.map((id) => point(id).sub));
    // The strip runs on the homepage, the landing pages and the pillar-landing pages; the other templates carry the grid alone.
    const strip = await page.locator('[data-claims-strip] li:not([aria-hidden])').allInnerTexts();
    if (path === '/credit-hire/') expect(strip).toEqual([]);
    else expect(strip.map((s) => s.trim())).toEqual(pp.strip.map((id) => point(id).short));
    for (const t of [...titles, ...subs, ...strip]) expect(t).not.toMatch(/eligib/i);
    const elig = page.locator('[data-eligibility]');
    await expect(elig).toHaveCount(1);
    await expect(elig).toHaveText(pp.eligibility);
    if (isMobile(page)) await expect(elig).toBeHidden();
    else await expect(elig).toBeVisible();
  });
}

test('the six gated proof points carry data-unsubstantiated on this build (and are absent on production: tests/unit/proof-points.test.ts)', async ({ page }) => {
  await page.goto('/third-party-insurance-claim/');
  for (const id of GATED.filter((g) => g !== 'updates-your-way')) await expect(page.locator(`[data-claim="${id}"][data-unsubstantiated]`), id).toHaveCount(1);
  await expect(page.locator('[data-claims-strip] [data-claim="updates-your-way"][data-unsubstantiated]:not([aria-hidden])')).toHaveCount(1);
  await page.goto('/');
  await expect(page.locator('[data-claims-strip] [data-claim="updates-your-way"][data-unsubstantiated]:not([aria-hidden])')).toHaveCount(1);
});

test('the legal line is the client’s on every page, and nothing on the site says Motor Claims Department', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'one visit per route is enough');
  test.setTimeout(240_000);
  const routes = ['/', '/claim-now/', '/claim-now/thank-you/', '/claim/goskippy/', '/does-not-exist/', ...getLivePages().map((p) => p.frontmatter.slug)];
  for (const path of routes) {
    await page.goto(path);
    const legal = await page.locator('[data-site-footer] [data-legal]').innerText();
    expect(legal.replace(/\s+/g, ' '), `${path} legal line`).toContain(LEGAL);
    const html = await page.content();
    expect(html, `${path} Motor Claims Department`).not.toMatch(/Motor Claims Department/i);
    expect(html, `${path} placeholders`).not.toMatch(/\[00000000\]|\[address\]/);
  }
});

test('the third-party page is laid out to the design: hero with the grid, strip, FAQ, the "Their insurer" band, six steps, independence line', async ({ page }) => {
  await page.goto('/third-party-insurance-claim/');
  await expect(page.locator('h1')).toHaveText('Third party insurance claim?');
  await expect(page.locator('h1 .hl')).toHaveText('Third party');
  await expect(page.locator('[data-hero] h2')).toHaveText('Claim from their insurer, not yours.');
  const order = await page.locator('main > *').evaluateAll((els) => els.map((e) => e.getAttribute('data-hero') !== null ? 'hero' : e.getAttribute('data-claims-strip') !== null ? 'strip' : e.getAttribute('data-faq') !== null ? 'faq' : e.getAttribute('data-band') !== null ? 'band' : e.getAttribute('data-steps') !== null ? 'steps' : e.getAttribute('data-independence') !== null ? 'independence' : 'other'));
  expect(order.filter((o) => o !== 'other')).toEqual(['hero', 'strip', 'faq', 'band', 'steps', 'independence']);
  await expect(page.locator('[data-band]')).toContainText('Their insurer has a claims department.');
  await expect(page.locator('[data-band]')).toContainText('It works for them.');
  await expect(page.locator('[data-steps] li')).toHaveCount(6);
  await expect(page.locator('[data-faq] details')).toHaveCount(7);
  await expect(page.locator('[data-faq] details').first()).toHaveAttribute('open', '');
  // The FAQ's closed answers are not in innerText; the Motor Insurers' Bureau is the one permitted "Motor".
  const text = (await page.locator('main').textContent()) ?? '';
  expect(text).toContain('Motor Insurers’ Bureau');
  if (isMobile(page)) {
    const vh = page.viewportSize()!.height;
    const strip = (await page.locator('[data-claims-strip]').boundingBox())!;
    expect(Math.round(strip.y + strip.height)).toBe(vh);
    const online = (await page.locator('[data-hero] [data-cta="start-online"]').boundingBox())!;
    expect(online.y + online.height).toBeLessThanOrEqual(strip.y + 0.5);
  }
});
