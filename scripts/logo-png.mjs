#!/usr/bin/env node
/**
 * Cuts the PNG favicons and app icons from the built suite with the
 * pre-installed Chromium (not on Vercel: run locally after `pnpm logo` and
 * commit the PNGs):  pnpm logo:png
 *   public/favicons/favicon-{16..1024}.png  from public/favicons/favicon.svg
 *   src/app/apple-icon.png (180)
 *   public/logo/square/claims247-stacked-yellow.png (the social avatar, 1024)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const favicon = read('public/favicons/favicon.svg');
const avatar = read('public/logo/square/claims247-stacked-yellow.svg');
const jobs = [
  ...[16, 32, 48, 64, 96, 128, 180, 192, 256, 384, 512, 1024].map((s) => [favicon, s, `public/favicons/favicon-${s}.png`]),
  [favicon, 180, 'src/app/apple-icon.png'],
  [avatar, 1024, 'public/logo/square/claims247-stacked-yellow.png'],
];
mkdirSync(new URL('public/favicons/', root), { recursive: true });
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
