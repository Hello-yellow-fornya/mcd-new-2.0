import { test, expect } from '@playwright/test';

// The SEO template set (appendix §5) in 2.0 styling. Structure, schema,
// jump links and internal-link behaviour as in the 1.0 mockups.

const SITE = 'https://mcd-new-2-0.vercel.app';

const phase1 = [
  ['/accident-management-company/', 'pillar', true],
  ['/non-fault-accident/', 'pillar', true],
  ['/third-party-insurance-claim/', 'pillar', true],
  ['/non-fault-accident-courtesy-car/', 'pillar', true],
  ['/credit-hire/', 'pillar', true],
  ['/how-accident-management-works/', 'process', true],
  ['/accident-management-vs-insurance/', 'comparison', true],
  ['/what-to-do-after-a-car-accident/', 'guide', false],
  ['/accident-management-services-london/', 'location', true],
  ['/how-to-prove-fault/rear-end-collision/', 'article', false],
  ['/how-to-prove-fault/side-impact-collision/', 'article', false],
  ['/how-to-prove-fault/car-park-accidents/', 'article', false],
] as const;

test.describe('the twelve launch pages', () => {
  for (const [path, template, keeps] of phase1) {
    test(`${path} (${template})`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('main')).toHaveAttribute('data-template', template);
      await expect(page.locator('h1')).toHaveCount(1);
      // The highlight rule: one bar, on one or two words of the H1.
      const hl = page.locator('h1 .hl');
      await expect(hl).toHaveCount(1);
      expect((await hl.textContent())!.trim().split(/\s+/).length).toBeLessThanOrEqual(2);
      await expect(hl).toHaveCSS('text-decoration-color', 'rgb(243, 205, 62)');
      // The H2 rule: the lead is the hero's H2.
      await expect(page.locator('[data-hero] h2')).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${path}`);
      await expect(page.locator('nav[aria-label="Breadcrumb"] [aria-current="page"]')).toHaveCount(1);
      await expect(page.locator('section[aria-label="What you keep"]')).toHaveCount(keeps ? 1 : 0);
      // TOC entries point at H2s that exist, in order
      const tocIds = await page.locator('aside[aria-label="On this page"] a').evaluateAll((as) => as.map((a) => a.getAttribute('href')!.slice(1)));
      const h2Ids = await page.locator('main article h2').evaluateAll((hs) => hs.map((h) => h.id));
      expect(h2Ids).toEqual(tocIds);
      // FAQ schema mirrors the visible questions; the first answer is open
      const questions = await page.locator('main details summary').allTextContents();
      const graph = JSON.parse((await page.locator('script[type="application/ld+json"]').last().textContent())!)['@graph'];
      const faq = graph.find((n: { '@type': string }) => n['@type'] === 'FAQPage');
      expect(faq.mainEntity.map((q: { name: string }) => q.name)).toEqual(questions);
      await expect(page.locator('main details').first()).toHaveAttribute('open', '');
      expect(graph.map((n: { '@type': string }) => n['@type'])).toContain('BreadcrumbList');
      // 2.0 CTA rule: Start is ink with yellow text, Call is yellow with ink text
      const heroStart = page.locator('[data-hero] a[data-cta="start"]');
      await expect(heroStart).toHaveCSS('background-color', 'rgb(25, 24, 15)');
      await expect(heroStart).toHaveCSS('color', 'rgb(243, 205, 62)');
      await expect(page.locator('[data-hero] a[data-cta="call"]')).toHaveCSS('background-color', 'rgb(243, 205, 62)');
      // No link to a page that does not build yet
      const hrefs = await page.locator('main a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!.split('#')[0]));
      for (const h of new Set(hrefs)) {
        const r = await page.request.get(h);
        expect(r.status(), h).toBe(200);
      }
      expect(await page.locator('main [data-draft-link]').count()).toBeGreaterThanOrEqual(0);
    });
  }

  test('process page carries HowTo with step anchors that exist', async ({ page }) => {
    await page.goto('/how-accident-management-works/');
    const graph = JSON.parse((await page.locator('script[type="application/ld+json"]').last().textContent())!)['@graph'];
    const howto = graph.find((n: { '@type': string }) => n['@type'] === 'HowTo');
    expect(howto.step).toHaveLength(4);
    for (const s of howto.step) {
      const id = s.url.split('#')[1];
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test('pillar carries Service schema; location carries LocalBusiness without an address', async ({ page }) => {
    await page.goto('/accident-management-company/');
    let graph = JSON.parse((await page.locator('script[type="application/ld+json"]').last().textContent())!)['@graph'];
    expect(graph.some((n: { '@type': string }) => n['@type'] === 'Service')).toBe(true);
    await page.goto('/accident-management-services-london/');
    graph = JSON.parse((await page.locator('script[type="application/ld+json"]').last().textContent())!)['@graph'];
    const lb = graph.find((n: { '@type': string }) => n['@type'] === 'LocalBusiness');
    expect(lb).toBeTruthy();
    expect(lb.address).toBeUndefined();
  });

  test('inline components render in 2.0 colours: step cards, the table, the catch callout', async ({ page }) => {
    await page.goto('/non-fault-accident/');
    await expect(page.locator('main article ol li b').first()).toHaveText('1. Get their details');
    await page.goto('/accident-management-vs-insurance/');
    const table = page.locator('main article [role="table"]');
    await expect(table.locator('[role="row"]')).toHaveCount(9);
    const usMark = table.locator('[role="row"]').nth(1).locator('[role="cell"]').nth(1).locator('span').first();
    await expect(usMark).toHaveCSS('background-color', 'rgb(243, 205, 62)');
    const themMark = table.locator('[role="row"]').nth(1).locator('[role="cell"]').nth(0).locator('span').first();
    await expect(themMark).toHaveCSS('border-top-color', 'rgb(25, 24, 15)');
    await expect(page.locator('main [data-variant="catch"]')).toContainText('We recover our costs');
  });

  test('the header and footer link only to pages that build; drafts do not build', async ({ page, request }) => {
    await page.goto('/');
    const nav = page.locator('[data-site-header] nav[aria-label="Sections"]');
    // The desktop nav is hidden on mobile; the hrefs are what matter here.
    await expect(nav.locator('a', { hasText: 'How it works' })).toHaveAttribute('href', '/how-accident-management-works/');
    await expect(nav.locator('a', { hasText: 'Non-fault accident' })).toHaveAttribute('href', '/non-fault-accident/');
    const foot = page.locator('[data-site-footer]');
    await expect(foot.locator('a', { hasText: 'Credit hire' })).toHaveAttribute('href', '/credit-hire/');
    await expect(foot.locator('a', { hasText: 'Accident recovery' })).toHaveCount(0);
    await expect(foot.getByText('Accident recovery')).toBeVisible();
    expect((await request.get('/accident-recovery/')).status()).toBe(404);
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).toContain(`${SITE}/credit-hire/</loc>`);
    expect(sitemap).not.toContain('/accident-recovery/');
    expect(sitemap).not.toContain('/styleguide/');
    expect(sitemap).not.toContain('/claim/');
  });
});
