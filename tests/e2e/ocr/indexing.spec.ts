import { test, expect } from '@playwright/test';
import { onlySite, SITE_URL } from '../lib/site';

// Indexing exactly as Claims 24/7: every page noindex, nofollow (header,
// meta, robots.txt), no sitemap, canonicals to this site's own URL, no links
// to the 1.0 domain. Plus this brand's type, tokens and icon set.
onlySite('ocr');

test('Inter only, four weights, self-hosted; the wordmark and headings in Inter Black', async ({ page }) => {
  const fontRequests: string[] = [];
  page.on('request', (r) => {
    if (r.resourceType() === 'font') fontRequests.push(r.url());
  });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() => Array.from(document.fonts).filter((f) => f.status === 'loaded').map((f) => `${f.weight} ${f.family}`));
  expect(new Set(loaded.map((f) => f.split(' ').slice(1).join(' '))).size).toBe(1);
  expect(new Set(loaded.map((f) => f.split(' ')[0]))).toEqual(new Set(['400', '600', '700', '900']));
  for (const url of fontRequests) expect(url).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
  expect(fontRequests.length).toBeGreaterThan(0);
  await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(4);
  expect(await page.locator('h1').evaluate((e) => getComputedStyle(e).fontWeight)).toBe('900');
});

test('the tokens are on :root, pink is defined and used nowhere, green text only in big print', async ({ page }) => {
  await page.goto('/');
  const tokens = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    return Object.fromEntries(['--navy', '--navy-700', '--green', '--mint', '--ink-body', '--slate', '--paper', '--white', '--hairline', '--pink'].map((t) => [t, s.getPropertyValue(t).trim()]));
  });
  expect(tokens).toEqual({ '--navy': '#0e2a47', '--navy-700': '#163a60', '--green': '#18ac7e', '--mint': '#ddf5eb', '--ink-body': '#181f23', '--slate': '#5b6770', '--paper': '#f4f6f5', '--white': '#ffffff', '--hairline': '#e1e6ea', '--pink': '#f69bd1' });
  const css = await page.evaluate(async () => {
    const hrefs = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map((l) => l.href);
    return (await Promise.all(hrefs.map((h) => fetch(h).then((r) => r.text())))).join('\n');
  });
  expect(css).not.toMatch(/var\(--pink\)/);
  expect((css.match(/f69bd1/gi) ?? []).length).toBe(1);
  // Green text: only the wordmark's "Online" (20px+), the footer's number and headings, the FAQ plus; never body copy.
  const smallGreen = await page.evaluate(() =>
    Array.from(document.querySelectorAll('p, li, span, a, small'))
      .filter((e) => getComputedStyle(e).color === 'rgb(24, 172, 126)' && parseFloat(getComputedStyle(e).fontSize) < 14 && (e as HTMLElement).innerText.trim())
      .map((e) => (e as HTMLElement).innerText.trim()),
  );
  expect(smallGreen).toEqual([]);
});

test('icons and the Open Graph image are this brand’s', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="icon"][href$="favicon.ico"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"][href*="icon.svg"]')).toHaveCount(1);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', /apple-icon\.png/);
  const svg = await (await request.get('/icon.svg')).text();
  expect(svg).toContain('#0E2A47');
  expect(svg).not.toContain('247');
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.name).toBe('Claims Report Line');
  expect(manifest.theme_color).toBe('#0E2A47');
  for (const path of ['/favicon.ico', '/apple-icon.png', '/favicons/favicon.svg', ...[16, 32, 48, 180, 192, 512, 1024].map((s) => `/favicons/favicon-${s}.png`)]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  const img = await request.get(new URL(og!).pathname);
  expect(img.status()).toBe(200);
  expect(img.headers()['content-type']).toContain('image/png');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE_URL}/`);
});

test('the legal line names the entity as a placeholder and carries no FCA line', async ({ page }) => {
  await page.goto('/');
  const legal = page.locator('[data-site-footer] p').last();
  await expect(legal).toContainText('Motor Claims Department Ltd, trading as Claims Report Line');
  await expect(legal).not.toContainText('FCA');
  await expect(legal).toContainText('[00000000]');
});
