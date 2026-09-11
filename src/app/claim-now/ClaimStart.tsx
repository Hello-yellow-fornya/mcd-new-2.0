'use client';

import { useEffect, useState } from 'react';
import { ClaimFlow } from '@/components/ClaimFlow/ClaimFlow';
import { RegBox } from '@/components/RegBox/RegBox';
import { track } from '@/lib/analytics';
import { readCampaign } from '@/lib/campaign';
import { formatReg } from '@/lib/reg';
import { site } from '@/lib/site';
import styles from './claim-now.module.css';

type State = { status: 'idle' } | { status: 'sending' } | { status: 'done'; ref: string; reg: string } | { status: 'error'; message: string };

/** The reg box on /claim-now/: posts to the intake endpoint and hands over to the claim flow slot. */
export function ClaimStart() {
  const [state, setState] = useState<State>({ status: 'idle' });
  // The reg from ?reg= is read after mount so the card renders on the server with no layout shift.
  const [initial, setInitial] = useState('');
  useEffect(() => {
    const reg = new URLSearchParams(location.search).get('reg');
    if (reg) setInitial(formatReg(reg));
  }, []);

  async function start(reg: string) {
    setState({ status: 'sending' });
    try {
      const res = await fetch('/api/claim-start/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        // The campaign the visitor arrived with, if any: paid clicks land on
        // /ppc/third-party-claim/ and submit here (src/lib/campaign.ts).
        body: JSON.stringify({ reg, placement: 'claim-now', path: location.pathname, website: '', campaign: readCampaign() ?? undefined }),
      });
      const data = (await res.json()) as { ok: boolean; ref?: string; reg?: string; error?: string };
      if (!res.ok || !data.ok) {
        setState({ status: 'error', message: data.error ?? 'Something went wrong. Call us and we’ll do it together.' });
        return;
      }
      track('claim_start', { ref: data.ref, placement: 'claim-now' });
      setState({ status: 'done', ref: data.ref ?? '', reg: formatReg(data.reg ?? reg) });
    } catch {
      setState({ status: 'error', message: 'We couldn’t reach the server. Call us and we’ll do it together.' });
    }
  }

  return (
    <div className={styles.start} data-testid="claim-start">
      {state.status !== 'done' && <RegBox key={initial} variant="card" defaultValue={initial} placement="claim-now" onSubmit={start} />}
      {state.status === 'sending' && (
        <p className={styles.note} role="status">
          Checking the reg…
        </p>
      )}
      {state.status === 'error' && (
        <p className={styles.error} role="alert">
          {state.message} <a href={site.phone.href}>{site.phone.display}</a>.
        </p>
      )}
      {state.status === 'done' && (
        <div className={styles.done} role="status" data-testid="claim-started">
          <p className={styles.doneH}>Reg {state.reg} received.</p>
          <p className={styles.note}>
            Your reference is <b>{state.ref}</b>. Next, a few questions about what happened.
          </p>
        </div>
      )}
      {/*
        The claim flow, in the slot 1.0 mounts its own into. It follows the reg
        box: the questions open once the reg is accepted, and the reference and
        reg travel with the submission. On submit it goes to
        /claim-now/thank-you/?ref=…, which fires the conversion. The data-*
        attributes stay so anything that expects 1.0's contract still finds them.
      */}
      <div id="claim-flow" data-claim-flow-mount="" data-ref={state.status === 'done' ? state.ref : undefined} data-reg={state.status === 'done' ? state.reg : undefined} className={styles.slot}>
        {state.status === 'done' && <ClaimFlow reg={state.reg} claimRef={state.ref} />}
      </div>
    </div>
  );
}
