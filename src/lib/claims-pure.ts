/** The substantiation rule without the data module, so unit tests can import it. */
export type ClaimLike = { substantiated: boolean; evidence: string };

/** A claim is substantiated only with the flag and a reason. */
export function isSubstantiated(c: ClaimLike): boolean {
  return c.substantiated === true && c.evidence.trim().length > 0;
}

/** Whether a claim renders (appendix §6). Production: substantiated only. Previews: everything. */
export function claimVisible(c: ClaimLike, production: boolean): boolean {
  return isSubstantiated(c) || !production;
}
