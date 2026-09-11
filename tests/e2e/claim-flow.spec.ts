import { test, expect, type Page } from '@playwright/test';
import { onlySite } from './lib/site';

/**
 * The claim flow on /claim-now/ (appendix §7). The questions, branches and
 * validation are duplicated from 1.0; these walk the journey a visitor takes.
 *
 * The intake endpoints rate-limit per address, so anything that submits runs
 * on one project only.
 */
onlySite('mcd2');

const REG = '[data-testid="regbox"]';

/** Enters a reg, which is what opens the flow. */
async function startFlow(page: Page, query = '') {
  await page.goto(`/claim-now/${query}`);
  await page.evaluate(() => document.querySelector('[data-testid="consent-banner"]')?.remove());
  await page.locator(`${REG} input`).fill('AB12CDE');
  await page.locator(`${REG} button[type="submit"]`).click();
  await page.locator('#claim-flow fieldset').first().waitFor();
}

async function answer(page: Page, label: string) {
  await page.locator('#claim-flow label').filter({ hasText: new RegExp(`^${label}$`) }).first().click();
}

test('the flow opens once the reg is accepted, and not before', async ({ page }) => {
  await page.goto('/claim-now/');
  await page.evaluate(() => document.querySelector('[data-testid="consent-banner"]')?.remove());
  await expect(page.locator('#claim-flow')).toHaveAttribute('data-claim-flow-mount', '');
  await expect(page.locator('#claim-flow fieldset')).toHaveCount(0);
  await startFlow(page);
  await expect(page.locator('#claim-flow legend')).toHaveText([
    'Have you been involved in a road traffic accident?',
    'Was the accident your fault?',
  ]);
  // The reg and its reference travel with the flow, as 1.0's contract expects.
  await expect(page.locator('#claim-flow')).toHaveAttribute('data-reg', /AB12/);
  await expect(page.locator('#claim-flow')).toHaveAttribute('data-ref', /^MCD-/);
});

test('"no accident" ends the flow with the phone, and Continue stays shut', async ({ page }) => {
  await startFlow(page);
  await answer(page, 'No, I haven’t had an accident');
  const deadEnd = page.locator('#claim-flow [role="status"]');
  await expect(deadEnd).toContainText('cannot start a road traffic accident claim');
  await expect(deadEnd.locator('a')).toHaveAttribute('href', /^tel:\+44/);
  await expect(page.locator('[data-cta="flow-next"]')).toBeDisabled();
  // A dead end is not a claim: no claim CTA inside the flow.
  await expect(page.locator('#claim-flow [data-cta="start"]')).toHaveCount(0);
});

test('"my fault" ends the flow with its own wording', async ({ page }) => {
  await startFlow(page);
  await answer(page, 'Yes, I’ve had an accident');
  await answer(page, 'Yes, it was my fault');
  await expect(page.locator('#claim-flow [role="status"]')).toContainText('unable to deal with fault claims');
  await expect(page.locator('[data-cta="flow-next"]')).toBeDisabled();
});

test('the contact step validates the mobile as 1.0 does, and blocks Submit until it is right', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'one journey: the intake endpoints rate-limit per address');
  await startFlow(page);
  await answer(page, 'Yes, I’ve had an accident');
  await answer(page, 'No, it was not my fault');
  await page.locator('[data-cta="flow-next"]').click();
  await answer(page, 'Yes, I can safely drive');
  await answer(page, 'Yes');
  await page.locator('[data-cta="flow-next"]').click();
  // The photo step is optional, so Continue offers to skip it.
  await expect(page.locator('[data-cta="flow-next"]')).toHaveText('Skip this step');
  await page.locator('[data-cta="flow-next"]').click();
  await page.locator('#f-mobile').fill('12345');
  await page.locator('#f-your-name').click();
  await expect(page.locator('#f-mobile-e')).toHaveText('UK mobile must be 11 digits.');
  await expect(page.locator('[data-cta="flow-submit"]')).toBeDisabled();
  await page.locator('#f-mobile').fill('01700900123');
  await page.locator('#f-your-name').click();
  await expect(page.locator('#f-mobile-e')).toHaveText('UK mobile must start with 07.');
});

test('a completed claim posts the answers and lands on the thank-you route, which fires the conversion', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'one submission: the intake endpoints rate-limit per address');
  await startFlow(page, '?gclid=FLOWTEST&utm_source=google&utm_medium=cpc');
  await answer(page, 'Yes, I’ve had an accident');
  await answer(page, 'No, it was not my fault');
  await page.locator('[data-cta="flow-next"]').click();
  await answer(page, 'Yes, I can safely drive');
  await answer(page, 'Yes');
  await page.locator('[data-cta="flow-next"]').click();
  await page.locator('[data-cta="flow-next"]').click();
  await page.locator('#f-your-name').fill('Test Person');
  await page.locator('#f-mobile').fill('07700900123');
  await page.locator('#f-email').fill('test@example.com');
  const posted = page.waitForRequest((r) => r.url().includes('/api/claim-submit/') && r.method() === 'POST');
  await page.locator('[data-cta="flow-submit"]').click();
  const body = JSON.parse((await posted).postData() ?? '{}') as Record<string, unknown>;
  expect(body.answers).toEqual({ had_accident: 'yes', fault: 'not_fault', drivable: 'drivable', replacement: 'yes' });
  expect(body).toMatchObject({ name: 'Test Person', phone: '07700900123', email: 'test@example.com' });
  expect(body.reg).toMatch(/AB12/);
  // The paid campaign rides the claim (src/lib/campaign.ts).
  expect(body.campaign).toMatchObject({ gclid: 'FLOWTEST', utm_source: 'google', utm_medium: 'cpc' });

  await page.waitForURL('**/claim-now/thank-you/**');
  expect(new URL(page.url()).searchParams.get('ref')).toMatch(/^MCD-/);
  // The conversion fires from an effect behind Suspense, so poll for it.
  const events = () => page.evaluate(() => (window as unknown as { dataLayer: { event?: string }[] }).dataLayer.map((e) => e.event).filter(Boolean));
  await expect.poll(events).toContain('claim_submitted');
  // form_start once on the first answer, generate_lead on submit, then the conversion.
  const seen = await events();
  expect(seen).toContain('form_start');
  expect(seen).toContain('generate_lead');
  expect(seen.filter((e) => e === 'form_start')).toHaveLength(1);
});

test('the photo step degrades to skip-only when no blob store is connected', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'one check is enough');
  // The upload route answers 503 rather than failing the step (1.0's behaviour).
  const res = await page.request.post('/api/upload-photo/', { multipart: { file: { name: 'x.jpg', mimeType: 'image/jpeg', buffer: Buffer.from([0xff, 0xd8, 0xff]) } } });
  expect([200, 503]).toContain(res.status());
  if (res.status() === 503) expect(await res.json()).toMatchObject({ ok: false });
});

test('a forwarded address is still rate-limited, even though a local one is not', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'server-side checks run once');
  // The cap is ten per ten minutes per address; only requests that arrive with
  // x-forwarded-for are counted, which on Vercel is all of them.
  const headers = { 'x-forwarded-for': '198.51.100.7' };
  const post = () => page.request.post('/api/claim-submit/', { headers, data: { name: 'Test Person', phone: '07700900123', email: 'a@b.co', answers: {} } });
  const codes: number[] = [];
  for (let i = 0; i < 12; i++) codes.push((await post()).status());
  expect(codes.slice(0, 10), 'the first ten go through').toEqual(Array(10).fill(202));
  expect(codes.at(-1), 'the eleventh is refused').toBe(429);
});

test('the submit route rejects a bad contact and honours the honeypot', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'server-side checks run once');
  const bad = await page.request.post('/api/claim-submit/', { data: { name: 'A', phone: '123', email: 'nope', answers: {} } });
  expect(bad.status()).toBe(422);
  // A filled honeypot looks like success but is never a lead.
  const bot = await page.request.post('/api/claim-submit/', { data: { name: 'Bot', phone: '07700900123', email: 'b@b.co', website: 'http://spam', answers: {} } });
  expect(bot.status()).toBe(202);
  expect(await bot.json()).toMatchObject({ ok: true });
});
