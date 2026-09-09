import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';

import { snapshotRoutes, snapshotFile } from '../lib/snapshot.mjs';

/**
 * The multi-site refactor must not change what a site serves. Every route's
 * markup and stylesheets (normalised only for the build id and the hashed
 * chunk and stylesheet names) and every generated asset are hashed and
 * compared with the snapshot captured from the build before the refactor.
 *
 * Regenerate deliberately, after a reviewed change to the site, with
 * `pnpm snapshot --write` against a running `pnpm start -p 3100`.
 */
test('the site serves exactly the snapshotted markup, styles and assets', async ({ baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'one fetch per route is enough');
  test.setTimeout(180_000);
  const { site, snapshot } = await snapshotRoutes(baseURL!);
  const file = snapshotFile(site);
  test.skip(!existsSync(file), `no snapshot for ${site} yet`);
  const expected = JSON.parse(readFileSync(file, 'utf8'));
  const changed: string[] = [];
  for (const [route, want] of Object.entries<{ status: number; html: string; css: string }>(expected.routes)) {
    const got = snapshot.routes[route];
    if (!got) changed.push(`${route}: missing`);
    else if (got.status !== want.status) changed.push(`${route}: status ${want.status} → ${got.status}`);
    else if (got.html !== want.html) changed.push(`${route}: markup changed`);
    else if (got.css !== want.css) changed.push(`${route}: styles changed`);
  }
  for (const route of Object.keys(snapshot.routes)) if (!expected.routes[route]) changed.push(`${route}: new route`);
  for (const [asset, want] of Object.entries(expected.assets)) if (snapshot.assets[asset] !== want) changed.push(`${asset}: changed`);
  expect(changed, 'routes or assets that differ from tests/snapshots').toEqual([]);
  expect(Object.keys(snapshot.routes).length).toBe(Object.keys(expected.routes).length);
});
