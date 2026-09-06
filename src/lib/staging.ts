/**
 * Build-level environment helpers.
 *
 * The staging noindex is host-based (src/lib/host.ts and src/middleware.ts),
 * not VERCEL_ENV-based. VERCEL_ENV is only for things that are about the
 * build rather than the host: the production build guard on the FCA line and
 * unsubstantiated claims on previews (later steps).
 */
export type VercelEnv = 'production' | 'preview' | 'development' | undefined;

export function isProduction(env: string | undefined = process.env.VERCEL_ENV): boolean {
  return env === 'production';
}
