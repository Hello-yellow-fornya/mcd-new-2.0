import { test, expect, type Page } from '@playwright/test';
import { onlySite } from './lib/site';

onlySite('mcd2');

// The homepage (CLAUDE.md §0): section order, and the fold-locked mobile hero
// where the ClaimsStrip's bottom edge lands exactly on the fold at 390×844 and
// 430×932 (the two mobile projects in playwright.config.ts).

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) <= 820;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
});

test('one H1 with the bar under "Non-fault", the H2 with the bar under "smarter way"', async ({ page }) => {
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText('Non-fault accident?');
  await expect(page.locator('h1 .hl')).toHaveText('Non-fault');
  const h2 = page.locator('[data-hero] h2');
  await expect(h2).toHaveText('Choose the smarter way to claim.');
  await expect(h2.locator('.hl')).toHaveText('smarter way');
  await expect(h2.locator('.hl')).toHaveCSS('text-decoration-color', 'rgb(243, 205, 62)');
});

test('sections run in the §0 order', async ({ page }) => {
  const order = ['[data-hero]', '[data-claims-strip]', '[data-review-band]', '[data-band]', '[data-them-us]', '[data-independence]', '[data-benefits]', '[data-steps]', '[data-faq]', '[data-site-footer]'];
  let last = -1;
  for (const sel of order) {
    const box = await page.locator(sel).boundingBox();
    expect(box, sel).not.toBeNull();
    expect(box!.y, `${sel} comes after the previous section`).toBeGreaterThan(last);
    last = box!.y;
  }
});

test('mobile: the hero is fold-locked and the ClaimsStrip ends on the fold', async ({ page }) => {
  test.skip(!isMobile(page), 'mobile only');
  const vh = page.viewportSize()!.height;
  const header = await page.locator('[data-site-header]').boundingBox();
  const hero = await page.locator('[data-hero]').boundingBox();
  const strip = await page.locator('[data-claims-strip]').boundingBox();
  expect(Math.round(header!.height)).toBe(64);
  expect(Math.round(strip!.height)).toBe(52);
  // Everything in the hero sits above the strip, and the strip's bottom edge is the fold.
  for (const sel of ['h1', 'h2', '[data-proof-grid]', 'a[data-cta="call"]:visible', 'a[data-cta="start-online"]']) {
    const box = await page.locator(`[data-hero] ${sel}`).first().boundingBox();
    expect(box!.y + box!.height, `${sel} above the strip`).toBeLessThanOrEqual(strip!.y + 0.5);
  }
  expect(strip!.y + strip!.height, 'strip bottom edge on the fold').toBeCloseTo(vh, 0);
  expect(hero!.y + hero!.height).toBeCloseTo(strip!.y, 0);
});

test('mobile: the grid takes the one flexible gap; the rest of the hero keeps fixed gaps', async ({ page }) => {
  test.skip(!isMobile(page), 'mobile only');
  const grid = page.locator('[data-hero] [data-proof-grid]');
  await expect(grid).toHaveCSS('margin-top', /^\d+(\.\d+)?px$/);
  const mt = parseFloat(await grid.evaluate((el) => getComputedStyle(el).marginTop));
  expect(mt).toBeGreaterThan(0);
  const call = await page.locator('[data-hero] a[data-cta="call"]:visible').boundingBox();
  const online = await page.locator('[data-hero] a[data-cta="start-online"]').boundingBox();
  expect(Math.round(call!.height)).toBe(56);
  expect(online!.y).toBeGreaterThan(call!.y + call!.height);
});

test('desktop: two-column hero with the proof grid to the right of the copy', async ({ page }) => {
  test.skip(isMobile(page), 'desktop only');
  const h1 = await page.locator('h1').boundingBox();
  const grid = await page.locator('[data-hero] [data-proof-grid]').boundingBox();
  expect(grid!.x).toBeGreaterThan(h1!.x + h1!.width - 1);
  await expect(page.locator('[data-hero] a[data-cta="start"]').first()).toBeVisible();
  await expect(page.locator('[data-hero] a[data-cta="start-online"]')).toBeHidden();
});

test('head: title, canonical, Organization and WebSite schema; the FAQ schema matches the visible FAQ', async ({ page }) => {
  await expect(page).toHaveTitle(/Claims 24\/7/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://mcd-new-2-0.vercel.app/');
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const types = blocks.flatMap((b) => {
    const j = JSON.parse(b);
    return (Array.isArray(j) ? j : [j]).map((x) => x['@type']);
  });
  expect(types).toEqual(expect.arrayContaining(['Organization', 'WebSite', 'FAQPage']));
  const faq = blocks.map((b) => JSON.parse(b)).flat().find((x) => x['@type'] === 'FAQPage');
  const questions = await page.locator('[data-faq] summary').allTextContents();
  expect(faq.mainEntity.map((q: { name: string }) => q.name)).toEqual(questions);
});

test('the 404 is branded', async ({ page }) => {
  const res = await page.goto('/nothing-here/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('That page isn’t here.');
  await expect(page.locator('[data-site-header]')).toBeVisible();
  await expect(page.locator('[data-site-footer]')).toBeVisible();
});

test('desktop: page-specific JS is at most 15 kB above Next’s runtime', async ({ page }) => {
  test.skip(isMobile(page), 'measured once, on desktop');
  const scripts = async (path: string) => {
    await page.goto(path);
    return page.evaluate(() =>
      Object.fromEntries(
        (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
          .filter((r) => new URL(r.name).pathname.endsWith('.js'))
          .map((r) => [new URL(r.name).pathname, r.encodedBodySize]),
      ),
    );
  };
  const home = await scripts('/');
  const other = await scripts('/nothing-here/');
  // Next's runtime: the scripts every page loads. The budget is what the homepage adds on top.
  const runtime = Object.keys(home).filter((k) => k in other);
  const extra = Object.entries(home)
    .filter(([k]) => !runtime.includes(k))
    .reduce((sum, [, size]) => sum + size, 0);
  expect(runtime.length).toBeGreaterThan(0);
  expect(extra, `homepage-only JS: ${(extra / 1024).toFixed(1)} kB`).toBeLessThanOrEqual(15 * 1024);
});
