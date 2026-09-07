/** A proof-grid card; `claim` names a src/data/claims.json entry, `fallback` holds the slot while that claim may not show. */
export type ProofCardLike = { [key: string]: unknown; claim?: string; fallback?: ProofCardLike };

export type SelectedCard<C extends ProofCardLike> = { card: C; claimId: string | null };

/**
 * The cards that render (appendix §6): a card whose claim may not show on
 * production gives way to its fallback, so the grid stays 2×2 whether or not
 * the claim has been substantiated; a gated card with no fallback drops out.
 * Pure, so it is unit-tested without the data modules.
 */
export function selectProofCards<C extends ProofCardLike>(cards: readonly C[], claimVisible: (id: string) => boolean): SelectedCard<C>[] {
  const out: SelectedCard<C>[] = [];
  for (const card of cards) {
    if (card.claim && !claimVisible(card.claim)) {
      if (card.fallback) out.push({ card: card.fallback as C, claimId: null });
      continue;
    }
    out.push({ card, claimId: card.claim ?? null });
  }
  return out;
}
