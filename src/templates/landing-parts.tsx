import { claimAttrs, claimVisible, getClaim } from '@/lib/claims';
import type { LandingStep } from '@/lib/content/types';

/** Whose claims department the band names. */
export const bands = {
  ours: undefined,
  their: { l0: 'Their insurer has a claims department.', l1: 'It works for them.', chip: 'We work for you.' },
} as const;

/** Splits the title around the highlighted words, if they are in it. */
export function Title({ title, highlight }: { title: string; highlight?: string }) {
  if (!highlight) return <>{title}</>;
  const at = title.indexOf(highlight);
  if (at < 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, at)}
      <span className="hl">{highlight}</span>
      {title.slice(at + highlight.length)}
    </>
  );
}

/** A step's copy: the gated text while its claim may render, else the base; extras added while theirs may. */
export function StepText({ step }: { step: LandingStep }) {
  const gated = step.gated && claimVisible(getClaim(step.gated.claim));
  return (
    <span>
      <strong>{step.title}</strong>{' '}
      {gated && step.gated ? <span {...claimAttrs(getClaim(step.gated.claim))}>{step.gated.text}</span> : step.text}
      {step.extras
        ?.filter((e) => claimVisible(getClaim(e.claim)))
        .map((e) => (
          <span key={e.claim} {...claimAttrs(getClaim(e.claim))}>
            {' '}
            {e.text}
          </span>
        ))}
    </span>
  );
}
