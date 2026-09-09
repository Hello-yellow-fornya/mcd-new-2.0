/**
 * Build-level environment helpers.
 *
 * Indexing is not environment-based either: it keys off the build's canonical
 * origin (src/lib/indexing.ts), so a staging domain or a preview indexes
 * nothing without a switch here. VERCEL_ENV is only for things that are about
 * the build: sample reviews, the styleguide route and unsubstantiated claims
 * on previews.
 */
export type VercelEnv = 'production' | 'preview' | 'development' | undefined;

export function isProduction(env: string | undefined = process.env.VERCEL_ENV): boolean {
  return env === 'production';
}
