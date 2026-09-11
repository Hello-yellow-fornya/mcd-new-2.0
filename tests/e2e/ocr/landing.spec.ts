import { test, expect, type Page } from '@playwright/test';
import { onlySite, SITE_URL } from '../lib/site';

// The GoSkippy landing page (design/ocr/ocr-goskippy-mobile.html; desktop
// derived): noindex, canonical to self, the insurer name only in the H1 and
// the independence line, the fold lock above the ticker, four equal-height
// proof cards, option A in place of the banned band, and the site's copy rules.
onlySite('ocr');

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) <= 820;
const PATH = '/claim/goskippy/';

test('noindex, canonical to self, the insurer only in the H1 and the independence line', async ({ page }) => {
  const res = await page.goto(PATH);
  expect(res?.status()).toBe(200);
  expect(res?.headers()['x-robots-tag']).toContain('noindex');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE_URL}${PATH}`);
  await expect(page.locator('h1')).toHaveText('Insured with GoSkippy?');
  await expect(page.locator('h1 .hl')).toHaveText('GoSkippy?');
  await expect(page.locator('[data-independence]')).toContainText('Not GoSkippy, not an insurer');
  const text = await page.locator('main').innerText();
  expect(text.split('GoSkippy').length - 1).toBe(2);
  expect(text).not.toMatch(/Your insurer has a claims department/i);
  await expect(page.locator('[data-band]')).toContainText('Managed directly with the at-fault insurer.');
  await expect(page.locator('[data-band] mark')).toHaveCSS('background-image', 'linear-gradient(rgba(0, 0, 0, 0) 55%, rgba(221, 245, 235, 0.22) 55%)');
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
});

test('mobile: the hero is fold-locked above the 52px ticker, the four proof cards are equal, the online report is green and the call is mint', async ({ page }) => {
  test.skip(!isMobile(page), 'mobile projects only');
  await page.goto(PATH);
  await page.evaluate(() => document.fonts.ready);
  const vh = page.viewportSize()!.height;
  const hero = (await page.locator('[data-hero]').boundingBox())!;
  const ticker = (await page.locator('[data-ticker]').boundingBox())!;
  expect(Math.round(hero.y)).toBe(64);
  expect(Math.round(ticker.height)).toBe(52);
  expect(Math.round(ticker.y + ticker.height)).toBe(vh);
  const cards = await page.locator('[data-proof-grid] li').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
  expect(cards).toHaveLength(4);
  expect(new Set(cards).size).toBe(1);
  const start = page.locator('[data-hero-cta] [data-cta="start"]');
  await expect(start).toHaveText(/Report your accident/);
  await expect(start).toHaveCSS('background-color', 'rgb(24, 172, 126)');
  await expect(page.locator('[data-hero-cta] [data-cta="call"]')).toHaveCSS('background-color', 'rgb(221, 245, 235)');
});

test('desktop: the report form sits beside the copy and posts with the landing placement', async ({ page }) => {
  test.skip(isMobile(page), 'desktop only');
  await page.goto(PATH);
  const form = page.locator('form[data-testid="report-form"]');
  await expect(form).toBeVisible();
  await expect(form).toHaveAttribute('data-placement', 'landing-goskippy');
  const f = (await form.boundingBox())!;
  const h1 = (await page.locator('h1').boundingBox())!;
  expect(f.x).toBeGreaterThan(h1.x + h1.width - 20);
});

test('every benefit on the page is conditioned on the same line', async ({ page }) => {
  await page.goto(PATH);
  const lines = await page.locator('[data-proof-grid] li, [data-ticker] span, [data-them-us] [role="cell"]').evaluateAll((els) => els.map((e) => (e as HTMLElement).innerText.replace(/\s+/g, ' ')));
  for (const line of lines) {
    if (/no excess|like[- ]for[- ]like|no[- ]claims/i.test(line) && !/takes the hit/.test(line)) {
      expect(line, line).toMatch(/not your fault|non-fault|if it was/i);
    }
  }
});
