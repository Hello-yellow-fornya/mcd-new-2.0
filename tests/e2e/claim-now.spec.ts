import { test, expect } from '@playwright/test';
import { onlySite } from './lib/site';

onlySite('mcd2');

// /claim-now/ (CLAUDE.md §0, appendix §7): the stub with the #claim-flow slot,
// posting through the site's own endpoint to the shared claims API with
// source "mcd2". No CLAIMS_API_URL in tests, so the endpoint acknowledges.

test('page: one H1 with the bar, an H2, the reg card, the aside, canonical', async ({ page }) => {
  await page.goto('/claim-now/');
  await expect(page.locator('h1')).toHaveText('Start your non-fault claim');
  await expect(page.locator('h1 .hl')).toHaveText('non-fault');
  await expect(page.locator('[data-hero] h2')).toBeVisible();
  await expect(page.getByTestId('regbox')).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://mcd-new-2-0.vercel.app/claim-now/');
});

test('the reg box formats as you type, posts, shows the reference and sets the slot attributes', async ({ page }) => {
  await page.goto('/claim-now/');
  const input = page.getByLabel('Enter your reg');
  await input.fill('ab12cde');
  await expect(input).toHaveValue('AB12 CDE');
  const [req] = await Promise.all([page.waitForRequest((r) => r.url().endsWith('/api/claim-start/') && r.method() === 'POST'), page.getByRole('button', { name: 'Start your claim' }).click()]);
  expect(req.postDataJSON()).toMatchObject({ reg: 'AB12CDE', placement: 'claim-now', website: '' });
  await expect(page.getByTestId('claim-started')).toBeVisible();
  await expect(page.getByTestId('claim-started')).toContainText(/MCD-[A-Z0-9]{6}/);
  const slot = page.locator('#claim-flow');
  await expect(slot).toHaveAttribute('data-claim-flow-mount', '');
  await expect(slot).toHaveAttribute('data-reg', 'AB12 CDE');
  await expect(slot).toHaveAttribute('data-ref', /MCD-/);
  const events = await page.evaluate(() => (window as unknown as { dataLayer: Record<string, unknown>[] }).dataLayer.map((e) => e.event));
  expect(events).toEqual(expect.arrayContaining(['reg_submit', 'claim_start']));
});

test('?reg= pre-fills the box', async ({ page }) => {
  await page.goto('/claim-now/?reg=cd34efg');
  await expect(page.getByLabel('Enter your reg')).toHaveValue('CD34 EFG');
});

test('the endpoint rejects a bad reg, honours the honeypot, and never trusts the source', async ({ request }) => {
  const bad = await request.post('/api/claim-start/', { data: { reg: '1234' } });
  expect(bad.status()).toBe(422);
  const bot = await request.post('/api/claim-start/', { data: { reg: 'AB12CDE', website: 'http://spam' } });
  expect(bot.status()).toBe(202);
  const ok = await request.post('/api/claim-start/', { data: { reg: 'ab12 cde', source: 'somewhere-else' } });
  expect(ok.status()).toBe(202);
  const body = await ok.json();
  expect(body).toMatchObject({ ok: true, reg: 'AB12CDE', stub: true });
  expect(body.ref).toMatch(/^MCD-/);
});

test('the thank-you route is noindex and fires claim_submitted with the ref', async ({ page }) => {
  await page.goto('/claim-now/thank-you/?ref=MCD-TEST01');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('h1')).toHaveText('Thank you.');
  // The page is an acknowledgement and a phone number: no claim CTA, no closing band.
  await expect(page.locator('main [data-cta="start"]')).toHaveCount(0);
  await expect(page.locator('main [data-band]')).toHaveCount(0);
  await expect(page.locator('main [data-cta="call"]')).toHaveCount(1);
  const ev = await page.evaluate(() => (window as unknown as { dataLayer: Record<string, unknown>[] }).dataLayer.find((e) => e.event === 'claim_submitted'));
  expect(ev).toMatchObject({ event: 'claim_submitted', ref: 'MCD-TEST01' });
});
