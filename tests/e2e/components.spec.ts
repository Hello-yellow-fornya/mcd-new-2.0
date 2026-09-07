import { test, expect, type Page } from '@playwright/test';

// Every component renders on /styleguide/ (staging only). Values come from
// CLAUDE.md §0 and the mockups in design/.

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) <= 820;

test.beforeEach(async ({ page }) => {
  await page.goto('/styleguide/');
});

test('header: sticky cream bar at 84px desktop / 64px mobile with the logo hard left', async ({ page }) => {
  const header = page.locator('[data-site-header]');
  await expect(header).toHaveCSS('position', 'sticky');
  await expect(header).toHaveCSS('background-color', 'rgb(247, 245, 239)');
  const box = await header.boundingBox();
  expect(Math.round(box!.height)).toBe(isMobile(page) ? 64 : 85); // mobile includes the hairline; desktop adds it
  const logo = header.locator('a[title="Claims 24/7, home"]');
  await expect(logo).toBeVisible();
  // The wide on-cream lockup at 50px desktop / 42px mobile, the wordmark as outlines (no <text> to fall back)
  const lockup = logo.locator('svg[data-logo="cream"][data-layout="wide"]');
  const lb = (await lockup.boundingBox())!;
  expect(Math.round(lb.height)).toBe(isMobile(page) ? 42 : 50);
  expect(lb.width).toBeGreaterThan(isMobile(page) ? 130 : 160); // about 169 × 50 desktop, 142 × 42 mobile
  await expect(lockup.locator('text')).toHaveCount(0);
  await expect(lockup.locator('path[data-text="Claims"]')).toHaveCount(1);
});

test('header: desktop shows links, chip and two pills; mobile shows Call now and the burger only', async ({ page }) => {
  const header = page.locator('[data-site-header]');
  if (isMobile(page)) {
    await expect(header.getByRole('navigation', { name: 'Sections' })).toBeHidden();
    await expect(header.getByRole('link', { name: /call now/i })).toBeVisible();
    await expect(header.getByRole('button', { name: 'Menu' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Start your claim' })).toBeHidden();
  } else {
    const nav = header.getByRole('navigation', { name: 'Sections' });
    await expect(nav).toBeVisible();
    for (const label of ['How it works', 'Non-fault accident', 'Advice', 'About']) await expect(nav.getByText(label)).toBeVisible();
    await expect(nav.getByRole('button', { name: /services/i })).toBeVisible();
    await expect(header.locator('[data-proof-chip]').first()).toBeVisible();
    await expect(header.getByRole('link', { name: '0800 048 0048' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Start your claim' })).toBeVisible();
    await expect(header.getByRole('button', { name: 'Menu' })).toBeHidden();
  }
});

test('mobile drawer opens with the proof line, links, and the two full-width buttons', async ({ page }) => {
  test.skip(!isMobile(page), 'mobile only');
  const burger = page.getByRole('button', { name: 'Menu' });
  await burger.click();
  const drawer = page.locator('[data-drawer]');
  await expect(drawer).toBeVisible();
  await expect(drawer.locator('[data-proof-chip]')).toBeVisible();
  for (const label of ['How it works', 'Non-fault accident', 'Advice', 'About', 'Contact']) await expect(drawer.getByText(label, { exact: true })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Start your non-fault claim' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Call 0800 048 0048' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
});

test('claims strip: ink band, yellow text, yellow icon circles, 52px on mobile', async ({ page }) => {
  const strip = page.locator('[data-claims-strip]');
  await expect(strip).toHaveCSS('background-color', 'rgb(25, 24, 15)');
  await expect(strip).toHaveCSS('color', 'rgb(243, 205, 62)');
  const circle = strip.locator('li span').first();
  await expect(circle).toHaveCSS('background-color', 'rgb(243, 205, 62)');
  if (isMobile(page)) expect(Math.round((await strip.boundingBox())!.height)).toBe(52);
  await expect(strip.locator('li:not([aria-hidden])')).toHaveCount(6);
});

test('proof grid: four white cards in two columns with ink circles', async ({ page }) => {
  const grid = page.locator('[data-hero] [data-proof-grid]');
  const cards = grid.locator('li');
  await expect(cards).toHaveCount(4);
  const [a, b] = await Promise.all([cards.nth(0).boundingBox(), cards.nth(1).boundingBox()]);
  expect(Math.round(a!.y)).toBe(Math.round(b!.y));
  await expect(cards.first()).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(cards.first().locator('span').first()).toHaveCSS('background-color', 'rgb(25, 24, 15)');
});

test('band: three display lines, the chip is yellow with ink text, two outlined yellow pills', async ({ page }) => {
  const band = page.locator('[data-band]');
  await expect(band).toHaveCSS('background-color', 'rgb(25, 24, 15)');
  const chip = band.locator('mark');
  await expect(chip).toHaveText('We work for you.');
  await expect(chip).toHaveCSS('background-color', 'rgb(243, 205, 62)');
  await expect(chip).toHaveCSS('color', 'rgb(25, 24, 15)');
  const pills = band.locator('a');
  await expect(pills).toHaveCount(2);
  await expect(pills.first()).toHaveCSS('border-top-color', 'rgb(243, 205, 62)');
  await expect(pills.first()).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test('their/your table: five rows, cross on their side, yellow tick on ours', async ({ page }) => {
  const table = page.locator('[data-them-us] [role="table"]');
  await expect(table.locator('[role="columnheader"]')).toHaveText(['Their claims department', 'Your claims handler']);
  const rows = table.locator('[role="row"]').filter({ has: page.locator('[role="cell"]') });
  await expect(rows).toHaveCount(5);
  await expect(rows.first().locator('[role="cell"]').last().locator('span').first()).toHaveCSS('background-color', 'rgb(243, 205, 62)');
});

test('faq: details accordion with the first open', async ({ page }) => {
  const faq = page.locator('[data-faq]');
  const items = faq.locator('details');
  await expect(items).toHaveCount(4);
  await expect(items.first()).toHaveAttribute('open', '');
  await expect(items.nth(1)).not.toHaveAttribute('open', '');
  await items.nth(1).locator('summary').click();
  await expect(items.nth(1)).toHaveAttribute('open', '');
});

test('footer: logo, phone, four columns and a visible FCA placeholder on staging', async ({ page }) => {
  const foot = page.locator('[data-site-footer]');
  await expect(foot.getByRole('link', { name: '0800 048 0048' })).toBeVisible();
  await expect(foot.locator('h3')).toHaveText(['Claims', 'Services', 'Help', 'Legal']);
  await expect(foot).toContainText('[TODO');
  const h3 = foot.locator('h3').first();
  await expect(h3).toHaveCSS('text-transform', 'none');
});

test('review band renders the sample cards on staging and pauses on hover', async ({ page }) => {
  const band = page.locator('[data-review-band]');
  await expect(band).toBeVisible();
  await expect(band.locator('article:not([aria-hidden])')).toHaveCount(4);
  await band.hover();
  const track = band.locator('article').first().locator('..');
  await expect(track).toHaveCSS('animation-play-state', 'paused');
});

test('every tel link is the same number rendered as text', async ({ page }) => {
  const tels = page.locator('a[href^="tel:"]');
  const n = await tels.count();
  expect(n).toBeGreaterThan(3);
  for (let i = 0; i < n; i++) await expect(tels.nth(i)).toHaveAttribute('href', 'tel:08000480048');
});
