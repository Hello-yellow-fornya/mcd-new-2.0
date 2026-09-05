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
  expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`);
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
