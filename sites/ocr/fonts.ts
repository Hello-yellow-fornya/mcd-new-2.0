import localFont from 'next/font/local';

/**
 * Online Claims Report type (OCR-brand-guidelines-one-page.html §3): Inter
 * only, 400/600/700/900, self-hosted from @fontsource/inter 5.3.0 (SIL OFL,
 * licence alongside). One family serves display and body, so the one loader
 * sets --font-body and tokens.css points --display at it. The .woff copies of
 * 900 and 700 exist only for the Open Graph renderer, which cannot read WOFF2.
 */
export const body = localFont({
  src: [
    { path: './fonts/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/inter-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: './fonts/inter-latin-900-normal.woff2', weight: '900', style: 'normal' },
  ],
  display: 'swap',
  preload: true,
  variable: '--font-body',
  adjustFontFallback: 'Arial',
});

export const display = body;
