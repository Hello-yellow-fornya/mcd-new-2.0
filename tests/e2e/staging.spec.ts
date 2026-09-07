import { test, expect } from '@playwright/test';

// The build under test has NEXT_PUBLIC_SITE_URL set to the project's own
// .vercel.app address (playwright.config.ts), so every deployment is staging
// (CLAUDE.md §0): noindex header, noindex meta, disallow-all robots, canonicals
// on the .vercel.app URL.
const SITE = 'https://mcd-new-2-0.vercel.app';
const SITE_HOST = new URL(SITE).host;

test('every route carries X-Robots-Tag noindex, whatever the host', async ({ request }) => {
  for (const path of ['/', '/does-not-exist/']) {
    const res = await request.get(path);
    expect(res.headers()['x-robots-tag'], path).toBe('noindex, nofollow');
  }
  // Even a request that claims the configured host is staging while that host is .vercel.app.
  const claimed = await request.get('/', { headers: { host: SITE_HOST } });
  expect(claimed.headers()['x-robots-tag']).toBe('noindex, nofollow');
});

test('robots.txt disallows everything and names the sitemap on the site URL', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /');
  expect(robots).not.toContain('Allow: /');
  expect(robots).toMatch(new RegExp(`^Sitemap: ${SITE}/sitemap\\.xml$`, 'm'));
  const withHost = await (await request.get('/robots.txt', { headers: { host: SITE_HOST } })).text();
  expect(withHost).toContain('Disallow: /');
});

test('head has a static noindex meta and a canonical on the site URL', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}/`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
});

test('sitemap lists the homepage on the site URL and no /claim/ routes', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).toContain(`<loc>${SITE}/</loc>`);
  expect(xml).not.toContain('/claim/');
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
  // The favicon set from design/logo/favicons, 16 to 1024, plus the social avatar
  for (const path of ['/icon.svg', '/apple-icon.png', '/favicons/favicon.svg', ...[16, 32, 48, 64, 96, 128, 180, 192, 256, 384, 512, 1024].map((s) => `/favicons/favicon-${s}.png`), '/logo/square/claims247-stacked-yellow.png', '/logo/claims247-logo-on-cream.svg']) {
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
