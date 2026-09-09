import { test } from '@playwright/test';

/** The site under test: playwright.config.ts builds the site NEXT_PUBLIC_SITE names (mcd2 by default). */
export const SITE = process.env.NEXT_PUBLIC_SITE || 'mcd2';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || (SITE === 'ocr' ? 'https://ocr-preview.vercel.app' : 'https://mcd-new-2-0.vercel.app');

/** Call at the top of a spec that belongs to one site; the file is skipped on the other. */
export function onlySite(id: 'mcd2' | 'ocr') {
  test.skip(SITE !== id, `${id} only (this build is ${SITE})`);
}
