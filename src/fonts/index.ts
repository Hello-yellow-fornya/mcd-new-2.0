import localFont from 'next/font/local';

/**
 * Self-hosted type (CLAUDE.md §0, pairing C). Both faces are SIL OFL; the
 * licences sit alongside the WOFF2 files. Never load from Google's CDN.
 *
 * display: Archivo Black 400 — headlines, big print, card titles, the band.
 * body:    Archivo 400 / 700 — everything else.
 */
export const display = localFont({
  src: './archivo-black-latin-400-normal.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  preload: true,
  variable: '--font-display',
  adjustFontFallback: 'Arial',
});

export const body = localFont({
  src: [
    { path: './archivo-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './archivo-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  preload: true,
  variable: '--font-body',
  adjustFontFallback: 'Arial',
});
