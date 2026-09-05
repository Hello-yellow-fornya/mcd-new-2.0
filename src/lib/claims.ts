import data from '@/data/claims.json';
import { isProduction } from './staging.ts';

export type Claim = {
  id: string;
  text: string;
  substantiated: boolean;
  evidence: string;
  score?: string;
  count?: string;
};

const claims: Claim[] = data.claims;

export function getClaim(id: string): Claim {
  const c = claims.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown claim "${id}" (src/data/claims.json)`);
  return c;
}

/** A claim is substantiated only with the flag and a reason. */
export function isSubstantiated(c: Claim): boolean {
  return c.substantiated === true && c.evidence.trim().length > 0;
}

/**
 * Whether a claim renders (appendix §6). Production: substantiated only.
 * Previews: everything, and the component marks the unsubstantiated ones so
 * the layout can be reviewed and the gap is visible.
 */
export function claimVisible(c: Claim, production: boolean = isProduction()): boolean {
  return isSubstantiated(c) || !production;
}

/** Attribute to spread on the element showing a claim: marks the unsubstantiated ones on previews. */
export function claimAttrs(c: Claim): { 'data-claim': string; 'data-unsubstantiated'?: '' } {
  return isSubstantiated(c) ? { 'data-claim': c.id } : { 'data-claim': c.id, 'data-unsubstantiated': '' };
}
