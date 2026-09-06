#!/usr/bin/env node
/**
 * Cuts the PNG icons from src/app/icon.svg (the mark alone on an ink tile,
 * §4a) with the pre-installed Chromium: apple-icon 180, and 192 / 512 for the
 * manifest. Run after changing the logo:  pnpm icons
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const svg = readFileSync(new URL('../src/app/icon.svg', import.meta.url), 'utf8');
const out = [
  [180, 'src/app/apple-icon.png'],
  [192, 'public/icons/icon-192.png'],
  [512, 'public/icons/icon-512.png'],
];
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
for (const [size, file] of out) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
  const buf = await page.locator('svg').screenshot({ omitBackground: true });
  writeFileSync(new URL(`../${file}`, import.meta.url), buf);
  console.log('wrote', file, size);
  await page.close();
}
await browser.close();
