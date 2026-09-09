#!/usr/bin/env node
/**
 * Hashes every page the site serves (markup and stylesheets, normalised for
 * build-specific file names) and the generated assets, so a refactor can prove
 * the served output is unchanged.
 *
 *   pnpm snapshot --write   captures tests/snapshots/<site>-routes.json from a
 *                           server on SNAPSHOT_BASE_URL (default localhost:3100)
 *   pnpm snapshot           compares the running server against that file
 *
 * The comparison also runs as tests/e2e/unchanged.spec.ts.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { snapshotRoutes, snapshotFile } from '../tests/lib/snapshot.mjs';

const write = process.argv.includes('--write');
const base = process.env.SNAPSHOT_BASE_URL || 'http://localhost:3100';
const { site, snapshot } = await snapshotRoutes(base);
const file = snapshotFile(site);

if (write) {
  mkdirSync(join(process.cwd(), 'tests/snapshots'), { recursive: true });
  writeFileSync(file, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`wrote ${file}: ${Object.keys(snapshot.routes).length} routes, ${Object.keys(snapshot.assets).length} assets`);
} else {
  const expected = JSON.parse(readFileSync(file, 'utf8'));
  const diffs = [];
  for (const [route, want] of Object.entries(expected.routes)) {
    const got = snapshot.routes[route];
    if (!got) diffs.push(`${route}: missing`);
    else if (got.html !== want.html) diffs.push(`${route}: html changed`);
    else if (got.css !== want.css) diffs.push(`${route}: css changed`);
  }
  for (const route of Object.keys(snapshot.routes)) if (!expected.routes[route]) diffs.push(`${route}: new route`);
  for (const [asset, want] of Object.entries(expected.assets)) if (snapshot.assets[asset] !== want) diffs.push(`${asset}: changed`);
  if (diffs.length) {
    console.error(diffs.join('\n'));
    process.exit(1);
  }
  console.log(`unchanged: ${Object.keys(snapshot.routes).length} routes, ${Object.keys(snapshot.assets).length} assets`);
}
