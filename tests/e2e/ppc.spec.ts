import { test, expect, type Page } from '@playwright/test';
import { getLivePages } from '../../src/lib/content/index.ts';
import { onlySite } from './lib/site';

/**
 * The paid landing page, /ppc/third-party-claim/ (design/claims247-third-party-insurance-claim.html
 * and -mobile.html). It is the only paid page on this site.
 *
 * The landing-page rules it has to keep: fold-locked on mobile with the strip
 * ending exactly on the fold, everything above 720 on desktop, nothing linking
 * in from the nav, the footer or another page, noindex and nofollow, and the
 * campaign the visitor arrived with reaching the intake endpoint.
 */
onlySite('mcd2');

const PPC = '/ppc/third-party-claim/';
const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) <= 999;

test(`${PPC}: the strip ends on the fold with the online pill clear of it, and nothing scrolls sideways`, async ({ page }) => {
  test.skip(!isMobile(page), 'the fold rule is the mobile layout');
  await page.goto(PPC);
  await page.evaluate(() => document.querySelector('[data-testid="consent-banner"]')?.remove());
  const vh = page.viewportSize()!.height;
  const strip = (await page.locator('[data-claims-strip]').boundingBox())!;
  expect(Math.round(strip.y + strip.height), 'strip bottom on the fold').toBe(vh);
  const online = (await page.locator('[data-cta="start-online"]').boundingBox())!;
  expect(strip.y - (online.y + online.height), 'clearance between the online pill and the strip').toBeGreaterThanOrEqual(12);
  const { scrollW, clientW } = await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth }));
  expect(scrollW, 'no horizontal scroll').toBeLessThanOrEqual(clientW);
});

test(`${PPC}: on desktop the hero is two columns and its CTAs sit inside 1280x720`, async ({ page }) => {
  test.skip(isMobile(page), 'the desktop layout');
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(PPC);
  await page.evaluate(() => document.querySelector('[data-testid="consent-banner"]')?.remove());
  await expect(page.locator('[data-hero] > div')).toHaveCSS('display', 'grid');
  for (const cta of ['call', 'start-online']) {
    const box = (await page.locator(`[data-hero] [data-cta="${cta}"]`).boundingBox())!;
    expect(box.y + box.height, `${cta} inside the fold`).toBeLessThanOrEqual(720);
  }
});

test(`${PPC}: the mobile layout runs below 1000px, and the organic page keeps its own breakpoint`, async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'one browser is enough to check both widths');
  for (const [width, ppc, organic] of [
    [999, 'flex', 'grid'],
    [1000, 'grid', 'grid'],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(PPC);
    await expect(page.locator('[data-hero] > div'), `ppc at ${width}`).toHaveCSS('display', ppc);
    await page.goto('/third-party-insurance-claim/');
    await expect(page.locator('[data-hero] > div'), `organic at ${width}`).toHaveCSS('display', organic);
  }
});

test(`${PPC}: the four proof cards are equal height, the accordion is seven with the first open, and there are six steps`, async ({ page }) => {
  await page.goto(PPC);
  const heights = await page.locator('[data-proof-grid] li').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
  expect(heights).toHaveLength(4);
  expect(new Set(heights).size, `card heights ${heights.join(', ')}`).toBe(1);
  await expect(page.locator('[data-faq] details')).toHaveCount(7);
  await expect(page.locator('[data-faq] details').first()).toHaveAttribute('open', '');
  await expect(page.locator('[data-steps] li')).toHaveCount(6);
  // The band names their claims department; the independence line closes the page.
  await expect(page.locator('[data-band]')).toContainText('Their insurer has a claims department.');
  await expect(page.locator('[data-independence]')).toBeVisible();
});

test(`${PPC}: is noindex, nofollow and nothing on the site links to it`, async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'one visit per route is enough');
  test.setTimeout(240_000);
  await page.goto(PPC);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /nofollow/);
  // robots.txt disallows it, and there is no sitemap for it to appear in.
  const robots = await (await page.request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /');
  expect(robots).not.toContain(PPC);
  expect((await page.request.get('/sitemap.xml')).status(), 'no sitemap').toBe(404);
  // No page links in: not the nav, not the footer, not a related block.
  for (const path of ['/', '/claim-now/', '/third-party-insurance-claim/', ...getLivePages().map((p) => p.frontmatter.slug)]) {
    if (path === PPC) continue;
    await page.goto(path);
    await expect(page.locator(`a[href^="/ppc/"]`), `${path} links to the paid page`).toHaveCount(0);
  }
});

test(`${PPC}: the UTM set and the gclid reach the intake endpoint with the claim`, async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'one submission: /api/claim-start/ rate-limits per address');
  await page.goto(`${PPC}?gclid=TESTGCLID123&utm_source=google&utm_medium=cpc&utm_campaign=tpc-brand&utm_term=third+party+claim`);
  // The claim is submitted from /claim-now/, a page later: the campaign has to survive the navigation.
  await page.locator('[data-cta="start-online"]').click();
  await page.waitForURL('**/claim-now/**');
  const posted = page.waitForRequest((r) => r.url().includes('/api/claim-start/') && r.method() === 'POST');
  const answered = page.waitForResponse((r) => r.url().includes('/api/claim-start/'));
  await page.locator('[data-testid="regbox"] input').fill('AB12CDE');
  await page.locator('[data-testid="regbox"] button[type="submit"]').click();
  const body = JSON.parse((await posted).postData() ?? '{}') as { campaign?: Record<string, string> };
  expect(body.campaign).toMatchObject({
    gclid: 'TESTGCLID123',
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'tpc-brand',
    utm_term: 'third party claim',
    landing: PPC,
  });
  // And the server keeps it: the stub echoes what it would forward to the claims API.
  const res = (await (await answered).json()) as { ok: boolean; campaign?: Record<string, string> };
  expect(res.ok).toBe(true);
  expect(res.campaign?.gclid).toBe('TESTGCLID123');
});
