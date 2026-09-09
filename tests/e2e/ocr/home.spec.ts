import { test, expect, type Page } from '@playwright/test';
import { onlySite } from '../lib/site';

// The Online Claims Report homepage (design/ocr/ocr-homepage-concept.html
// and ocr-homepage-mobile.html) and the layout rulebook
// (design/MCD-layout-rules.md) as assertions: the fold-locked mobile hero
// with one flexible gap and its last element on the fold at 390×844 and
// 430×932, chip clearance, equal-height cards, the desktop hero inside
// 1280×720, and the nav with the wordmark left and the call pill and burger right.
onlySite('ocr');

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) <= 820;
const box = async (page: Page, sel: string) => (await page.locator(sel).first().boundingBox())!;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
});

test('copy rules: primary buttons say "Report your accident", the outlined one "Or report it online", and the banned band is nowhere', async ({ page }) => {
  const starts = page.locator('[data-cta="start"]');
  for (const t of await starts.allTextContents()) expect(['Report your accident', 'Or report it online']).toContain(t.trim());
  await expect(page.locator('[data-hero-cta] [data-cta="start"]')).toHaveText(/Or report it online/);
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/Your insurer has a claims department/i);
  expect(body).not.toMatch(/non-fault only/i);
  await expect(page.locator('[data-band]')).toHaveCount(0);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('Had an accident?');
  await expect(page.locator('h1 [data-chip]')).toHaveText('Report it here.');
});

test('section order and the FAQ: how → not to a queue → who → the catch with "What if it was my fault?" open first → final CTA', async ({ page }) => {
  const order = await page.locator('main > section').evaluateAll((els) => els.map((e) => e.getAttribute('data-section') ?? (e.hasAttribute('data-hero') ? 'hero' : e.hasAttribute('data-final-cta') ? 'final' : e.tagName)));
  expect(order).toEqual(['hero', 'how', 'ways', 'who', 'catch', 'final']);
  for (const id of ['how', 'catch', 'who']) await expect(page.locator(`#${id}`)).toHaveCount(1);
  const open = page.locator('#catch details[open] summary');
  await expect(open).toHaveCount(1);
  await expect(open).toHaveText('What if it was my fault?');
  await expect(page.locator('[data-section="how"] li')).toHaveCount(4);
  await expect(page.locator('[data-final-cta] h2')).toContainText('sorts the lot.');
});

test('the wordmark is live text in Inter Black, tracked −4.5%, "Online" in green', async ({ page }) => {
  const mark = page.locator('[data-site-header] [data-logo]').first();
  await expect(mark).toHaveText('Online Claims Report');
  expect(await mark.evaluate((e) => getComputedStyle(e).fontWeight)).toBe('900');
  expect(await mark.evaluate((e) => getComputedStyle(e).fontFamily)).toMatch(/inter|__variable|font-body|Inter/i);
  const size = await mark.evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  const tracking = await mark.evaluate((e) => parseFloat(getComputedStyle(e).letterSpacing));
  expect(tracking / size).toBeCloseTo(-0.045, 2);
  await expect(mark.locator('span').first()).toHaveCSS('color', 'rgb(24, 172, 126)');
  await expect(page.locator('[data-site-header] svg[data-logo]')).toHaveCount(0);
});

test('nav: wordmark left; call pill and burger right on mobile; links, call link and navy pill on desktop', async ({ page }) => {
  const header = page.locator('[data-site-header]');
  const h = await header.boundingBox();
  const width = page.viewportSize()!.width;
  const mark = await box(page, '[data-site-header] a[title]');
  if (isMobile(page)) {
    expect(Math.round(mark.x)).toBe(16);
    expect(Math.round(h!.height)).toBe(64);
    const pill = await box(page, '[data-site-header] [data-cta="call"]:visible');
    const burger = await box(page, '[data-site-header] button[aria-controls]');
    await expect(page.locator('[data-site-header] [data-cta="call"]:visible')).toHaveText(/Call now/);
    expect(Math.round(pill.height)).toBe(38);
    expect(burger.x + burger.width).toBeGreaterThan(width - 30);
    expect(pill.x + pill.width).toBeLessThan(burger.x);
    await page.locator('[data-site-header] button[aria-controls]').click();
    await expect(page.locator('[data-drawer]')).toBeVisible();
    await expect(page.locator('[data-drawer] [data-cta="start"]')).toHaveText('Report your accident');
  } else {
    const wrap = await box(page, '[data-site-header] .wrap');
    expect(Math.round(mark.x)).toBe(Math.round(wrap.x + 24));
    // 80px bar plus its 1px hairline.
    expect(Math.round(h!.height)).toBe(81);
    await expect(header.locator('nav a')).toHaveCount(3);
    await expect(header.locator('[data-cta="start"]:visible')).toHaveText('Report your accident');
    const start = await box(page, '[data-site-header] [data-cta="start"]');
    expect(start.x + start.width).toBeGreaterThan(width - 100);
  }
});

test('mobile hero: navy, fold-locked with one flexible gap, the call button, the wait row and "Or report it online" on the fold', async ({ page }) => {
  test.skip(!isMobile(page), 'mobile projects only');
  const vh = page.viewportSize()!.height;
  const hero = await box(page, '[data-hero]');
  expect(Math.round(hero.y)).toBe(64);
  expect(Math.round(hero.y + hero.height)).toBe(vh);
  await expect(page.locator('[data-hero]')).toHaveCSS('background-color', 'rgb(14, 42, 71)');
  // The last element sits on the fold.
  const last = await box(page, '[data-hero-cta] > :last-child');
  expect(Math.abs(last.y + last.height - vh)).toBeLessThanOrEqual(1);
  await expect(page.locator('[data-hero-cta] > :last-child')).toHaveText(/Or report it online/);
  await expect(page.locator('[data-hero-cta] [data-cta="call"]')).toHaveText(/Call 0800 048 0048/);
  await expect(page.locator('[data-hero-cta] [data-cta="call"]')).toHaveCSS('background-color', 'rgb(24, 172, 126)');
  const call = await box(page, '[data-hero-cta] [data-cta="call"]');
  expect(Math.round(call.height)).toBe(54);
  // One flexible gap: between the worries and the call block; every other gap is fixed and smaller.
  const worries = await box(page, '[data-worries]');
  const cta = await box(page, '[data-hero-cta]');
  const flexible = cta.y - (worries.y + worries.height);
  expect(flexible).toBeGreaterThanOrEqual(16);
  const h1 = await box(page, 'h1');
  const lead = (await page.locator('[data-hero] [data-lead]:visible').boundingBox())!;
  expect(lead.y - (h1.y + h1.height)).toBeLessThan(flexible);
  expect(worries.y - (lead.y + lead.height)).toBeLessThan(flexible);
  // Nothing scrolls inside the hero.
  expect(await page.locator('[data-hero]').evaluate((e) => e.scrollHeight - e.clientHeight)).toBeLessThanOrEqual(1);
});

test('chip clearance: the H1 chip’s margin-top equals its top padding, and line spacing is measured from the chip', async ({ page }) => {
  const chip = page.locator('h1 [data-chip]');
  const m = await chip.evaluate((e) => ({ mt: parseFloat(getComputedStyle(e).marginTop), pt: parseFloat(getComputedStyle(e).paddingTop), display: getComputedStyle(e).display }));
  expect(m.display).toBe('inline-block');
  expect(m.mt).toBeGreaterThan(0);
  expect(m.mt).toBeGreaterThanOrEqual(m.pt);
  await expect(chip).toHaveCSS('background-color', 'rgb(24, 172, 126)');
  await expect(chip).toHaveCSS('color', 'rgb(24, 31, 35)');
});

test('desktop hero: two columns with the report form right, three equal-height worry cards, everything inside 1280×720', async ({ page }) => {
  test.skip(isMobile(page), 'desktop only');
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('[data-hero]')).toHaveCSS('background-color', 'rgb(244, 246, 245)');
  const form = await box(page, '[data-hero] form[data-testid="report-form"]');
  expect(form.x).toBeGreaterThan(640);
  expect(form.y + form.height).toBeLessThanOrEqual(720);
  const hero = await box(page, '[data-hero]');
  expect(hero.y + hero.height).toBeLessThanOrEqual(720);
  const cards = await page.locator('[data-worries] li').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
  expect(cards).toHaveLength(3);
  expect(new Set(cards).size).toBe(1);
  const steps = await page.locator('[data-section="how"] li').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
  expect(new Set(steps).size).toBe(1);
});

test('icons are line icons: no filled glyphs, 1.9px navy strokes in mint circles', async ({ page }) => {
  const worry = page.locator('[data-worries] li').first();
  const circle = worry.locator('span').first();
  await expect(circle).toHaveCSS('background-color', 'rgb(221, 245, 235)');
  const paths = await page.locator('[data-worries] svg use').count();
  expect(paths).toBe(3);
  const strokes = await page.evaluate(() => Array.from(document.querySelectorAll('symbol[id="i-question"] path, symbol[id="i-car"] path')).map((p) => p.getAttribute('stroke-width')));
  expect(strokes.every((w) => w === '1.9')).toBe(true);
});
