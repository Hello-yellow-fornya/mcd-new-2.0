#!/usr/bin/env node
/**
 * Generates the site's icon set before a build or dev server (predev, prebuild):
 * the files Next reads by convention (src/app/icon.svg, apple-icon.png,
 * favicon.ico) and public/favicons and public/logo. They are build output,
 * not source (.gitignore), because each site writes its own:
 *
 *   mcd2  scripts/logo-build.mjs outlines the Claims 24/7 suite in design/logo
 *   ocr   sites/ocr/icons/build.mjs sets "OCR" in Inter Black on a navy tile
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteForBuild } from '../src/lib/site-id.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const siteId = siteForBuild();
const builders = {
  mcd2: join(root, 'scripts', 'logo-build.mjs'),
  ocr: join(root, 'sites', 'ocr', 'icons', 'build.mjs'),
};
console.log(`site: ${siteId}`);
const r = spawnSync(process.execPath, [builders[siteId]], { stdio: 'inherit' });
process.exit(r.status ?? 1);
