'use client';

import { useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon/Icon';
import { track } from '@/lib/analytics';
import { compactReg, formatReg, isPlausibleReg } from '@/lib/reg';
import { site } from '@/lib/site';
import { cta, form as copy } from '../copy';
import styles from './ReportForm.module.css';

type Props = {
  /** Where on the site the report came from, sent with the claim. */
  placement: string;
  id?: string;
  className?: string;
};

function plausibleMobile(raw: string): boolean {
  const digits = raw.replace(/[\s()-]/g, '');
  return /^(\+44\d{9,10}|0\d{9,10})$/.test(digits);
}

/**
 * The report form (ocr-homepage-concept.html .form): registration, name and
 * mobile in a white card, the green "Report it now". It posts to the site's
 * own /api/claim-start/, which forwards to the shared claims API with
 * source "ocr", and then sends the visitor to /report/thank-you/, which
 * fires the conversion.
 */
export function ReportForm({ placement, id = 'report', className }: Props) {
  const uid = useId();
  const router = useRouter();
  const [reg, setReg] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const compact = compactReg(reg);
    if (!isPlausibleReg(compact)) return setError(copy.errors.reg);
    if (name.trim().length < 2) return setError(copy.errors.name);
    if (!plausibleMobile(mobile)) return setError(copy.errors.mobile);
    setError(null);
    setSending(true);
    track('reg_submit', { reg_length: compact.length, placement });
    const website = (new FormData(e.currentTarget).get('website') as string) ?? '';
    try {
      const res = await fetch('/api/claim-start/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reg: compact, name: name.trim(), mobile: mobile.trim(), placement, path: location.pathname, website }),
      });
      const data = (await res.json()) as { ok: boolean; ref?: string; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? copy.errors.server);
        setSending(false);
        return;
      }
      track('claim_start', { ref: data.ref, placement });
      router.push(`/report/thank-you/?ref=${encodeURIComponent(data.ref ?? '')}`);
    } catch {
      setError(copy.errors.network);
      setSending(false);
    }
  }

  return (
    <form id={id} className={[styles.form, className].filter(Boolean).join(' ')} onSubmit={submit} noValidate data-testid="report-form" data-placement={placement}>
      <p className={styles.title}>{copy.title}</p>
      <p className={styles.sub}>{copy.sub}</p>
      <label className={styles.label} htmlFor={`${uid}-reg`}>
        {copy.reg}
        <input
          id={`${uid}-reg`}
          className={styles.input}
          name="reg"
          type="text"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          maxLength={8}
          placeholder={copy.regPlaceholder}
          value={reg}
          onChange={(e) => setReg(formatReg(e.target.value))}
        />
      </label>
      <label className={styles.label} htmlFor={`${uid}-name`}>
        {copy.name}
        <input id={`${uid}-name`} className={styles.input} name="name" type="text" autoComplete="name" placeholder={copy.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className={styles.label} htmlFor={`${uid}-mobile`}>
        {copy.mobile}
        <input id={`${uid}-mobile`} className={styles.input} name="mobile" type="tel" inputMode="tel" autoComplete="tel" placeholder={copy.mobilePlaceholder} value={mobile} onChange={(e) => setMobile(e.target.value)} />
      </label>
      {/* Honeypot: real visitors never see or fill this. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className={styles.hp} defaultValue="" />
      <button type="submit" className={styles.submit} disabled={sending} data-cta="report">
        <span>{sending ? 'Sending…' : cta.reportNow}</span>
        <Icon name="arrow" className={styles.arrow} />
      </button>
      {error ? (
        <p className={styles.error} role="alert">
          {error} <a href={site.phone.href}>{site.phone.display}</a>.
        </p>
      ) : null}
      <small className={styles.fine}>{copy.fine}</small>
    </form>
  );
}
