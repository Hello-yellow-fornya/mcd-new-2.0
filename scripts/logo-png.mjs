#!/usr/bin/env node
/**
 * Cuts the social avatar PNG (the stacked square on yellow, 1024) from the
 * outlined suite with the pre-installed Chromium (not on Vercel: run locally
 * after `pnpm logo` and commit it):  pnpm logo:png
 *   public/logo/square/claims247-square-stacked-on-yellow.png
 * The favicon and app-icon PNGs are delivered in design/logo/favicons and copied by pnpm logo.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const avatar = read('public/logo/square/claims247-square-stacked-on-yellow.svg');
const jobs = [[avatar, 1024, 'public/logo/square/claims247-square-stacked-on-yellow.png']];
mkdirSync(new URL('public/logo/square/', root), { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
for (const [svg, size, file] of jobs) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
  const buf = await page.locator('svg').screenshot({ omitBackground: true });
  writeFileSync(new URL(file, root), buf);
  console.log('wrote', file, size);
  await page.close();
}
await browser.close();
