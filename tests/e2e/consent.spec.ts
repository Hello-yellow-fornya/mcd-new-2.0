import { test, expect, type Page } from '@playwright/test';
import { SITE } from './lib/site';

// Tracking and consent (CLAUDE.md §0, appendix §8): nothing loads before
// consent; accepting injects 2.0's own GTM container; declining loads
// nothing; legal pages carry page views only.

const GTM = /googletagmanager\.com/;

async function blockGtm(page: Page): Promise<string[]> {
  const hits: string[] = [];
  await page.route(GTM, (route) => {
    hits.push(route.request().url());
    route.abort();
  });
  return hits;
}

const layer = (page: Page) => page.evaluate(() => (window as unknown as { dataLayer: unknown[] }).dataLayer);

test('nothing from Google loads before a choice; defaults are all denied', async ({ page }) => {
  const hits = await blockGtm(page);
  await page.goto('/');
  await expect(page.getByTestId('consent-banner')).toBeVisible();
  const dl = await layer(page);
  const defaults = dl.find((e) => Array.isArray(e) && e[0] === 'consent' && e[1] === 'default') as unknown[] | undefined;
  expect(defaults).toBeTruthy();
  expect(defaults![2]).toMatchObject({ analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  expect(dl.some((e) => (e as { event?: string }).event === 'page_view')).toBe(true);
  expect(hits).toHaveLength(0);
  expect(await page.locator('script[data-gtm]').count()).toBe(0);
});

test('accepting stores the choice, pushes the update and injects the 2.0 container', async ({ page, context }) => {
  const hits = await blockGtm(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Yes, measure visits' }).click();
  await expect(page.getByTestId('consent-banner')).toBeHidden();
  await expect(page.locator('script[data-gtm="GTM-TEST0000"]')).toHaveCount(1);
  expect(hits.some((u) => u.includes('id=GTM-TEST0000'))).toBe(true);
  const cookie = (await context.cookies()).find((c) => c.name === 'mcd2_consent');
  expect(cookie).toBeTruthy();
  expect(JSON.parse(decodeURIComponent(cookie!.value))).toMatchObject({ analytics: 'granted', ads: 'granted' });
  const dl = await layer(page);
  const update = dl.find((e) => Array.isArray(e) && e[0] === 'consent' && e[1] === 'update') as unknown[];
  expect(update[2]).toMatchObject({ analytics_storage: 'granted', ad_storage: 'granted' });
  // A later visit loads GTM straight away.
  await page.goto(SITE === 'ocr' ? '/report/' : '/claim-now/');
  await expect(page.locator('script[data-gtm]')).toHaveCount(1);
  await expect(page.getByTestId('consent-banner')).toBeHidden();
});

test('declining stores the choice and loads nothing, now or on later pages', async ({ page, context }) => {
  const hits = await blockGtm(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'No, just the essentials' }).click();
  await expect(page.getByTestId('consent-banner')).toBeHidden();
  const cookie = (await context.cookies()).find((c) => c.name === 'mcd2_consent');
  expect(JSON.parse(decodeURIComponent(cookie!.value))).toMatchObject({ analytics: 'denied', ads: 'denied' });
  await page.goto('/about-us/');
  expect(hits).toHaveLength(0);
  expect(await page.locator('script[data-gtm]').count()).toBe(0);
  const names = (await context.cookies()).map((c) => c.name);
  expect(names).toEqual(['mcd2_consent']);
});

test('"Cookie settings" in the footer reopens the banner', async ({ page }) => {
  await blockGtm(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'No, just the essentials' }).click();
  await page.getByRole('button', { name: 'Cookie settings' }).click();
  await expect(page.getByTestId('consent-banner')).toBeVisible();
});

test('tel: clicks push phone_click with a placement, except on legal pages', async ({ page }) => {
  await blockGtm(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'No, just the essentials' }).click();
  await page.evaluate(() => document.querySelectorAll('a[href^="tel:"]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault())));
  const closing = SITE === 'ocr' ? ['[data-final-cta]', 'final-cta'] : ['[data-band]', 'band'];
  await page.locator(`${closing[0]} a[href^="tel:"]`).click();
  let dl = await layer(page);
  expect(dl.find((e) => (e as { event?: string }).event === 'phone_click')).toMatchObject({ placement: closing[1], phone: '+442089889508' });
  await page.goto('/privacy-policy/');
  await page.evaluate(() => document.querySelectorAll('a[href^="tel:"]').forEach((a) => a.addEventListener('click', (e) => e.preventDefault())));
  await page.locator('[data-site-footer] a[href^="tel:"]').click();
  dl = await layer(page);
  expect(dl.find((e) => (e as { event?: string }).event === 'phone_click')).toBeUndefined();
  expect(dl.find((e) => (e as { event?: string }).event === 'page_view')).toMatchObject({ legal: true });
});
