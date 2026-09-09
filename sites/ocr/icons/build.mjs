#!/usr/bin/env node
/**
 * The site's icon set (scripts/site-assets.mjs runs this before an OCR build):
 * src/app/icon.svg, apple-icon.png and favicon.ico for Next's file
 * conventions, and public/favicons/ for the manifest. The SVGs are cut from
 * the font here; the PNGs come from png/ (render.mjs).
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tileSvg } from './source.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..');
const fav = join(root, 'public', 'favicons');
mkdirSync(fav, { recursive: true });

writeFileSync(join(root, 'src', 'app', 'icon.svg'), tileSvg(512));
writeFileSync(join(fav, 'favicon.svg'), tileSvg(512));
writeFileSync(join(fav, 'favicon-16.svg'), tileSvg(16));
for (const n of [16, 32, 48, 180, 192, 512, 1024]) copyFileSync(join(here, 'png', `favicon-${n}.png`), join(fav, `favicon-${n}.png`));
copyFileSync(join(here, 'png', 'favicon-180.png'), join(root, 'src', 'app', 'apple-icon.png'));

// favicon.ico: the 16 and 32 PNGs packed as ICO entries.
const entries = [16, 32].map((size) => ({ size, png: readFileSync(join(here, 'png', `favicon-${size}.png`)) }));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(entries.length, 4);
let offset = 6 + 16 * entries.length;
const dir = entries.map((e) => {
  const d = Buffer.alloc(16);
  d.writeUInt8(e.size, 0);
  d.writeUInt8(e.size, 1);
  d.writeUInt16LE(1, 4);
  d.writeUInt16LE(32, 6);
  d.writeUInt32LE(e.png.length, 8);
  d.writeUInt32LE(offset, 12);
  offset += e.png.length;
  return d;
});
writeFileSync(join(root, 'src', 'app', 'favicon.ico'), Buffer.concat([header, ...dir, ...entries.map((e) => e.png)]));
console.log('ocr icons: icon.svg, apple-icon.png, favicon.ico and public/favicons written');
