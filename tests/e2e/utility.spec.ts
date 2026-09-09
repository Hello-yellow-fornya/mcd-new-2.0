import { test, expect } from '@playwright/test';
import { SITE, SITE_URL } from './lib/site';

// About, contact and the legal set from content/utility/*.mdx.
const name = SITE === 'ocr' ? 'Claims Report Line' : 'Claims 24/7';
const pages = [
  ['/about-us/', `About ${name}`],
  ['/contact-us/', 'Contact us'],
  ['/privacy-policy/', 'Privacy policy'],
  ['/terms/', 'Terms of business'],
  ['/complaints/', 'Complaints'],
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

test('terms carries the catch wording from the FAQ', async ({ page }) => {
  await page.goto('/terms/');
  const callout = page.locator('[data-variant="catch"]');
  await expect(callout).toContainText('The catch');
  await expect(callout).toContainText('We recover our costs from the at-fault driver’s insurer');
});
