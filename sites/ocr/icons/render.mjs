#!/usr/bin/env node
/**
 * Rasterises the tile to the PNG sizes in png/ (a one-off with Chromium:
 * `node sites/ocr/icons/render.mjs`). The PNGs are committed because the
 * build on Vercel has no browser; build.mjs only copies them.
 */
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tileSvg } from './source.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'png');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const n of [16, 32, 48, 180, 192, 512, 1024]) {
  await page.setViewportSize({ width: n, height: n });
  const src = `data:image/svg+xml;base64,${Buffer.from(tileSvg(n)).toString('base64')}`;
  await page.setContent(`<style>html,body{margin:0;background:transparent}img{display:block}</style><img src="${src}" width="${n}" height="${n}">`);
  writeFileSync(join(out, `favicon-${n}.png`), await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: n, height: n } }));
}
await browser.close();
console.log('ocr icons: png/ rendered');
