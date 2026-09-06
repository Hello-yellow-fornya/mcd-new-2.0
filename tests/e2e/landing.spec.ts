import { test, expect, type Page } from '@playwright/test';

// The insurer landing page (CLAUDE.md §0, appendix §6): noindex, off the
// sitemap, canonical to self, the insurer name only in the H1 and the
// independence line, the independence line directly under the hero, and the
// same fold lock as the homepage on mobile.

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) <= 820;
const PATH = '/claim/goskippy/';

test('noindex header and meta, canonical to self, off the sitemap, disallowed in robots on a live host', async ({ page, request }) => {
  const res = await page.goto(PATH);
  expect(res?.status()).toBe(200);
  expect(res?.headers()['x-robots-tag']).toContain('noindex');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://mcd-new-2-0.vercel.app${PATH}`);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('/claim/');
});

test('the insurer is named only in the H1 and the independence line', async ({ page }) => {
  await page.goto(PATH);
  await expect(page.locator('h1')).toHaveText('Insured with GoSkippy?');
  await expect(page.locator('h1 .hl')).toHaveText('GoSkippy?');
  const line = page.locator('[data-independence]');
  await expect(line).toContainText('Not GoSkippy, not an insurer');
  const text = await page.locator('main').innerText();
  expect(text.match(/GoSkippy/g)?.length).toBe(2);
  const head = await page.locator('[data-site-header]').innerText();
  const foot = await page.locator('[data-site-footer]').innerText();
  expect(head + foot).not.toContain('GoSkippy');
});

test('the independence line sits directly under the hero and strip; the H2 has no highlight', async ({ page }) => {
  await page.goto(PATH);
  const strip = await page.locator('[data-claims-strip]').boundingBox();
  const line = await page.locator('[data-independence]').boundingBox();
  expect(Math.round(line!.y)).toBe(Math.round(strip!.y + strip!.height));
  await expect(page.locator('[data-hero] h2')).toHaveText('Call us before you call your insurer.');
  await expect(page.locator('[data-hero] h2 .hl')).toHaveCount(0);
});

test('mobile: the fold lock holds with the sub line, and Call now is the primary CTA', async ({ page }) => {
  test.skip(!isMobile(page), 'mobile only');
  await page.goto(PATH);
  await page.evaluate(() => document.fonts.ready);
  const vh = page.viewportSize()!.height;
  const strip = await page.locator('[data-claims-strip]').boundingBox();
  expect(strip!.y + strip!.height, 'strip bottom edge on the fold').toBeCloseTo(vh, 0);
  const sub = page.locator('[data-hero] p').first();
  await expect(sub).toHaveText('The smarter way to claim for no-fault accidents.');
  const call = page.locator('[data-hero] a[data-cta="call"]:visible');
  await expect(call).toHaveText(/call now/);
  const online = await page.locator('[data-hero] a[data-cta="start-online"]').boundingBox();
  expect(online!.y + online!.height).toBeLessThanOrEqual(strip!.y + 0.5);
});

test('desktop: no sub line, the CTA pair and wait row as on the homepage', async ({ page }) => {
  test.skip(isMobile(page), 'desktop only');
  await page.goto(PATH);
  await expect(page.locator('[data-hero] p').first()).toBeHidden();
  await expect(page.locator('[data-hero] a[data-cta="start"]').first()).toBeVisible();
});

test('an unknown insurer slug is a 404', async ({ page }) => {
  const res = await page.goto('/claim/nobody/');
  expect(res?.status()).toBe(404);
});
