'use client';

import { useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon/Icon';
import { nav } from '@/data/copy';
import { compactReg, formatReg } from '@/lib/reg';
import { track } from '@/lib/analytics';
import styles from './RegBox.module.css';

type Props = {
  /** field: the white field alone. card: inside the ink reg card. */
  variant?: 'field' | 'card';
  /** Called on submit with the compact reg. Defaults to opening /claim-now/ with ?reg=. */
  onSubmit?: (reg: string) => void;
  defaultValue?: string;
  /** Reported with the reg_submit event. */
  placement?: string;
  className?: string;
};

/**
 * Reg box: white field, "Enter your reg" label inside, AB12 CDE placeholder in
 * Archivo Black, yellow arrow. Formats the plate as you type. Lookup is off
 * (appendix §7): submit hands the reg to claim-now.
 */
export function RegBox({ variant = 'field', onSubmit, defaultValue = '', placement, className }: Props) {
  const id = useId();
  const router = useRouter();
  const [value, setValue] = useState(formatReg(defaultValue));

  function submit(e: FormEvent) {
    e.preventDefault();
    const reg = compactReg(value);
    track('reg_submit', { reg_length: reg.length, placement: placement ?? (variant === 'card' ? 'card' : 'field') });
    if (onSubmit) return onSubmit(reg);
    router.push(reg ? `${nav.claimHref}?reg=${encodeURIComponent(reg)}` : nav.claimHref);
  }

  const field = (
    <form className={[styles.regbox, className].filter(Boolean).join(' ')} onSubmit={submit} data-testid="regbox">
      <div className={styles.field}>
        <div className={styles.in}>
          <label className={styles.label} htmlFor={id}>
            Enter your reg
          </label>
          <input
            id={id}
            name="reg"
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={8}
            placeholder="AB12 CDE"
            value={value}
            onChange={(e) => setValue(formatReg(e.target.value))}
          />
        </div>
        <button type="submit" className={styles.arrow} aria-label="Start your claim">
          <Icon name="arrow" />
        </button>
      </div>
    </form>
  );

  if (variant === 'card') {
    return (
      <div className={`${styles.card} on-dark`}>
        <p className={styles.cardHead}>Enter your reg.</p>
        <p className={styles.cardSub}>The fastest way to start your claim.</p>
        {field}
      </div>
    );
  }
  return field;
}
