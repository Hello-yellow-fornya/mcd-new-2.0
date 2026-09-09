import { test, expect, type Page } from '@playwright/test';
import { onlySite } from '../lib/site';

// The report form: the hero card and /report/ post to the site's own
// endpoint (source "ocr") and land on /report/thank-you/, the conversion
// trigger. No CLAIMS_API_URL in tests, so the endpoint acknowledges.
onlySite('ocr');

async function fill(page: Page, form = page.locator('form[data-testid="report-form"]').first()) {
  await form.locator('input[name="reg"]').fill('ab12cde');
  await expect(form.locator('input[name="reg"]')).toHaveValue('AB12 CDE');
  await form.locator('input[name="name"]').fill('Sam Driver');
  await form.locator('input[name="mobile"]').fill('07123 456789');
  return form;
}

test('/report/: one H1, the second line, the form, the aside, canonical, noindex', async ({ page }) => {
  const res = await page.goto('/report/');
  expect(res?.status()).toBe(200);
  expect(res?.headers()['x-robots-tag']).toContain('noindex');
  await expect(page.locator('h1')).toHaveText('Report your accident');
  await expect(page.locator('[data-hero] h2')).toBeVisible();
  await expect(page.locator('form[data-testid="report-form"]')).toHaveCount(1);
  await expect(page.locator('form[data-testid="report-form"]')).toHaveAttribute('data-placement', 'report');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/report\/$/);
  await expect(page.locator('[data-final-cta]')).toHaveCount(1);
});

test('/report/: submitting posts the reg, name and mobile and lands on the thank-you page', async ({ page }) => {
  await page.goto('/report/');
  const posted = page.waitForRequest((r) => r.url().includes('/api/claim-start/') && r.method() === 'POST');
  const form = await fill(page);
  await form.locator('button[type="submit"]').click();
  const body = (await posted).postDataJSON() as Record<string, string>;
  expect(body).toMatchObject({ reg: 'AB12CDE', name: 'Sam Driver', mobile: '07123 456789', placement: 'report', path: '/report/' });
  await page.waitForURL(/\/report\/thank-you\/\?ref=/);
  await expect(page.locator('h1')).toHaveText('That’s your bit done.');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('homepage: the hero form posts with its own placement and lands on the thank-you page', async ({ page }) => {
  await page.goto('/');
  const form = page.locator('form[data-testid="report-form"]');
  const mobile = (page.viewportSize()?.width ?? 1280) <= 820;
  if (mobile) {
    // The form is desktop-only in the hero; the outlined button goes to /report/.
    await expect(form).toBeHidden();
    await page.locator('[data-hero-cta] [data-cta="start"]').click();
    await page.waitForURL(/\/report\/$/);
    return;
  }
  await expect(form).toHaveAttribute('data-placement', 'home-hero');
  await fill(page, form);
  await form.locator('button[type="submit"]').click();
  await page.waitForURL(/\/report\/thank-you\/\?ref=/);
});

test('validation: a bad mobile number is refused on the page with the number to call', async ({ page }) => {
  await page.goto('/report/');
  const form = page.locator('form[data-testid="report-form"]');
  await form.locator('input[name="reg"]').fill('AB12 CDE');
  await form.locator('input[name="name"]').fill('Sam');
  await form.locator('input[name="mobile"]').fill('12');
  await form.locator('button[type="submit"]').click();
  await expect(form.locator('[role="alert"]')).toContainText('mobile');
  await expect(form.locator('[role="alert"] a')).toHaveAttribute('href', 'tel:08000480048');
  await expect(page).toHaveURL(/\/report\/$/);
});

test('the endpoint accepts name and mobile and answers with a reference; the honeypot is honoured', async ({ request }) => {
  const ok = await request.post('/api/claim-start/', { data: { reg: 'AB12CDE', name: 'Sam Driver', mobile: '07123456789', placement: 'report', path: '/report/', website: '' } });
  expect(ok.status()).toBe(202);
  const json = await ok.json();
  expect(json.ok).toBe(true);
  expect(json.ref).toMatch(/^MCD-[A-Z0-9]{6}$/);
  const bad = await request.post('/api/claim-start/', { data: { reg: 'nope', name: 'x', mobile: '1', website: '' } });
  expect(bad.status()).toBe(422);
  const bot = await request.post('/api/claim-start/', { data: { reg: 'AB12CDE', website: 'http://spam' } });
  expect(bot.status()).toBe(202);
});

test('Claims 24/7 routes are not on this site', async ({ request }) => {
  for (const path of ['/claim-now/', '/claim-now/thank-you/', '/styleguide/']) expect((await request.get(path)).status(), path).toBe(404);
});
