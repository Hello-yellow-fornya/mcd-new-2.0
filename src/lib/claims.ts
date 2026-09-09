import data from '@site/claims.json';
import { isProduction } from './staging.ts';
import * as pure from './claims-pure.ts';

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
  if (!c) throw new Error(`Unknown claim "${id}" (sites/<id>/claims.json)`);
  return c;
}

/** A claim is substantiated only with the flag and a reason. */
export function isSubstantiated(c: Claim): boolean {
  return pure.isSubstantiated(c);
}

/**
 * Whether a claim renders (appendix §6). Production: substantiated only.
 * Previews: everything, so the layout can be reviewed; the unsubstantiated
 * ones carry a data-unsubstantiated attribute (no visible marker) and are
 * listed on /styleguide/.
 */
export function claimVisible(c: Claim, production: boolean = isProduction()): boolean {
  return pure.claimVisible(c, production);
}

/** Attributes to spread on the element showing a claim; data-unsubstantiated is invisible and is for tests and tooling. */
export function claimAttrs(c: Claim): { 'data-claim': string; 'data-unsubstantiated'?: '' } {
  return isSubstantiated(c) ? { 'data-claim': c.id } : { 'data-claim': c.id, 'data-unsubstantiated': '' };
}

/** Every claim, for the styleguide's status list. */
export function allClaims(): Claim[] {
  return claims;
}
