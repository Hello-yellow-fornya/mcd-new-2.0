'use client';

import { useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/Icon/Icon';
import { site } from '@/lib/site';
import { useClaimFlow, type ClaimFlow as Flow } from '@/lib/claim-flow/useClaimFlow';
import { ACCIDENT_Q, PHOTO_STEP, VEHICLE_Q, deadEndContent, isDeadEnd, type Question } from '@/lib/claim-flow/questions';
import styles from './ClaimFlow.module.css';

/**
 * The claim flow (appendix §7). The questions, the branches, the validation
 * and the photo handling are 1.0's, duplicated in src/lib/claim-flow/; this
 * file is the 2.0 skin over them, so the two sites ask the same things and
 * only look different.
 *
 * Steps 1-4: accident, vehicle, the optional photo, contact. It follows the
 * reg box on /claim-now/ and, on submit, hands over to /claim-now/thank-you/,
 * which is where the conversion fires. Two answers end it early: no accident,
 * and an at-fault claim.
 */

/** Progress: four dots, the current one filled, with a count for screen readers. */
function Steps({ step, total }: { step: number; total: number }) {
  return (
    <div className={styles.steps}>
      <p className={styles.stepCount}>
        Step {step} of {total}
      </p>
      <ol className={styles.dots} aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <li key={i} className={styles.dot} data-on={i < step ? '' : undefined} />
        ))}
      </ol>
    </div>
  );
}

function Radio({ q, value, onChange }: { q: Question; value?: string; onChange: (v: string) => void }) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{q.label}</legend>
      {q.help ? <p className={styles.help}>{q.help}</p> : null}
      <div className={styles.options}>
        {q.options.map((o) => (
          <label key={o.v} className={styles.option} data-on={value === o.v ? '' : undefined}>
            <input type="radio" name={q.id} value={o.v} checked={value === o.v} onChange={() => onChange(o.v)} />
            <span className={styles.tick} aria-hidden="true">
              <Icon name="check" />
            </span>
            <span>{o.l}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  error,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string | null;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onBlur'>) {
  const [id] = useState(() => `f-${label.toLowerCase().replace(/\W+/g, '-')}`);
  return (
    <p className={styles.field} data-error={error ? '' : undefined}>
      <label className={styles.fieldLabel} htmlFor={id}>
        {label}
      </label>
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-e` : undefined} {...rest} />
      {error ? (
        <span className={styles.fieldError} id={`${id}-e`}>
          {error}
        </span>
      ) : null}
    </p>
  );
}

/** The hidden file input behind each picker button; resets so the same file can be picked twice. */
function PhotoInput({ inputRef, capture, onSelect }: { inputRef: React.RefObject<HTMLInputElement | null>; capture?: 'environment'; onSelect: (f: File) => void }) {
  return (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      capture={capture}
      className={styles.fileInput}
      tabIndex={-1}
      aria-hidden="true"
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) onSelect(f);
        e.target.value = '';
      }}
    />
  );
}

function PhotoStep({ flow }: { flow: Flow }) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const { photo, addPhoto, clearPhoto } = flow;
  const has = photo.status === 'uploading' || photo.status === 'done';
  return (
    <div>
      <PhotoInput inputRef={cameraRef} capture="environment" onSelect={addPhoto} />
      <PhotoInput inputRef={libraryRef} onSelect={addPhoto} />
      <h3 className={styles.stepH}>
        {PHOTO_STEP.title} <span className={styles.optional}>{PHOTO_STEP.optionalTag}</span>
      </h3>
      <p className={styles.help}>{PHOTO_STEP.help}</p>
      {has ? (
        <div className={styles.photoCard}>
          {/* A local object URL for the file the visitor just chose: next/image cannot optimise it. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.previewUrl ?? ''} alt="Your photo of the vehicle damage" />
          <p className={styles.photoRow}>
            <span>{photo.status === 'done' ? 'Photo added.' : 'Uploading…'}</span>
            <button type="button" onClick={clearPhoto} className={styles.linkBtn}>
              Remove
            </button>
          </p>
        </div>
      ) : (
        <div className={styles.pickers}>
          <button type="button" className={styles.picker} onClick={() => cameraRef.current?.click()}>
            <Icon name="camera" /> Take a photo
          </button>
          <button type="button" className={styles.picker} onClick={() => libraryRef.current?.click()}>
            <Icon name="image" /> Choose from your photos
          </button>
        </div>
      )}
      {photo.status === 'error' && photo.error ? (
        <p className={styles.error} role="alert">
          {photo.error}
        </p>
      ) : null}
      <p className={styles.skipNote}>{PHOTO_STEP.skipNote}</p>
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <div className={styles.card}>{children}</div>;
}

export function ClaimFlow({ reg, claimRef }: { reg?: string; claimRef?: string }) {
  const flow = useClaimFlow({ reg, claimRef });
  const { step, answers, contact, setAns, setCon, touchCon, contactTouched, contactErrors, conDone, photo, next, back, submit, submitting, submitError, totalSteps } = flow;

  const deadEnd = step === 1 && isDeadEnd(answers);
  const deadEndCopy = deadEnd ? deadEndContent(answers, site.phone) : null;
  const isLast = step === 4;
  // The photo step is optional, so it only blocks Continue mid-upload.
  const canNext =
    !deadEnd &&
    ((step === 1 && !!answers.had_accident && !!answers.fault) ||
      (step === 2 && !!answers.drivable && !!answers.replacement) ||
      (step === 3 && photo.status !== 'uploading') ||
      (step === 4 && conDone));
  const nextLabel = isLast
    ? submitting
      ? 'Sending…'
      : 'Submit'
    : step === 3 && photo.status === 'uploading'
      ? 'Uploading…'
      : step === 3 && photo.status !== 'done'
        ? 'Skip this step'
        : 'Continue';

  return (
    <Card>
      <Steps step={step} total={totalSteps} />
      <div className={styles.body}>
        {step === 1 && (
          <>
            <Radio q={ACCIDENT_Q[0]} value={answers.had_accident} onChange={(v) => setAns('had_accident', v)} />
            <Radio q={ACCIDENT_Q[1]} value={answers.fault} onChange={(v) => setAns('fault', v)} />
            {deadEndCopy ? (
              <div className={styles.deadEnd} role="status">
                <b>We can’t take this one online.</b>
                <p>
                  {deadEndCopy.intro}
                  {deadEndCopy.outroBefore}
                  <a href={deadEndCopy.linkHref}>{deadEndCopy.linkLabel}</a>.
                </p>
              </div>
            ) : null}
          </>
        )}
        {step === 2 && (
          <>
            <Radio q={VEHICLE_Q[0]} value={answers.drivable} onChange={(v) => setAns('drivable', v)} />
            <Radio q={VEHICLE_Q[1]} value={answers.replacement} onChange={(v) => setAns('replacement', v)} />
          </>
        )}
        {step === 3 && <PhotoStep flow={flow} />}
        {step === 4 && (
          <div>
            <h3 className={styles.stepH}>Where can we reach you?</h3>
            <p className={styles.help}>We call you back to talk it through. No cost, no commitment.</p>
            {/* Honeypot: hidden from people and from assistive tech; bots that fill every field trip it. */}
            <input type="text" name="website" value={contact.website ?? ''} onChange={(e) => setCon('website', e.target.value)} autoComplete="off" tabIndex={-1} aria-hidden="true" className={styles.fileInput} />
            <Field label="Your name" value={contact.name} onChange={(v) => setCon('name', v)} onBlur={() => touchCon('name')} error={contactTouched.name ? contactErrors.name : null} placeholder="Full name" autoComplete="name" />
            <Field label="Mobile" type="tel" inputMode="numeric" value={contact.phone} onChange={(v) => setCon('phone', v)} onBlur={() => touchCon('phone')} error={contactTouched.phone ? contactErrors.phone : null} placeholder="07700 900123" autoComplete="tel" />
            <Field label="Email" type="email" inputMode="email" value={contact.email} onChange={(v) => setCon('email', v)} onBlur={() => touchCon('email')} error={contactTouched.email ? contactErrors.email : null} placeholder="you@example.com" autoComplete="email" />
            <p className={styles.reassure}>
              <Icon name="shield" /> Encrypted, and never shared without your consent.
            </p>
          </div>
        )}
      </div>
      <div className={styles.nav}>
        {step > 1 ? (
          <button type="button" onClick={back} className={styles.back}>
            Back
          </button>
        ) : null}
        <button type="button" onClick={isLast ? submit : next} disabled={!canNext || submitting} className={styles.next} data-cta={isLast ? 'flow-submit' : 'flow-next'}>
          {nextLabel}
        </button>
      </div>
      {isLast && submitError ? (
        <p className={styles.error} role="alert">
          {submitError}
        </p>
      ) : null}
    </Card>
  );
}
