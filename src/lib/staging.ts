/**
 * Build-level environment helpers.
 *
 * Indexing is not environment-based: every page is noindex on every host
 * (src/middleware.ts, src/app/layout.tsx). VERCEL_ENV is only for things that
 * are about the build: sample reviews, the styleguide route and
 * unsubstantiated claims on previews.
 */
export type VercelEnv = 'production' | 'preview' | 'development' | undefined;

export function isProduction(env: string | undefined = process.env.VERCEL_ENV): boolean {
  return env === 'production';
}
