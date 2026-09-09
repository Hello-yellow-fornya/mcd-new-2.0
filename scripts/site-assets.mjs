#!/usr/bin/env node
/**
 * Generates the site's icon set before a build or dev server (predev, prebuild):
 * the files Next reads by convention (src/app/icon.svg, apple-icon.png,
 * favicon.ico) and public/favicons and public/logo. They are build output,
 * not source (.gitignore), because each site writes its own:
 *
 *   mcd2  scripts/logo-build.mjs outlines the Claims 24/7 suite in design/logo
 *   ocr   the same, then sites/ocr/icons/build.mjs writes "CRL" in Inter Black on a navy tile over it
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteForBuild } from '../src/lib/site-id.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const siteId = siteForBuild();
// The Claims 24/7 logo build always runs: src/components/Logo imports its generated lockup, and both sites compile it.
const steps = [join(root, 'scripts', 'logo-build.mjs')];
if (siteId === 'ocr') steps.push(join(root, 'sites', 'ocr', 'icons', 'build.mjs'));
console.log(`site: ${siteId}`);
for (const step of steps) {
  const r = spawnSync(process.execPath, [step], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
