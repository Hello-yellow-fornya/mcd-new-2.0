import { test, expect } from '@playwright/test';

import { getLivePages } from '../../src/lib/content/index.ts';

// Claims 24/7 is a PPC-only site and must not compete with the 1.0 site,
// which carries the same copy: every page is noindex, nofollow (header, meta,
// disallow-all robots.txt), there is no sitemap, canonicals point to this
// site's own URL (NEXT_PUBLIC_SITE_URL, playwright.config.ts) and nothing
// links to the 1.0 domain.
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://mcd-new-2-0.vercel.app';
const SITE_HOST = new URL(SITE).host;
const OLD_DOMAIN = 'motorclaimsdepartment.co.uk';

/** Every route the site serves: content pages, the homepage, claim-now, the landing pages, the styleguide, and a 404. */
const everyRoute = ['/', '/claim-now/', '/claim-now/thank-you/', '/claim/goskippy/', '/styleguide/', '/does-not-exist/', ...getLivePages().map((p) => p.frontmatter.slug)];

test('no page on the site is indexable, and no page links to the 1.0 domain', async ({ request }) => {
  test.setTimeout(120_000);
  expect(everyRoute.length).toBeGreaterThan(20);
  for (const path of everyRoute) {
    const res = await request.get(path);
    expect(res.headers()['x-robots-tag'], `${path} header`).toBe('noindex, nofollow');
    const html = await res.text();
    expect(html, `${path} meta`).toMatch(/<meta name="robots" content="noindex(, ?nofollow)?"/);
    expect(html, `${path} links to the 1.0 domain`).not.toContain(OLD_DOMAIN);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    if (res.status() === 200 && path !== '/styleguide/') {
      expect(canonical, `${path} canonical`).toBe(`${SITE}${path}`);
      expect(new URL(canonical!).host).toBe(SITE_HOST);
    }
  }
  // Even a request that claims the configured host is noindex.
  const claimed = await request.get('/', { headers: { host: SITE_HOST } });
  expect(claimed.headers()['x-robots-tag']).toBe('noindex, nofollow');
});

test('robots.txt disallows everything and names no sitemap; there is no sitemap.xml', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /');
  expect(robots).not.toContain('Allow: /');
  expect(robots).not.toMatch(/sitemap/i);
  expect((await request.get('/sitemap.xml')).status()).toBe(404);
});

test('head has a static noindex meta and a canonical on the site URL', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}/`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
});

test('fonts are self-hosted: Archivo Black 400 and Archivo 400/700, nothing from Google', async ({ page }) => {
  const fontRequests: string[] = [];
  page.on('request', (r) => {
    if (r.resourceType() === 'font') fontRequests.push(r.url());
  });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() =>
    Array.from(document.fonts).filter((f) => f.status === 'loaded').map((f) => `${f.weight} ${f.family}`),
  );
  // Two families (display and body); the body family carries 400 and 700.
  expect(new Set(loaded.map((f) => f.split(' ').slice(1).join(' '))).size).toBe(2);
  expect(loaded.filter((f) => f.startsWith('400 ')).length).toBe(2);
  expect(loaded.some((f) => f.startsWith('700 '))).toBe(true);
  expect(fontRequests.length).toBeGreaterThan(0);
  for (const url of fontRequests) expect(url).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
  await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(3);
});

test('the tokens are on :root and the highlight is a bar, not a box', async ({ page }) => {
  await page.goto('/');
  const tokens = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    return ['--ink', '--yellow', '--cream', '--pale', '--ochre', '--muted', '--line', '--green'].map((t) => s.getPropertyValue(t).trim());
  });
  expect(tokens).toEqual(['#19180f', '#f3cd3e', '#f7f5ef', '#fbf0bf', '#b08900', '#54524a', '#e6e2d6', '#7dc24a']);
  const hl = page.locator('h1 .hl');
  await expect(hl).toHaveCSS('text-decoration-color', 'rgb(243, 205, 62)');
  await expect(hl).toHaveCSS('text-decoration-skip-ink', 'none');
  await expect(hl).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test('skip link is the first focusable element and targets main', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.locator('a.skip');
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute('href', '#main');
  await expect(page.locator('main#main')).toHaveCount(1);
});

test('icons, manifest and the Open Graph image are served', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute('href', /icon\.svg/);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', /apple-icon\.png/);
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(og).toMatch(/opengraph-image/);
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.icons.map((i: { sizes: string }) => i.sizes)).toEqual(['192x192', '512x512', '1024x1024']);
  expect(manifest.name).toBe('Claims 24/7');
  // The favicon set as delivered in design/logo/favicons (16 to 1024, the "247" tiles at 16 and 32, favicon.ico), the social avatar, and an outlined lockup and square
  for (const path of ['/icon.svg', '/favicon.ico', '/apple-icon.png', '/favicons/favicon.svg', '/favicons/favicon-16.svg', ...[16, 32, 48, 180, 192, 512, 1024].map((s) => `/favicons/favicon-${s}.png`), '/favicons/favicon-16-numerals.png', '/favicons/favicon-32-numerals.png', '/logo/square/claims247-square-stacked-on-yellow.png', '/logo/square/claims247-square-stacked-on-yellow.svg', '/logo/claims247-logo-on-cream.svg']) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
  const img = await request.get(new URL(og!).pathname);
  expect(img.status()).toBe(200);
  expect(img.headers()['content-type']).toContain('image/png');
});

test('accessibility basics the audit checks: heading order holds and the eyebrow colour passes AA', async ({ page }) => {
  await page.goto('/about-us/');
  const levels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])));
  for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading ${i}`).toBeLessThanOrEqual(1);
  await expect(page.locator('[data-hero] p').first()).toHaveCSS('color', 'rgb(133, 103, 0)');
});
