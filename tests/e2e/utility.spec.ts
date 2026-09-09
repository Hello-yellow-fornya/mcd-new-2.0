import { test, expect } from '@playwright/test';
import { SITE, SITE_URL } from './lib/site';

// About, contact and the legal set from content/utility/*.mdx.
const name = SITE === 'ocr' ? 'Claims Report Line' : 'Claims 24/7';
const pages = [
  ['/about-us/', `About ${name}`],
  ['/contact-us/', 'Contact us'],
  ['/privacy-policy/', 'Privacy policy'],
  ['/terms/', SITE === 'ocr' ? 'Terms of business' : 'Terms and conditions'],
  ...(SITE === 'ocr' ? ([['/complaints/', 'Complaints']] as const) : []),
  ['/cookies/', 'Cookies'],
] as const;

for (const [path, h1] of pages) {
  test(`${path}: builds with one H1, an H2, ids on the section headings, canonical`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText(h1);
    await expect(page.locator('[data-hero] h2')).toBeVisible();
    const ids = await page.locator('main h2[id]').evaluateAll((els) => els.map((e) => e.id));
    expect(ids.length).toBeGreaterThan(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE_URL}${path}`);
    await expect(page.locator('[data-site-header]')).toBeVisible();
    await expect(page.locator('[data-site-footer]')).toBeVisible();
  });
}

test('the legal and informational pages carry no claim CTA, and terms does not talk about "the catch"', async ({ page }) => {
  test.skip(SITE === 'ocr', 'the Claims 24/7 utility set');
  for (const path of ['/about-us/', '/contact-us/', '/privacy-policy/', '/terms/', '/cookies/']) {
    await page.goto(path);
    await expect(page.locator('main [data-cta="start"]'), `${path} start CTA`).toHaveCount(0);
    await expect(page.locator('main [data-band]'), `${path} closing band`).toHaveCount(0);
  }
  await page.goto('/terms/');
  await expect(page.locator('[data-variant="catch"]')).toHaveCount(0);
  expect(await page.locator('main').innerText()).not.toMatch(/the catch/i);
});

test('there is no complaints page on Claims 24/7, and the footer does not link to one', async ({ page }) => {
  test.skip(SITE === 'ocr', 'OCR keeps its complaints page');
  const res = await page.goto('/complaints/');
  expect(res?.status()).toBe(404);
  await page.goto('/');
  await expect(page.locator('[data-site-footer] a[href="/complaints/"]')).toHaveCount(0);
});
